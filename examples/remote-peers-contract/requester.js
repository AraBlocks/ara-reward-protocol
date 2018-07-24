const { messages, Requester } = require('ara-farming-protocol')

class ExampleRequester extends Requester {
  constructor(sow, matcher, requesterSig, onStartWork, wallet) {
    super(sow, matcher)
    this.agreementId = 101
    this.wallet = wallet
    this.requesterSig = requesterSig
    this.hiredFarmers = new Map()
    this.onStartWork = onStartWork
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    return true
  }

  /**
   * Generates a agreement for quote
   * @param {messages.Quote} quote
   * @returns {messages.Agreement}
   */
  async generateAgreement(quote) {
    const agreement = new messages.Agreement()
    agreement.setId(this.agreementId)
    agreement.setQuote(quote)
    agreement.setRequesterSignature(this.requesterSig)
    return agreement
  }

  /**
   * Returns whether a agreement is valid.
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  async validateAgreement(agreement) {
    return true
  }

  /**
   * This is called when a agreement has been marked as valid and a farmer
   * is ready to start work
   * @param {messages.Agreement} agreement
   * @param {services.RFPClient} server
   */
  async onHireConfirmed(agreement, server) {
    const quote = agreement.getQuote()
    const farmerId = quote.getFarmer().getDid()
    this.hiredFarmers.set(farmerId, [server, quote])

    console.log(
      `Requester: Agreement ${agreement.getId()} signed by farmer ${agreement
        .getQuote()
        .getFarmer()
        .getDid()}`
    )

    const host = agreement
      .getQuote()
      .getFarmer()
      .getDid() // HACK

    this.onStartWork(host)
  }

  /**
   * Handles a job on finished
   * @param {Map} report
   */
  onJobFinished(report) {
    this.hiredFarmers.forEach((value, key) => {
      console.log('on job finished')
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
    console.log('award farmer')
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
    console.log('send reward')
    this.wallet
      .submitReward(sowId, farmerId, rewardValue)
      .then(result => {
        server.deliverReward(reward, (err, response) => {
          if (err) {
            console.log(
              `RequesterExample: fail to notify farmer ${farmerId} about the reward`
            )
          } else {
            console.log(
              `RequesterExample: farmer ${farmerId} has been notified about the reward delivery`
            )
          }
        })
      })
      .catch(err => {
        console.log(
          `RequesterExample: Fail to submit the reward for famer ${farmerId} to contract`
        )
      })
  }
}

module.exports = { ExampleRequester }
