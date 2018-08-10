const { messages, afpstream } = require('ara-farming-protocol')
const debug = require('debug')('afp:duplex-example:farmer')
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
    debug('Listening on port ', port)
    const data = Buffer.alloc(4)
    data.writeInt32LE(port, 0)
    agreement.setData(data)
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
    const sowId = reward.getAgreement().getQuote().getSow().getId()
    const farmerDid = this.farmerId.getDid()
    this.wallet
      .claimReward(sowId, farmerDid)
      .then((result) => {
        debug(`Farmer ${farmerDid} has withdrawn reward`)
      })
      .catch((err) => {
        debug(`Farmer ${farmerDid} fails to withdrawn reward`)
      })
  }

  /**
   * This should returns whether a reward is valid.
   * @param {messages.Reward} reward
   * @returns {boolean}
   */
  async validateReward(reward) {
    return true
  }

  /**
   * This should return a receipt given a reward.
   * @param {messages.Reward} reward
   * @returns {messages.Receipt}
   */
  async generateReceipt(reward) {
    this.withdrawReward(reward)
    const receipt = new messages.Receipt()
    receipt.setId(1)
    receipt.setReward(reward)
    receipt.setFarmerSignature(this.farmerSig)
    return receipt
  }
  
}

module.exports = { ExampleFarmer }
