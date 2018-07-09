const messages = require('./proto/messages_pb')

// Class defining the required working conditions demanded by (and RPC methods of) a Farmer
class Farmer {
  /**
   * Proto RPC method for getting a quote for an SOW
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.Quote)} callback Response callback
   */
  handleQuoteRequest(call, callback) {
    const sow = call.request
    if (this.validatePeer(sow.getRequester())) {
      const quote = this.generateQuote(sow)
      callback(null, quote)
    } else {
      callback('Error: Invalid Auth', null)
    }
  }

  /**
   * Proto RPC method for being awarded a agreement
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.Agreement)} callback Response callback
   */
  handleAgreementReceipt(call, callback) {
    const agreement = call.request
    if (this.validateAgreement(agreement)) {
      callback(null, this.signAgreement(agreement))
    } else {
      callback('Error: Invalid Agreement', null)
    }
  }

  /**
   * This should returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.')
  }

  /**
   * This should return a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  generateQuote(sow) {
    throw new Error('Extended classes must implement generateQuote.')
  }

  /**
   * This should returns whether or not a agreement is valid.
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  validateAgreement(agreement) {
    throw new Error('Extended classes must implement validateAgreement.')
  }

  /**
   * This should sign and return a agreement.
   * @param {messages.Agreement} agreement
   * @returns {messages.Agreement}
   */
  signAgreement(agreement) {
    throw new Error('Extended classes must implement signAgreement.')
  }
}

module.exports = { Farmer }
