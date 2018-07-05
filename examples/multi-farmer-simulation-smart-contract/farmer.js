const { Farmer } = require('../../src/farmer')
const messages = require('../../src/proto/messages_pb')

class ExampleFarmer extends Farmer {
  constructor(farmerId, farmerSig, price) {
    super()
    this.badRequesterId = 10057
    this.quoteId = 1
    this.price = price
    this.farmerId = farmerId
    this.farmerSig = farmerSig
  }

  /**
   * Returns a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  generateQuote(sow) {
    const quote = new messages.Quote()
    quote.setId(this.quoteId)
    quote.setFarmer(this.farmerId)
    quote.setPerUnitCost(this.price)
    quote.setSow(sow)
    return quote
  }

  /**
   * Returns whether a contract is valid
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    const quote = contract.getQuote()
    if (quote.getPerUnitCost() == this.price) return true
    return false
  }

  /**
   * Sign and return a contract
   * @param {messages.Contract} contract
   * @returns {messages.Contract}
   */
  signContract(contract) {
    contract.setFarmerSignature(this.farmerSig)
    return contract
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    const requesterId = peer.getDid()
    if (requesterId == this.badRequesterId) {
      console.log(`Farmer: Invalid requester ${requesterId}`)
      return false
    }
    return true
  }
}

module.exports = { ExampleFarmer }
