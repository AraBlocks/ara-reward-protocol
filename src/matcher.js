/* eslint class-methods-use-this: off */
/* eslint no-unused-vars: off */
const { messages } = require('reward-protocol-buffers')

class MatcherBase {
  /**
   * Add a quote for consideration. If a quote is considered
   * valid, then call callback() to continue the agreement process.
   * @param {messages.Quote} quote
   * @param {function(messages.Agreement)} callback
   * @returns {boolean} Returns whether quote was added
   */
  async addQuote(quote, callback) {
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
