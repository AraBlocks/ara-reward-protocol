const messages = require('./proto/messages_pb')

// Class defining the required working conditions demanded by (and RPC methods of) a Farmer
class FarmerBase {
  /**
   * Proto RPC method for getting a quote for an SOW
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.Quote)} callback Response callback
   */
  async onSow(call, callback) {
    const sow = call.request
    const valid = await this.validatePeer(sow.getRequester())
    if (valid) {
      const quote = await this.generateQuote(sow)
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
  async onAgreement(call, callback) {
    const agreement = call.request
    const valid = await this.validateAgreement(agreement)
    if (valid) {
      const contract = await this.signAgreement(agreement)
      callback(null, contract)
    } else {
      callback('Error: Invalid Agreement', null)
    }
  }

  /**
   * Proto RPC method for being awarded a contract
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.ARAid)} callback Response callback
   */
  onReward(call, callback) {
    throw new Error('Extended classes must implement onReward.')
  }

  /**
   * This should returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.')
  }

  /**
   * This should return a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  async generateQuote(sow) {
    throw new Error('Extended classes must implement generateQuote.')
  }

  /**
   * This should returns whether or not a agreement is valid.
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  async validateAgreement(agreement) {
    throw new Error('Extended classes must implement validateAgreement.')
  }

  /**
   * This should sign and return a agreement.
   * @param {messages.Agreement} agreement
   * @returns {messages.Agreement}
   */
  async signAgreement(agreement) {
    throw new Error('Extended classes must implement signAgreement.')
  }
}

module.exports = { FarmerBase }
