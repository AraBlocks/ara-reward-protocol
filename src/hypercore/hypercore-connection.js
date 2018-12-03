const { idify, nonceString } = require('../util')
const { messages } = require('farming-protocol-buffers')
const { PeerConnection } = require('../peer-connection')
const debug = require('debug')('afp:hypercore')

// Helper object for determining message types
const MSG = {
  SOW: 'sow',
  QUOTE: 'quote',
  AGREEMENT: 'agreement',
  REWARD: 'reward',
  RECEIPT: 'receipt'
}

// Class for managing a hypercore feed connection with a peer.
class HypercoreConnection extends PeerConnection {
  constructor(peer, stream, feed, opts) {
    super()

    if (!peer || 'object' !== typeof peer) {
      throw new TypeError('Expecting peer object.')
    } else if (!feed || 'object' !== typeof feed) {
      throw new TypeError('Expecting connection object.')
    }

    this.peer = peer
    this.opts = opts || {}
    this.opts.timeout = this.opts.timeout || 10000
    this.peerId = idify(this.peer.host, this.peer.port)

    this.feed = feed
    this.feed.on('extension', this.onExtension.bind(this))
    this.feed.on('close', this.onClose.bind(this))

    this.stream = stream
    this.stream.peerId = this.peerId
    this.stream.once('end', this.onEnd.bind(this))
    this.stream.once('close', this.onClose.bind(this))
    this.stream.on('error', this.onError.bind(this))

    this.timeout = null
  }

  async sendSow(sow) {
    debug(`Sending Sow: ${nonceString(sow)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.feed.extension(MSG.SOW, sow.serializeBinary())
  }

  async sendQuote(quote) {
    debug(`Sending Quote: ${nonceString(quote)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.feed.extension(MSG.QUOTE, quote.serializeBinary())
  }

  async sendAgreement(agreement) {
    debug(`Sending Agreement: ${nonceString(agreement)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.feed.extension(MSG.AGREEMENT, agreement.serializeBinary())
  }

  async sendReward(reward) {
    debug(`Sending Reward: ${nonceString(reward)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.feed.extension(MSG.REWARD, reward.serializeBinary())
  }

  async sendReceipt(receipt) {
    debug(`Sending Receipt: ${nonceString(receipt)} to ${this.peerId}`)
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.feed.extension(MSG.RECEIPT, receipt.serializeBinary())
  }

  async close() {
    super.close()
    clearTimeout(this.timeout)
    if (this.feed) {
      this.feed.removeListener('extension', this.onExtension.bind(this))
    }
    if (this.stream) {
      this.stream.finalize()
    }
  }

  async onClose() {
    debug(`Feed closed with peer: ${this.peerId}`)
    this.close()
  }

  async onTimeout() {
    debug(`Feed timed out with peer: ${this.peerId}`)
    this.close()
  }

  async onError(err) {
    debug(`Stream error with peer: ${this.peerId}: ${err}`)
    this.close()
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

  onExtension(type, message) {
    try {
      switch (type) {
      case MSG.SOW: this.onSow(messages.SOW.deserializeBinary(message)); break
      case MSG.QUOTE: this.onQuote(messages.Quote.deserializeBinary(message)); break
      case MSG.AGREEMENT: this.onAgreement(messages.Agreement.deserializeBinary(message)); break
      case MSG.REWARD: this.onReward(messages.Reward.deserializeBinary(message)); break
      case MSG.RECEIPT: this.onReceipt(messages.Receipt.deserializeBinary(message)); break
      default: throw new TypeError(`Unknown message type: ${type}`)
      }
      return true
    } catch (e) {
      debug('On Receive Error:', e)
      return false
    }
  }
}

module.exports = { MSG, HypercoreConnection }
