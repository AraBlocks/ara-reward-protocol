const { Requester } = require('../../src/requester')
const messages = require('../../src/proto/messages_pb')

class ExampleRequester extends Requester {
  constructor(sow, matcher, requesterSig) {
    super(sow, matcher)
    this.badFarmerId = 'ara:did:2'
    this.contractId = 101
    this.requesterSig = requesterSig
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    const farmerId = peer.getDid()
    if (farmerId == this.badFarmerId) {
      console.log(`Requester: Invalid farmer ${farmerId}`)
      return false
    }
    return true
  }

  /**
   * Generates a contract for quote
   * @param {messages.Quote} quote
   * @returns {messages.Contract}
   */
  generateContract(quote) {
    const contract = new messages.Contract()
    contract.setId(this.contractId)
    contract.setQuote(quote)
    contract.setRequesterSignature(this.requesterSig)
    return contract
  }

  /**
   * Returns whether a contract is valid.
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    if (contract.getId() == this.contractId) return true
    return false
  }

  /**
   * This is called when a contract has been marked as valid and a farmer
   * is ready to start work
   * @param {messages.Contract} contract
   * @param {services.RFPClient} farmer
   */
  onHireConfirmed(contract, farmer) {
    console.log(`Requester: Contract ${contract.getId()} signed by farmer ${contract.getQuote().getFarmer().getDid()}`)
  }
}

module.exports = { ExampleRequester }
