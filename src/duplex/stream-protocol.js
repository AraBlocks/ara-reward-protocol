const duplexify = require('duplexify')
const messages = require('../proto/messages_pb')
const through2 = require('through2')
const varint = require('varint')
const debug = require('debug')('afp:duplex')
const { idify, nonceString } = require('./util')
const pumpify = require('pumpify')

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
  constructor(peer, socket, opts) {
    this.peer = peer
    this.opts = opts
    this.peerId = idify(this.peer.host, this.peer.port)

    const reader = opts.reader || through2()
    reader.on('data', this.onData.bind(this))

    const writer = opts.writer || through2()

    this.timeout = null
    this.ended = false

    this.stream = pumpify(writer, socket, reader)
    this.stream.once('end', this.onEnd.bind(this))
    this.stream.once('close', this.onClose.bind(this))
  }

  async sendSow(sow) {
    debug(`Sending Sow: ${nonceString(sow)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.SOW.head, sow.serializeBinary()))
  }

  async sendQuote(quote) {
    debug(`Sending Quote: ${nonceString(quote)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.QUOTE.head, quote.serializeBinary()))
  }

  async sendAgreement(agreement) {
    debug(`Sending Agreement: ${nonceString(agreement)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.AGREEMENT.head, agreement.serializeBinary()))
  }

  async sendReward(reward) {
    debug(`Sending Reward: ${nonceString(reward)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.REWARD.head, reward.serializeBinary()))
  }

  async sendReceipt(receipt) {
    debug(`Sending Receipt: ${nonceString(receipt)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.RECEIPT.head, receipt.serializeBinary()))
  }

  async onTimeout() {
    debug(`Stream timed out with peer: ${this.peerId}`)
    if (this.stream) this.stream.destroy(new Error('Protocol stream did timeout.'))
  }

  async onClose() {
    debug(`Stream closed with peer: ${this.peerId}`)
    clearTimeout(this.timeout)
    if (this.stream) this.stream.destroy()
  }

  async onEnd() {
    debug(`Stream ended with peer: ${this.peerId}`)
    clearTimeout(this.timeout)
    if (this.stream) this.stream.destroy()
  }

  async onSow(sow) {
    debug(`On Sow: ${nonceString(sow)} from ${this.peerId}`)
    this.stream.emit(MSG.SOW.str, sow, this.peer)
  }

  async onQuote(quote) {
    debug(`On Quote: ${nonceString(quote)} from ${this.peerId}`)
    this.stream.emit(MSG.QUOTE.str, quote, this.peer)
  }

  async onAgreement(agreement) {
    debug(`On Agreement: ${nonceString(agreement)} from ${this.peerId}`)
    this.stream.emit(MSG.AGREEMENT.str, agreement, this.peer)
  }

  async onReward(reward) {
    debug(`On Reward: ${nonceString(reward)} from ${this.peerId}`)
    this.stream.emit(MSG.REWARD.str, reward, this.peer)
  }

  async onReceipt(receipt) {
    debug(`On Receipt: ${nonceString(receipt)} from ${this.peerId}`)
    this.stream.emit(MSG.RECEIPT.str, receipt, this.peer)
  }

  onData(chunk) {
    try {
      const { head, data } = MSG.decode(chunk)
      clearTimeout(this.timeout)
      switch (head) {
        case MSG.SOW.head: this.onSow(messages.SOW.deserializeBinary(data)); break
        case MSG.QUOTE.head: this.onQuote(messages.Quote.deserializeBinary(data)); break
        case MSG.AGREEMENT.head: this.onAgreement(messages.Agreement.deserializeBinary(data)); break
        case MSG.REWARD.head: this.onReward(messages.Reward.deserializeBinary(data)); break
        case MSG.RECEIPT.head: this.onReceipt(messages.Receipt.deserializeBinary(data)); break
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
