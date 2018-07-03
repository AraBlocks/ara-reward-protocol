const messages = require('./proto/messages_pb')

class Matcher {
  /**
   * Calls hireFarmerCallback if quote is acceptable
   * @param {messages.Quote} quote
   * @param {function(messages.Contract)} hireFarmerCallback
   */
  //
  validateQuote(quote, hireFarmerCallback) {
    throw new Error('Extended classes must implement validateQuote')
  }

  /**
   * Removes quote from pool of options
   * @param {messages.Quote} quote
   */
  invalidateQuote(quote) {
    throw new Error('Extended classes must implement invalidateQuote')
  }
}

module.exports = { Matcher }
