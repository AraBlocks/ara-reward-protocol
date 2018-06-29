const messages = require('./proto/messages_pb')

class QuoteGenerator {
  /**
   * Returns a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  generateQuote(sow) {
    throw new Error('Abstract function called. Extended classes must implement.')
  }
}

module.exports = { QuoteGenerator }
