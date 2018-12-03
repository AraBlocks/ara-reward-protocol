/* eslint class-methods-use-this: off */
/* eslint no-unused-vars: off */
const { PeerConnection } = require('./peer-connection')
const { messages } = require('reward-protocol-buffers')
const EventEmitter = require('events')

class RequesterBase extends EventEmitter {
  /**
   * Class that handles the communication for requesting a specific SOW
   * for a single task.
   * @param {messages.SOW} sow
   * @param {Matcher} matcher
   */
  constructor(sow, matcher) {
    super()
    this.sow = sow
    this.matcher = matcher
  }

  /**
   * Iterates through an array of Farmers and gets quotes from them for
   * the defined SOW
   * @param {[PeerConnection]} connections
   */
  async addFarmers(connections) {
    connections.forEach((connection) => {
      this.addFarmer(connection)
    })
  }

  /**
   * Gets quotes from a single farmer for the defined SOW
   * @param {PeerConnection} connection
   */
  async addFarmer(connection) {
    connection.on('quote', quote => this.onQuote(quote, connection))
    connection.on('agreement', agreement => this.onAgreement(agreement, connection))
    connection.on('receipt', receipt => this.onReceipt(receipt, connection))

    connection.sendSow(this.sow)
  }

  /**
   * On receipt of a quote from a farmer, asks the defined Matcher to
   * consider the quote and passes to the Matcher a callback for hiring
   * the farmer.
   * @param {messages.Quote} quote
   * @param {PeerConnection} connection
   */
  async onQuote(quote, connection) {
    const self = this
    const valid = await this.validateQuote(quote)
    if (!valid) {
      connection.close()
      this.emit('invalidQuote', quote)
      return
    }

    const match = await this.matcher.addQuote(quote, () => self.hireFarmer(quote, connection))
    if (!match) {
      connection.close()
      return
    }

    connection.once('close', () => self.matcher.removeQuote(quote))
  }

  /**
   * Generates an agreement and sends it to a specific farmer
   * @param {messages.Quote} quote
   * @param {PeerConnection} connection
   */
  async hireFarmer(quote, connection) {
    const agreement = await this.generateAgreement(quote)
    connection.sendAgreement(agreement)
  }

  /**
   * On receipt of a signed (and staked) agreement from farmer, can begin
   * distribution of work.
   * @param {messages.Agreement} agreement
   * @param {PeerConnection} connection
   */
  async onAgreement(agreement, connection) {
    const valid = await this.validateAgreement(agreement)
    if (!valid) {
      connection.close()
      this.emit('invalidAgreement', agreement)
      return
    }

    this.onHireConfirmed(agreement, connection)
  }

  /**
   * Returns whether a quote is valid.
   * @param {messages.Quote} quote
   * @returns {boolean}
   */
  async validateQuote(quote) {
    throw new Error('Extended classes must implement validateQuote.')
  }

  /**
   * Generate and return an agreement for a quote.
   * @param {messages.Quote} quote
   * @returns {messages.Agreement}
   */
  async generateAgreement(quote) {
    throw new Error('Extended classes must implement generateAgreement.')
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
   * Called when an agreement has been marked as valid and a farmer
   * is ready to start work.
   * @param {messages.Agreement} agreement
   * @param {PeerConnection} connection
   */
  async onHireConfirmed(agreement, connection) {
    throw new Error('Extended classes must implement onHireConfirmed')
  }

  /**
   * On receipt of a reward receipt from a farmer.
   * @param {messages.Receipt} receipt
   * @param {PeerConnection} connection
   */
  async onReceipt(receipt, connection) {
    throw new Error('Extended classes must implement onReceipt')
  }
}

module.exports = { RequesterBase }
