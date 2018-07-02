const messages = require('./proto/messages_pb')

class QuoteGenerator {
  /**
   * Returns a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  generateQuote(sow) {
    throw new Error('Extended classes must implement generateQuote')
  }

  /**
   * Returns whether a contract is valid
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract')
  }
}

module.exports = { QuoteGenerator }
