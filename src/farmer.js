/* eslint class-methods-use-this: off */
/* eslint no-unused-vars: off */
const { PeerConnection } = require('./peer-connection')
const { messages } = require('farming-protocol-buffers')
const EventEmitter = require('events')

// Base Farmer class handling connections with requesters
class FarmerBase extends EventEmitter {
  /**
   * Add listeners for requester connection.
   * @param {PeerConnection} connection
   */
  async addRequester(connection) {
    connection.on('sow', sow => this.onSow(sow, connection))
    connection.on('agreement', agreement => this.onAgreement(agreement, connection))
    connection.on('reward', reward => this.onReward(reward, connection))
  }

  /**
   * Handle a sow from a peer
   * @param {messages.SOW} sow
   * @param {PeerConnection} connection
   */
  async onSow(sow, connection) {
    const valid = await this.validateSow(sow)
    if (valid) {
      const quote = await this.generateQuote(sow)
      connection.sendQuote(quote)
    } else {
      this.emit('invalidSow', sow, connection)
    }
  }

  /**
   * Handle an agreement from a peer
   * @param {messages.Agreement} agreement
   * @param {PeerConnection} connection
   */
  async onAgreement(agreement, connection) {
    const valid = await this.validateAgreement(agreement)
    if (valid) {
      const signedAgreement = await this.signAgreement(agreement)
      await connection.sendAgreement(signedAgreement)
      this.onHireConfirmed(agreement, connection)
    } else {
      this.emit('invalidAgreement', agreement, connection)
    }
  }

  /**
   * Handle a reward from a peer
   * @param {messages.Reward} reward
   * @param {PeerConnection} connection
   */
  async onReward(reward, connection) {
    const valid = await this.validateReward(reward)
    if (valid) {
      const receipt = await this.generateReceipt(reward)
      connection.sendReceipt(receipt)
    } else {
      this.emit('invalidReward', reward, connection)
    }
  }

  /**
   * Return whether a sow is valid.
   * @param {messages.SOW} sow
   * @returns {boolean}
   */
  async validateSow(sow) {
    throw new Error('Extended classes must implement validateSow.')
  }

  /**
   * Return whether a reward is valid.
   * @param {messages.Reward} reward
   * @returns {boolean}
   */
  async validateReward(reward) {
    throw new Error('Extended classes must implement validateReward.')
  }

  /**
   * Return whether an agreement is valid.
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  async validateAgreement(agreement) {
    throw new Error('Extended classes must implement validateAgreement.')
  }

  /**
   * Return a receipt given a reward.
   * @param {messages.Reward} reward
   * @returns {messages.Receipt}
   */
  async generateReceipt(reward) {
    throw new Error('Extended classes must implement generateReceipt.')
  }

  /**
   * Return a quote given a sow.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  async generateQuote(sow) {
    throw new Error('Extended classes must implement generateQuote.')
  }

  /**
   * Sign and return an agreement.
   * @param {messages.Agreement} agreement
   * @returns {messages.Agreement}
   */
  async signAgreement(agreement) {
    throw new Error('Extended classes must implement signAgreement.')
  }

  /**
   * Called when an agreement has been marked as valid and a requester
   * is ready to start work.
   * @param {messages.Agreement} agreement
   * @param {PeerConnection} connection
   */
  async onHireConfirmed(agreement, connection) {
    throw new Error('Extended classes must implement onHireConfirmed')
  }
}

module.exports = { FarmerBase }
