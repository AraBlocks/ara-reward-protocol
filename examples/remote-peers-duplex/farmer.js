const { messages, afpstream, util } = require('ara-farming-protocol')
const { idify, nonceString } = util
const { createSwarm } = require('ara-network/discovery')
const crypto = require('ara-crypto')
const debug = require('debug')('afp:duplex-example:farmer')
const pify = require('pify')
const fp = require('find-free-port')
const ip = require('ip')

class ExampleFarmer extends afpstream.Farmer {
  constructor(farmerId, farmerSig, price, wallet, afs) {
    super()
    this.price = price
    this.farmerId = farmerId
    this.farmerSig = farmerSig
    this.wallet = wallet
    this.afs = afs
    this.deliveryMap = new Map()
  }

  /**
   * Returns a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  async generateQuote(sow) {
    const quote = new messages.Quote()
    quote.setNonce(crypto.randomBytes(32))
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

    // Get free port and pass it as the agreement data
    const port = await pify(fp)(Math.floor(30000 * Math.random()), ip.address())
    const data = Buffer.alloc(4)
    data.writeInt32LE(port, 0)
    agreement.setData(data)

    // Start work on port
    this.startWork(agreement, port)
    return agreement
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    return true
  }

  dataTransmitted(sowId, units){
    if (this.deliveryMap.has(sowId)){
      const total = this.deliveryMap.get(sowId) + units
      this.deliveryMap.set(sowId, total)
    } 
    else
    {
      this.deliveryMap.set(sowId, units)
    }
  }

  async withdrawReward(reward) {
    const sowId = nonceString(reward.getAgreement().getQuote().getSow())
    debug(`Uploaded ${this.deliveryMap.get(sowId)} blocks for job ${sowId}`)

    const farmerDid = this.farmerId.getDid()
    this.wallet
      .claimReward(sowId, farmerDid)
      .then((result) => {
        debug(`Reward amount ${reward.getAmount()} withdrawn for SOW ${sowId}`)
      })
      .catch((err) => {
        debug(`Failed to withdraw reward for SOW ${sowId}`)
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
    receipt.setNonce(crypto.randomBytes(32))
    receipt.setReward(reward)
    receipt.setFarmerSignature(this.farmerSig)
    return receipt
  }

  async startWork(agreement, port) {
    const self = this
    const sow = agreement.getQuote().getSow()
    debug(`Listening for requester ${sow.getRequester().getDid()} on port ${port}`)
    const sowId = nonceString(sow)
    const content = self.afs.partitions.resolve(self.afs.HOME).content

    content.on('upload', (index, data) => {
      self.dataTransmitted(sowId, 1) // TODO: is this a good way to measure data amount?
    })
  
    const opts = {
      stream
    }
    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)
    swarm.listen(port)

    function stream(peer) {
      const stream = self.afs.replicate({
        upload: true,
        download: false
      })
      stream.once('end', onend)
  
      function onend() {
        swarm.destroy()
      }
  
      return stream
    }
  
    function handleConnection(connection, info) {
      debug(`Peer connected: ${info.host} on port: ${info.port}`)
    }
  }
  
}

module.exports = { ExampleFarmer }
