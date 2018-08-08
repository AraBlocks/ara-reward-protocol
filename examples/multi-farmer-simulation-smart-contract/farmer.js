const { FarmerBase } = require('../../src/farmer')
const messages = require('../../src/proto/messages_pb')

class ExampleFarmer extends FarmerBase {
  constructor(farmerId, farmerSig, price, wallet) {
    super()
    this.quoteId = 1
    this.price = price
    this.farmerId = farmerId
    this.farmerSig = farmerSig
    this.wallet = wallet
    this.reward = null
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
   * Returns whether an agreement is valid
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  validateAgreement(agreement) {
    return true
  }

  /**
   * Sign and return a contract
   * @param {messages.Agreement} agreement
   * @returns {messages.Agreement}
   */
  signAgreement(agreement) {
    agreement.setFarmerSignature(this.farmerSig)
    return agreement
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    return true
  }

  async withdrawReward() {
    const sowId = this.reward.getSow().getId()
    const farmerId = this.reward.getFarmer().getDid()
    this.wallet
      .claimReward(sowId, farmerId)
      .then((result) => {
        console.log(`ExampleFarmer: ${farmerId} has withdrawn reward`)
      })
      .catch((err) => {
        console.log(`ExampleFarmer: ${farmerId} fails to withdrawn reward`)
      })
  }

  /**
   * Handles a reward on noticed of delivery
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.ARAid)} callback Response callback
   */
  onReward(call, callback) {
    this.reward = call.request
    this.withdrawReward()
    callback(null, this.farmerId)
  }
}

module.exports = { ExampleFarmer }
