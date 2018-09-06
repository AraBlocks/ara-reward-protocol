const { idify, nonceString } = require('../util')
const { messages } = require('farming-protocol-buffers')
const { PeerConnection } = require('../peer-connection')
const varint = require('varint')
const debug = require('debug')('afp:duplex')

// Helper object for determining message types
const MSG = {
  SOW: { head: 1, str: 'sow' },
  QUOTE: { head: 2, str: 'quote' },
  AGREEMENT: { head: 3, str: 'agreement' },
  REWARD: { head: 4, str: 'reward' },
  RECEIPT: { head: 5, str: 'receipt' },

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

// Class for managing a duplex stream connection to a peer.
class DuplexConnection extends PeerConnection {
  constructor(peer, connection, opts) {
    super()
    this.peer = peer || {}
    this.opts = opts || {}
    this.opts.timeout = this.opts.timeout || 10000
    this.peerId = idify(this.peer.host, this.peer.port)

    this.stream = connection
    this.stream.on('data', this.onData.bind(this))
    this.stream.once('end', this.onEnd.bind(this))
    this.stream.once('close', this.onClose.bind(this))

    this.timeout = null
    this.ended = false
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
    this.stream.emit('timeout', this.peer)
    if (this.stream) this.stream.destroy()
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
    clearTimeout(this.timeout)
    debug(`On Sow: ${nonceString(sow)} from ${this.peerId}`)
    super.onSow(sow)
  }

  async onQuote(quote) {
    clearTimeout(this.timeout)
    debug(`On Quote: ${nonceString(quote)} from ${this.peerId}`)
    super.onQuote(quote)
  }

  async onAgreement(agreement) {
    clearTimeout(this.timeout)
    debug(`On Agreement: ${nonceString(agreement)} from ${this.peerId}`)
    super.onAgreement(agreement)
  }

  async onReward(reward) {
    clearTimeout(this.timeout)
    debug(`On Reward: ${nonceString(reward)} from ${this.peerId}`)
    super.onReward(reward)
  }

  async onReceipt(receipt) {
    clearTimeout(this.timeout)
    debug(`On Receipt: ${nonceString(receipt)} from ${this.peerId}`)
    super.onReceipt(receipt)
  }

  onData(chunk) {
    try {
      const { head, data } = MSG.decode(chunk)
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
  DuplexConnection,
  MSG
}
