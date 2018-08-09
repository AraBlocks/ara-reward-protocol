const debug = require('debug')('afp:duplex-example:requester')
const { messages, afpstream } = require('ara-farming-protocol')
const { idify } = require('../util')
const pify = require('pify')


class ExampleRequester extends afpstream.Requester {
  constructor(sow, matcher, requesterSig, startWork, wallet) {
    super(sow, matcher)
    this.badFarmerId = 'ara:did:2'
    this.agreementId = 101
    this.requesterSig = requesterSig
    this.startWork = startWork
    this.wallet = wallet
    this.hiredFarmers = new Map()
    this.swarmIdMap = new Map()
    this.deliveryMap = new Map()
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    const farmerId = peer.getDid()
    if (farmerId == this.badFarmerId) {
      debug(`Requester: Invalid farmer ${farmerId}`)
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
    debug(`Requester: Agreement ${agreement.getId()} signed by farmer ${agreement.getQuote().getFarmer().getDid()}`)
    const peer = connection.peer
    const port = agreement.getId() // HACK
    const peerId = idify(peer.host, port)
    this.hiredFarmers.set(peerId, { connection, agreement })

    this.startWork(peer, port)
  }

    /**
   * 
   * @param {messages.Receipt} receipt 
   * @param {services.RFPClient} connection 
   */
  async onReceipt(receipt, connection){
    debug(`Receipt ${receipt.getId()} signed by farmer`)
  }

  addSwarmId(peerId, swarmId){
    this.swarmIdMap.set(swarmId, peerId)
    this.deliveryMap.set(swarmId, 0)
  }

  dataReceived(peerSwarmId, units){
    if (this.deliveryMap.has(peerSwarmId)){
      const total = this.deliveryMap.get(peerSwarmId) + units
      this.deliveryMap.set(peerSwarmId, total)
    } 
    else
    {
      this.deliveryMap.set(peerSwarmId, units)
    }
  }

  async sendRewards(){
    const blocksPerUnit = 400 // TODO: adjust this measurement
    await this.deliveryMap.forEach(async (value, key, map) => {
      const peerId = this.swarmIdMap.get(key)
      const units = Math.floor(value / blocksPerUnit)
      if (units > 0) await this.awardFarmer(peerId, units)
    })
  }

  /**
   * Awards farmer for their work
   */
  async awardFarmer(peerId, units) {
    if (this.hiredFarmers.has(peerId)){
      const { connection, agreement } = this.hiredFarmers.get(peerId)
      const reward = this.generateReward(agreement, units)
      await pify(this.sendReward.bind(this))(connection, reward)
    } else {
      debug("Error: Farmer not found")
    }
  }

  /**
   * Calculates farmer reward
   * @param {messages.ARAid} farmer
   * @param {messages.Agreement} agreement
   * @returns {messages.Reward}
   */
  generateReward(agreement, units) {
    const quote = agreement.getQuote()
    const sow = quote.getSow()
    const farmer = quote.getFarmer()
    const amount = quote.getPerUnitCost() * units
    const reward = new messages.Reward()
    reward.setSow(sow)
    reward.setFarmer(farmer)
    reward.setReward(amount)
    return reward
  }

  /**
   * Submits a reward to the contract, and notifies the farmer that their reward is available for withdraw
   */
  sendReward(connection, reward, cb) {
    const farmerId = reward.getFarmer().getDid()
    const sowId = reward.getSow().getId()
    const rewardValue = reward.getReward()
    debug(`Sending reward to farmer ${farmerId} for ${rewardValue} tokens`)

    this.wallet
      .submitReward(sowId, farmerId, rewardValue)
      .then((result) => {
        connection.sendReward(reward)
      })
      .catch((err) => {
        debug(`Failed to submit the reward ${rewardValue} to farmer ${farmerId} for job ${sowId}`)
        cb(err)
      })
  }
}

module.exports = { ExampleRequester }
