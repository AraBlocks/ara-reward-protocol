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

<<<<<<< HEAD
  /**
   * Proto RPC method for being awarded a contract
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.ARAid)} callback Response callback
   */
  handleRewardDelivery(call, callback) {
    throw new Error('Extended classes must implement handleRewardDelivery.')
  }

=======
>>>>>>> master
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
   * This should returns whether or not a contract is valid.
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract.')
  }

  /**
   * This should sign and return a contract.
   * @param {messages.Contract} contract
   * @returns {messages.Contract}
   */
  signContract(contract) {
    throw new Error('Extended classes must implement signContract.')
  }
}

module.exports = { Farmer }
