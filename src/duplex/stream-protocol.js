const duplexify = require('duplexify')
const messages = require('../proto/messages_pb')
const through2 = require('through2')
const varint = require('varint')
const debug = require('debug')('afp:stream')

require('events').EventEmitter.defaultMaxListeners = 15

// Helper object for determining message types
const MSG = {
  SOW: { head: 1 << 1, str: 'sow' },
  QUOTE: { head: 2 << 1, str: 'quote' },
  AGREEMENT: { head: 3 << 1, str: 'agreement' },
  REWARD: { head: 4 << 1, str: 'reward' },
  RECEIPT: { head: 5 << 1, str: 'receipt' },

  encode(head, data) {
    head = Buffer.from(varint.encode(head))
    return Buffer.concat([ head, data ])
  },

  decode(chunk) {
    const head = varint.decode(chunk, 0)
    const data = chunk.slice(varint.decode.bytes)
    return { head, data }
  }
}

// Class that mimics RPC Client functionality with duplex streams for afp
class StreamProtocol {
  constructor(peer, opts) {
    this.peer = peer
    this.opts = opts

    this.receiver = through2({ autoDestroy: false }, this.onReceive.bind(this))
    this.sender = through2({ autoDestroy: false })
    this.stream = duplexify(this.receiver, this.sender, { autoDestroy: false })
    this.stream.once('end', this.onEnd.bind(this))
    this.stream.once('close', this.onClose.bind(this))

    this.timeout = null
    this.ended = false
  }

  async sendSow(sow) {
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.SOW.head, sow.serializeBinary()))
  }

  async sendQuote(quote) {
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.QUOTE.head, quote.serializeBinary()))
  }

  async sendAgreement(agreement) {
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.AGREEMENT.head, agreement.serializeBinary()))
  }

  async sendReward(reward) {
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.REWARD.head, reward.serializeBinary()))
  }

  async sendReceipt(receipt) {
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.RECEIPT.head, receipt.serializeBinary()))
  }

  async onTimeout() {
    debug('Stream timed out with peer:', this.peer.host, this.peer.port)
    if (this.stream) this.stream.destroy(new Error('Protocol stream did timeout.'))
  }

  async onClose() {
    debug('Stream closed with peer:', this.peer.host, this.peer.port)
    clearTimeout(this.timeout)
    if (this.stream) this.stream.destroy()
  }

  async onEnd() {
    debug('Stream ended with peer:', this.peer.host, this.peer.port)
    clearTimeout(this.timeout)
    if (this.stream) this.stream.destroy()
  }

  async onSow(sow, done) {
    done(null)
    debug('On Sow:', sow.getId(), this.peer.host, this.peer.port)
    this.stream.emit(MSG.SOW.str, sow, this.peer)
  }

  async onQuote(quote, done) {
    done(null)
    debug('On Quote:', quote.getId(), this.peer.host, this.peer.port)
    this.stream.emit(MSG.QUOTE.str, quote, this.peer)
  }

  async onAgreement(agreement, done) {
    done(null)
    debug('On Agreement:', agreement.getId(), this.peer.host, this.peer.port)
    this.stream.emit(MSG.AGREEMENT.str, agreement, this.peer)
  }

  async onReward(reward, done) {
    done(null)
    debug('On Reward:', reward.getId(), this.peer.host, this.peer.port)
    this.stream.emit(MSG.REWARD.str, reward, this.peer)
  }

  async onReceipt(receipt, done) {
    done(null)
    debug('On Receipt:', receipt.getId(), this.peer.host, this.peer.port)
    this.stream.emit(MSG.RECEIPT.str, receipt, this.peer)
  }

  onReceive(chunk, enc, done) {
    try {
      const { head, data } = MSG.decode(chunk)
      clearTimeout(this.timeout)
      switch (head) {
      case MSG.SOW.head: this.onSow(messages.SOW.deserializeBinary(data), done); break
      case MSG.QUOTE.head: this.onQuote(messages.Quote.deserializeBinary(data), done); break
      case MSG.AGREEMENT.head: this.onAgreement(messages.Agreement.deserializeBinary(data), done); break
      case MSG.REWARD.head: this.onReward(messages.Reward.deserializeBinary(data), done); break
      case MSG.RECEIPT.head: this.onReceipt(messages.Receipt.deserializeBinary(data), done); break
      default: throw new TypeError(`Unknown message type: ${head}`)
      }
    } catch (e) {
      debug('On Receive Error:', e)
    }
  }

  close() {
    if (this.stream) this.stream.emit('close')
  }
}

module.exports = {
  StreamProtocol,
  MSG
}
