const { messages, afpstream } = require('ara-farming-protocol')
const { idify } = require('../util')

class ExampleRequester extends afpstream.Requester {
  constructor(sow, matcher, requesterSig, startWork, wallet) {
    super(sow, matcher)
    this.badFarmerId = 'ara:did:2'
    this.agreementId = 101
    this.requesterSig = requesterSig
    this.startWork = startWork
    this.wallet = wallet
    this.hiredFarmers = new Map()
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    const farmerId = peer.getDid()
    if (farmerId == this.badFarmerId) {
      console.log(`Requester: Invalid farmer ${farmerId}`)
      return false
    }
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
   * @param {services.RFPClient} connection
   */
  async onHireConfirmed(agreement, connection) {
    console.log(`Requester: Agreement ${agreement.getId()} signed by farmer ${agreement.getQuote().getFarmer().getDid()}`)
    const port = agreement.getId() // HACK
    const peer = connection.peer
    peer.port = port
    this.startWork(peer)
    this.hiredFarmers.set(idify(peer.host, peer.port), connection)
  }

  /**
   * Awards farmer for their work
   */
  awardFarmer(peer, quote, amount) {
    const key = idify(peer.host, peer.port)
    if (this.hiredFarmers.has(key)){
      const connection = this.hiredFarmers.get(key)
      const reward = this.generateReward(quote, amount)
      this.sendReward(connection, reward)
    } else {
      console.log("Error: Farmer not found")
    }
  }

  /**
   * Calculates farmer reward
   * @param {messages.ARAid} farmer
   * @param {messages.Quote} quote
   * @returns {messages.Reward}
   */
  generateReward(quote, amount) {
    const farmer = quote.getFarmer()
    // const unitsDone = report.get(farmer.getDid())
    // const cost = quote.getPerUnitCost() * unitsDone

    const reward = new messages.Reward()
    reward.setSow(this.sow)
    reward.setFarmer(farmer)
    reward.setReward(amount)
    return reward
  }

  /**
   * Submits a reward to the contract, and notifies the farmer that their reward is available for withdraw
   */
  sendReward(connection, reward) {
    const farmerId = reward.getFarmer().getDid()
    const sowId = this.sow.getId()
    const rewardValue = reward.getReward()
    this.wallet
      .submitReward(sowId, farmerId, rewardValue)
      .then((result) => {
        connection.sendReward(reward, (err, response) => {
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
