const messages = require('./proto/messages_pb')

class Authenticator {
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
