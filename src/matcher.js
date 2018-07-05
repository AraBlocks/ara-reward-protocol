const messages = require('./proto/messages_pb')

class Matcher {
  /**
   * This is called to validate a quote. If a quote is considered
   * valid, then this should calls hireFarmerCallback to continue
   * contract award process.
   * @param {messages.Quote} quote
   * @param {function(messages.Contract)} hireFarmerCallback
   */
  validateQuote(quote, hireFarmerCallback) {
    throw new Error('Extended classes must implement validateQuote')
  }

  /**
   * This is called when a quote is no longer valid.
   * @param {messages.Quote} quote
   */
  invalidateQuote(quote) {
    throw new Error('Extended classes must implement invalidateQuote')
  }
}

module.exports = { Matcher }
