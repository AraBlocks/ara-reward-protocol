const { RequesterBase } = require('../../src/requester')
const messages = require('../../src/proto/messages_pb')

class ExampleRequester extends RequesterBase {
  constructor(sow, matcher, requesterSig, wallet) {
    super(sow, matcher)
    this.requesterSig = requesterSig
    this.contractId = 101
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
    agreement.setId(this.contractId)
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
   * @param {messages.Contract} contract
   * @param {grpc.Server} server
   */
  onHireConfirmed(contract, server) {
    const quote = contract.getQuote()
    const farmerId = quote.getFarmer().getDid()
    this.hiredFarmers.set(farmerId, [ server, quote ])
    console.log(`Requester: Contract ${contract.getId()} signed by farmer ${contract
      .getQuote()
      .getFarmer()
      .getDid()}`)
  }

  /**
   * Handles a job on finished
   * @param {Map} report
   */
  onJobFinished(report) {
    this.hiredFarmers.forEach((value, key) => {
      this.awardFarmer(value[0], value[1], report)
    })
  }

  /**
   * Awards farmer for their work
   * @param {grpc.Server} server
   * @param {grpc.Quote} quote
   * @param {Map} report
   */
  awardFarmer(server, quote, report) {
    const reward = this.generateReward(quote, report)
    this.sendReward(server, reward)
  }

  /**
   * Calculates farmer reward
   * @param {messages.ARAid} farmer
   * @param {Map} report
   * @param {messages.Quote} quote
   * @returns {messages.Reward}
   */
  generateReward(quote, report) {
    const farmer = quote.getFarmer()
    const unitsDone = report.get(farmer.getDid())
    const cost = quote.getPerUnitCost() * unitsDone

    const reward = new messages.Reward()
    reward.setSow(this.sow)
    reward.setFarmer(farmer)
    reward.setReward(cost)
    return reward
  }

  /**
   * Submits a reward to the contract, and notifies the farmer that their reward is available for withdraw
   * @param {grpc.Server} server
   * @param {messages.Reward} reward
   */
  sendReward(server, reward) {
    const farmerId = reward.getFarmer().getDid()
    const sowId = this.sow.getId()
    const rewardValue = reward.getReward()
    this.wallet
      .submitReward(sowId, farmerId, rewardValue)
      .then((result) => {
        server.sendReward(reward, (err, response) => {
          if (err) {
            console.log(`RequesterExample: fail to notify farmer ${farmerId} about the reward`)
          } else {
            console.log(`RequesterExample: farmer ${farmerId} has been notified about the reward delivery`)
          }
        })
      })
      .catch((err) => {
        console.log(`RequesterExample: Fail to submit the reward ${rewardValue} to farmer ${farmerId} for job ${sowId}`)
      })
  }
}

module.exports = { ExampleRequester }
