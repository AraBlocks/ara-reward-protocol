const messages = require('./proto/messages_pb')

class MatcherBase {
  /**
   * This is called to validate a quote. If a quote is considered
   * valid, then this should calls hireFarmerCallback to continue
   * agreement process.
   * @param {messages.Quote} quote
   * @param {function(messages.Agreement)} hireFarmerCallback
   */
  async validateQuote(quote, hireFarmerCallback) {
    throw new Error('Extended classes must implement validateQuote')
  }

  /**
   * This is called when a quote is no longer valid.
   * @param {messages.Quote} quote
   */
  async invalidateQuote(quote) {
    throw new Error('Extended classes must implement invalidateQuote')
  }
}

module.exports = { MatcherBase }
