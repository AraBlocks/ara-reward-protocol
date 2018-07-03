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
   * Proto RPC method for being awarded a contract
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.Contract)} callback Response callback
   */
  handleContractAward(call, callback) {
    const contract = call.request
    if (this.validateContract(contract)) {
      callback(null, this.signContract(contract))
    } else {
      callback('Error: Invalid Contract', null)
    }
  }

  /**
   * Returns a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  generateQuote(sow) {
    throw new Error('Extended classes must implement generateQuote.')
  }

  /**
   * Returns whether a contract is valid
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract.')
  }

  /**
   * Sign and return a contract
   * @param {messages.Contract} contract
   * @returns {messages.Contract}
   */
  signContract(contract) {
    throw new Error('Extended classes must implement signContract.')
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.')
  }
}

module.exports = { Farmer }
