/* eslint class-methods-use-this: off */
/* eslint no-unused-vars: off */
const { messages } = require('farming-protocol-buffers')

class MatcherBase {
  /**
   * Add a quote for consideration. If a quote is considered
   * valid, then call hireFarmerCallback to continue
   * agreement process.
   * @param {messages.Quote} quote
   * @param {function(messages.Agreement)} hireFarmerCallback
   */
  async addQuote(quote, hireFarmerCallback) {
    throw new Error('Extended classes must implement addQuote')
  }

  /**
   * Remove quote from consideration.
   * @param {messages.Quote} quote
   */
  async removeQuote(quote) {
    throw new Error('Extended classes must implement removeQuote')
  }
}

module.exports = { MatcherBase }
