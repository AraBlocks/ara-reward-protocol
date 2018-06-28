const messages = require('../proto/messages_pb')

class Authenticator {
  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} contract
   * @returns {boolean}
   */
  validatePeer(peer) {
    throw new Error('Extended classes must implement validateContract.')
  }

  /**
   * Returns whether a contract is valid.
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract.')
  }
}

module.exports = { Authenticator }
