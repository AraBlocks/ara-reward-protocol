const messages = require('../proto/messages_pb')

class Matcher {
  /**
   * Calls hireFarmerCallback if quote is acceptable
   * @param {messages.Quote} quote
   * @param {function} hireFarmerCallback
   */
  //
  considerQuoteOption(quote, hireFarmerCallback) {
    throw new Error('Abstract function called. Extended classes must implement.')
  }

  invalidateQuoteOption(quote) {
    throw new Error('Abstract function called. Extended classes must implement.')
  }
}

module.exports = { Matcher }
