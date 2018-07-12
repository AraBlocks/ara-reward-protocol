const { Requester } = require('../../src/requester')
const messages = require('../../src/proto/messages_pb')
const ContractABI = require('./contract/contract.js')

class ExampleRequester extends Requester {
  constructor(sow, matcher, requesterSig, contractABI) {
    super(sow, matcher)
    this.requesterSig = requesterSig
    this.contractId = 101
    this.contractABI = contractABI
    this.hiredFarmers = new Map()
  }

  async submitJob(budget) {
    const response = await this.contractABI.createJob(this.sow.getId(), budget)
    return response
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
  async sendReward(server, reward) {
    const farmerId = reward.getFarmer().getDid()
    const sowId = this.sow.getId()
    const response = await this.contractABI.submitReward(
      farmerId,
      sowId,
      reward.getReward()
    )
    if (response) {
      server.deliverReward(reward, (err, response) => {
        if (err) {
          console.log(`RequesterExample: fail to notify farmer ${farmerId} about the reward`)
        } else {
          console.log(`RequesterExample: farmer ${farmerId} has been notified about the reward delivery`)
        }
      })
    } else {
      console.log(`RequesterExample: Fail to submit the reward for famer ${farmerId} to contract`)
    }
  }
}

module.exports = { ExampleRequester }