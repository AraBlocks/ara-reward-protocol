const { RequesterBase } = require('../../src/requester')
const messages = require('../../src/proto/messages_pb')
const debug = require('debug')('afp:contract-example:requester')

class ExampleRequester extends RequesterBase {
  constructor(sow, matcher, requesterSig, wallet) {
    super(sow, matcher)
    this.requesterSig = requesterSig
    this.wallet = wallet
    this.hiredFarmers = new Map()
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    return true
  }

  /**
   * Generates a contract for quote
   * @param {messages.Quote} quote
   * @returns {messages.Agreement}
   */
  generateAgreement(quote) {
    const agreement = new messages.Agreement()
    agreement.setNonce(`9575`)
    agreement.setQuote(quote)
    agreement.setRequesterSignature(this.requesterSig)
    return agreement
  }

  /**
   * Returns whether a contract is valid.
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  validateAgreement(agreement) {
    return true
  }

  /**
   * On receipt of a signed (and staked) contract from farmer, begins distribution of work
   * @param {messages.Agreement} agreement
   * @param {grpc.Server} server
   */
  onHireConfirmed(agreement, server) {
    const quote = agreement.getQuote()
    const farmerId = quote.getFarmer().getDid()
    this.hiredFarmers.set(farmerId, [ server, agreement ])
    debug(`Requester: Agreement ${Buffer.from(agreement.getNonce()).toString('hex')} signed by farmer ${farmerId}`)
  }

  /**
   * Handles a job on finished
   * @param {Map} report
   */
  onJobFinished(report) {
    this.hiredFarmers.forEach((value, key) => {
      this.awardFarmer(value[0], value[1], report.get(key).units)
    })
  }

  /**
   * Awards farmer for their work
   * @param {grpc.Server} server
   * @param {messages.Agreement} agreement
   * @param {Map} report
   */
  awardFarmer(server, agreement, units) {
    const reward = this.generateReward(agreement, units)
    this.sendReward(server, reward)
  }

  /**
   * Calculates farmer reward
   * @param {messages.ARAid} farmer
   * @param {int} units
   * @param {messages.Quote} quote
   * @returns {messages.Reward}
   */
  generateReward(agreement, units) {
    const quote = agreement.getQuote()
    const amount = quote.getPerUnitCost() * units

    const reward = new messages.Reward()
    reward.setAgreement(agreement)
    reward.setAmount(amount)
    return reward
  }

  /**
   * Submits a reward to the contract, and notifies the farmer that their reward is available for withdraw
   * @param {grpc.Server} server
   * @param {messages.Reward} reward
   */
  sendReward(server, reward) {
    const quote = reward.getAgreement().getQuote()
    const sowId = Buffer.from(quote.getSow().getNonce()).toString('hex')
    const farmerId = quote.getFarmer().getDid()
    const amount = reward.getAmount()

    this.wallet
      .submitReward(sowId, farmerId, amount)
      .then((result) => {
        server.sendReward(reward, (err, response) => {
          if (err) {
            debug(`RequesterExample: fail to notify farmer ${farmerId} about the reward`)
          } else {
            debug(`RequesterExample: farmer ${farmerId} has been notified about the reward delivery`)
          }
        })
      })
      .catch((err) => {
        debug(`RequesterExample: Fail to submit the reward ${amount} to farmer ${farmerId} for job ${sowId}`)
      })
  }
}

module.exports = { ExampleRequester }
