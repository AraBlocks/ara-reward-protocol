/* eslint class-methods-use-this: off */
/* eslint no-unused-vars: off */
const { messages } = require('farming-protocol-buffers')
const EventEmitter = require('events')

// Abstract Class for managing connection to peer
class PeerConnection extends EventEmitter {
/**
 * Send sow to peer.
 * @param {messages.SOW} sow
 */
  async sendSow(sow) {
    throw new Error('Extended classes must implement sendSow.')
  }

  /**
   * Send quote to peer.
   * @param {messages.Quote} quote
   */
  async sendQuote(quote) {
    throw new Error('Extended classes must implement sendQuote.')
  }

  /**
   * Send agreement to peer.
   * @param {messages.Agreement} agreement
   */
  async sendAgreement(agreement) {
    throw new Error('Extended classes must implement sendAgreement.')
  }

  /**
   * Send reward to peer.
   * @param {messages.Reward} reward
   */
  async sendReward(reward) {
    throw new Error('Extended classes must implement sendReward.')
  }

  /**
   * Send receipt to peer.
   * @param {messages.Receipt} receipt
   */
  async sendReceipt(receipt) {
    throw new Error('Extended classes must implement sendReceipt.')
  }

  // Close the connection with the peer.
  async close() {
    this.emit('close')
  }

  async onSow(sow) {
    this.emit('sow', sow)
  }

  async onQuote(quote) {
    this.emit('quote', quote)
  }

  async onAgreement(agreement) {
    this.emit('agreement', agreement)
  }

  async onReward(reward) {
    this.emit('reward', reward)
  }

  async onReceipt(receipt) {
    this.emit('receipt', receipt)
  }
}

module.exports = {
  PeerConnection
}
