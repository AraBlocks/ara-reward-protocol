const { idify, nonceString } = require('../util')
const { messages } = require('farming-protocol-buffers')
const { PeerConnection } = require('../peer-connection')
const varint = require('varint')
const debug = require('debug')('afp:duplex')

/*
* Messages are consistent with hypercore-protocol:
*   length | numeric-feed-id << 4 | numeric-type | user-type | payload
*   where numeric-type == 15 (user defined)
*   https://github.com/mafintosh/hypercore-protocol/blob/master/schema.proto
*/

const HYPERCORE_USER_TYPE = 15

// Note: communicates over the 0th feed
const FEED_ID = 0

// Helper object for determining message types
const MSG = {
  SOW: { type: 1, str: 'sow' },
  QUOTE: { type: 2, str: 'quote' },
  AGREEMENT: { type: 3, str: 'agreement' },
  REWARD: { type: 4, str: 'reward' },
  RECEIPT: { type: 5, str: 'receipt' },

  encode(type, data) {
    // eslint-disable-next-line no-bitwise
    const id = Buffer.from(varint.encode(FEED_ID << 4))
    type = Buffer.from(varint.encode(type))
    const hyperType = Buffer.from(varint.encode(HYPERCORE_USER_TYPE))
    const length = Buffer.from(varint.encode(id.length + hyperType.length + type.length + data.length))
    return Buffer.concat([ length, id, hyperType, type, data ])
  },

  decode(chunk) {
    const length = varint.decode(chunk)

    let data = chunk.slice(varint.decode.bytes)
    const id = varint.decode(data)

    data = data.slice(varint.decode.bytes)
    const hyperType = varint.decode(data)

    data = data.slice(varint.decode.bytes)
    const type = varint.decode(data)

    data = data.slice(varint.decode.bytes)

    return {
      length, id, hyperType, type, data
    }
  }
}

// Class for managing a duplex stream connection to a peer.
class DuplexConnection extends PeerConnection {
  constructor(peer, connection, opts) {
    super()

    if (!peer || 'object' !== typeof peer) {
      throw new TypeError('Expecting peer object.')
    } else if (!connection || 'object' !== typeof connection) {
      throw new TypeError('Expecting connection object.')
    }

    this.peer = peer
    this.opts = opts || {}
    this.opts.timeout = this.opts.timeout || 10000
    this.peerId = idify(this.peer.host, this.peer.port)

    this.stream = connection
    this.stream.on('data', this.onData.bind(this))
    this.stream.once('end', this.onEnd.bind(this))
    this.stream.once('close', this.onClose.bind(this))

    this.timeout = null
  }

  async sendSow(sow) {
    debug(`Sending Sow: ${nonceString(sow)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.SOW.type, sow.serializeBinary()))
  }

  async sendQuote(quote) {
    debug(`Sending Quote: ${nonceString(quote)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.QUOTE.type, quote.serializeBinary()))
  }

  async sendAgreement(agreement) {
    debug(`Sending Agreement: ${nonceString(agreement)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.AGREEMENT.type, agreement.serializeBinary()))
  }

  async sendReward(reward) {
    debug(`Sending Reward: ${nonceString(reward)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.REWARD.type, reward.serializeBinary()))
  }

  async sendReceipt(receipt) {
    debug(`Sending Receipt: ${nonceString(receipt)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.write(MSG.encode(MSG.RECEIPT.type, receipt.serializeBinary()))
  }

  async close() {
    super.close()
    if (this.stream) this.stream.destroy()
  }

  async onTimeout() {
    debug(`Stream timed out with peer: ${this.peerId}`)
    if (this.stream) {
      this.stream.emit('timeout', this.peer)
      this.stream.destroy()
    }
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
      const {
        id, hyperType, type, data
      } = MSG.decode(chunk)
      if (HYPERCORE_USER_TYPE != hyperType || FEED_ID != id) return false

      switch (type) {
      case MSG.SOW.type: this.onSow(messages.SOW.deserializeBinary(data)); break
      case MSG.QUOTE.type: this.onQuote(messages.Quote.deserializeBinary(data)); break
      case MSG.AGREEMENT.type: this.onAgreement(messages.Agreement.deserializeBinary(data)); break
      case MSG.REWARD.type: this.onReward(messages.Reward.deserializeBinary(data)); break
      case MSG.RECEIPT.type: this.onReceipt(messages.Receipt.deserializeBinary(data)); break
      default: throw new TypeError(`Unknown message type: ${type}`)
      }
      return true
    } catch (e) {
      debug('On Receive Error:', e)
      return false
    }
  }
}

module.exports = {
  DuplexConnection,
  MSG
}
