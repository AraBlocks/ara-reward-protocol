/* eslint class-methods-use-this: 1 */
const { FarmerBase } = require('../../../src/farmer')
const messages = require('../../../src/proto/messages_pb')
const debug = require('debug')('afp:contract-example:farmer')
const sinon = require('sinon')
const test = require('ava')

class ExampleFarmer extends FarmerBase {
  constructor(farmerId, farmerSig, price, wallet) {
    super()
    this.price = price
    this.farmerId = farmerId
    this.farmerSig = farmerSig
    this.wallet = wallet
  }

  /**
   * Returns a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  generateQuote(sow) {
    const quote = new messages.Quote()
    quote.setNonce('6345')
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
    if (agreement) return true
    return false
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
    if (peer) return true
    return false
  }

  async validateReward(reward) {
    if (reward) return true
    return false
  }

  async withdrawReward(reward) {
    const sowId = Buffer.from(reward.getAgreement().getQuote().getSow().getNonce()).toString('hex')
    const farmerDid = this.farmerId.getDid()
    this.wallet
      .claimReward(sowId, farmerDid)
      .then(() => {
        debug(`Farmer ${farmerDid} has withdrawn reward`)
      })
      .catch((err) => {
        debug(`Farmer ${farmerDid} failed to withdraw reward`)
        debug(err)
      })
  }

  /**
   * This should return a receipt given a reward.
   * @param {messages.Reward} reward
   * @returns {messages.Receipt}
   */
  async generateReceipt(reward) {
    this.withdrawReward(reward)
    const receipt = new messages.Receipt()
    receipt.setNonce('9052')
    receipt.setReward(reward)
    receipt.setFarmerSignature(this.farmerSig)
    return receipt
  }
}

const farmer = new ExampleFarmer(null, new messages.Signature(), 1, null)

test('farmer.generateReceipt', (t) => {
  const reward = new messages.Reward()

  const stubWithdraw = sinon.fake()

  sinon.stub(farmer, 'withdrawReward').callsFake(stubWithdraw)
  farmer.generateReceipt(reward)

  t.true(stubWithdraw.calledOnce)
})

module.exports = { ExampleFarmer }
