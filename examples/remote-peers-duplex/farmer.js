const { messages, afpstream } = require('ara-farming-protocol')
const pify = require('pify')
const fp = require('find-free-port')
const ip = require('ip')

class ExampleFarmer extends afpstream.Farmer {
  constructor(farmerId, farmerSig, price, startWork, wallet) {
    super()
    this.badRequesterId = 10057
    this.quoteId = 1
    this.price = price
    this.farmerId = farmerId
    this.farmerSig = farmerSig
    this.startWork = startWork
    this.wallet = wallet
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
    const port = await pify(fp)(Math.floor(30000 * Math.random()), ip.address())
    console.log('Listening on port ', port)
    agreement.setId(port) // HACK
    this.startWork(port)
    return agreement
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    const requesterId = peer.getDid()
    return requesterId != this.badRequesterId
  }

  async withdrawReward(reward) {
    const sowId = reward.getSow().getId()
    const farmerId = reward.getFarmer().getDid()
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
    const reward = call.request
    this.withdrawReward(reward)
    callback(null, this.farmerId)
  }
}

module.exports = { ExampleFarmer }
