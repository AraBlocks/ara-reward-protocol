const messages = require('./proto/messages_pb')

class ContractGenerator {
  /**
   * Returns whether a contract is valid.
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract.')
  }

  /**
   * Generates a contract for quote
   * @param {messages.Quote} quote 
   * @returns {messages.Contract}
   */
  generateContract(quote) {
    throw new Error('Extended classes must implement generateContract.')
  }
}

module.exports = { ContractGenerator }