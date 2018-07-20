const { messages, Farmer } = require('ara-farming-protocol')

class ExampleFarmer extends Farmer {
  constructor(farmerId, farmerSig, price, onStartWork) {
    super()
    this.quoteId = 1
    this.price = price
    this.farmerId = farmerId
    this.farmerSig = farmerSig
    this.onStartWork = onStartWork
  }

  /**
   * Returns a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  async generateQuote(sow) {
    console.log(`Received SOW from: ${sow.getRequester().getDid()}`)
    const quote = new messages.Quote()
    quote.setId(this.quoteId)
    quote.setFarmer(this.farmerId)
    quote.setPerUnitCost(this.price)
    quote.setSow(sow)
    return quote
  }

  /**
   * Returns whether a agreement is valid
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  async validateAgreement(agreement) {
    const quote = agreement.getQuote()
    return quote.getPerUnitCost() == this.price
  }

  /**
   * Sign and return a agreement
   * @param {messages.Agreement} agreement
   * @returns {messages.Agreement}
   */
  async signAgreement(agreement) {
    agreement.setFarmerSignature(this.farmerSig)

    // TEMP:
    this.onStartWork(agreement)

    return agreement
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    return true
  }

  async withdrawReward() {
    const sowId = this.reward.getSow().getId()
    const farmerId = this.reward.getFarmer().getDid()
    this.wallet
      .claimReward(sowId, farmerId)
      .then(result => {
        console.log(`ExampleFarmer: ${farmerId} has withdrawn reward`)
      })
      .catch(err => {
        console.log(`ExampleFarmer: ${farmerId} fails to withdrawn reward`)
      })
  }

  /**
   * Handles a reward on noticed of delivery
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.ARAid)} callback Response callback
   */
  handleRewardDelivery(call, callback) {
    this.reward = call.request
    setTimeout(() => {
      this.withdrawReward()
    }, 1000)
    callback(null, this.farmerId)
  }
}

module.exports = { ExampleFarmer }
