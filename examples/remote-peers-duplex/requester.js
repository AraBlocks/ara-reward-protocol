const { messages, afpstream } = require('ara-farming-protocol')
const crypto = require('ara-crypto')
const idify = afpstream.util.idify
const debug = require('debug')('afp:duplex-example:requester')


class ExampleRequester extends afpstream.Requester {
  constructor(sow, matcher, requesterSig, startWork, wallet) {
    super(sow, matcher)
    this.requesterSig = requesterSig
    this.startWork = startWork
    this.wallet = wallet
    this.hiredFarmers = new Map()
    this.swarmIdMap = new Map()
    this.deliveryMap = new Map()
    this.receipts = 0
    this.onComplete = null
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
    agreement.setNonce(crypto.randomBytes(32))
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
    debug(`Agreement ${agreement.getNonce().toString('hex')} signed by farmer ${agreement.getQuote().getFarmer().getDid()}`)
    const peer = connection.peer

    // Extract port
    const data =  Buffer.from(agreement.getData())
    const port = data.readUInt32LE(0)

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
    debug(`Receipt ${Buffer.from(receipt.getNonce()).toString('hex')} signed by farmer ${receipt.getFarmerSignature().getAraId().getDid()}`)
    this.incrementOnComplete()
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

  sendRewards(callback){
    const blocksPerUnit = 400 // TODO: adjust this measurement
    this.onComplete = callback

    this.deliveryMap.forEach((value, key, map) => {
      const peerId = this.swarmIdMap.get(key)
      const units = Math.floor(value / blocksPerUnit) // TODO: no rounding?
      if (units > 0 && this.hiredFarmers.has(peerId)) {
        this.awardFarmer(peerId, units)
      } else {
        debug(`Farmer ${peerId} will not be rewarded.`)
        this.incrementOnComplete()
      }
    })
  }

  incrementOnComplete(){
    this.receipts++
    if (this.onComplete && this.receipts === this.deliveryMap.size){
      debug("Firing onComplete")
      this.onComplete()
    }
  }

  /**
   * Awards farmer for their work
   */
  awardFarmer(peerId, units) {
    const { connection, agreement } = this.hiredFarmers.get(peerId)
    const reward = this.generateReward(agreement, units)
    this.sendReward(connection, reward)
  }

  /**
   * Calculates farmer reward
   * @param {messages.ARAid} farmer
   * @param {messages.Agreement} agreement
   * @returns {messages.Reward}
   */
  generateReward(agreement, units) {
    const quote = agreement.getQuote()
    const amount = quote.getPerUnitCost() * units
    const reward = new messages.Reward()
    reward.setNonce(crypto.randomBytes(32))
    reward.setAgreement(agreement)
    reward.setAmount(amount)
    return reward
  }

  /**
   * Submits a reward to the contract, and notifies the farmer that their reward is available for withdraw
   */
  sendReward(connection, reward) {
    const quote = reward.getAgreement().getQuote()
    const sowId = Buffer.from(quote.getSow().getNonce()).toString('hex')
    const farmerId = quote.getFarmer().getDid()
    const amount = reward.getAmount()
    debug(`Sending reward to farmer ${farmerId} for ${amount} tokens`)

    this.wallet
      .submitReward(sowId, farmerId, amount)
      .then((result) => {
        connection.sendReward(reward)
      })
      .catch((err) => {
        debug(`Failed to submit the reward ${rewardValue} to farmer ${farmerId} for job ${sowId}`)
      })
  }
}

module.exports = { ExampleRequester }
