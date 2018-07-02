const messages = require('./proto/messages_pb')

class Matcher {
  /**
   * Calls hireFarmerCallback with generated contract if quote is acceptable
   * @param {messages.Quote} quote
   * @param {function(messages.Contract)} hireFarmerCallback
   */
  //
  considerQuoteOption(quote, hireFarmerCallback) {
    throw new Error('Abstract function called. Extended classes must implement.')
  }

  /**
   * Removes quote from pool of options
   * @param {messages.Quote} quote
   */
  invalidateQuoteOption(quote) {
    throw new Error('Abstract function called. Extended classes must implement.')
  }

  /**
   * Called when a contract has been marked as valid and ready to start work
   * @param {messages.Contract} contract
   */
  onHireConfirmed(contract) {
    throw new Error('Abstract function called. Extended classes must implement.')
  }
}

module.exports = { Matcher }
