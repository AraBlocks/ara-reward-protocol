/* eslint class-methods-use-this: 1 */
/* eslint-disable-next-line import/no-unresolved */
const { messages, FarmerBase, util } = require('ara-farming-protocol')
const { createSwarm } = require('ara-network/discovery')
const { info, warn } = require('ara-console')
const crypto = require('ara-crypto')
const debug = require('debug')('afp:duplex-example:farmer')
const pify = require('pify')
const fp = require('find-free-port')
const ip = require('ip')

const { nonceString, weiToEther, bytesToGBs } = util

class ExampleFarmer extends FarmerBase {
  /**
   * Example Farmer replicates an CFS for a min price
   * @param {*} farmerId
   * @param {*} farmerSig
   * @param {int} price Desired price in wei/byte
   * @param {ContractABI} wallet Farmer's Wallet Contract ABI
   * @param {CFS} cfs Instance of CFS
   */
  constructor(farmerId, farmerSig, price, wallet, cfs) {
    super()
    this.price = price
    this.farmerId = farmerId
    this.farmerSig = farmerSig
    this.wallet = wallet
    this.cfs = cfs
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

    return agreement
  }

  async validateSow(sow) {
    if (sow) return true
    return false
  }

  dataTransmitted(sowId, units) {
    if (this.deliveryMap.has(sowId)) {
      const total = this.deliveryMap.get(sowId) + units
      this.deliveryMap.set(sowId, total)
    } else {
      this.deliveryMap.set(sowId, units)
    }
  }

  async withdrawReward(reward) {
    const sowId = nonceString(reward.getAgreement().getQuote().getSow())
    info(`Uploaded ${bytesToGBs(this.deliveryMap.get(sowId))} Gbs for job ${sowId}`)

    const farmerDid = this.farmerId.getDid()
    await this.wallet.getRewardBalance(sowId, farmerDid)
      .then(() => {
        info(`Reward amount ${weiToEther(reward.getAmount())} withdrawn for SOW ${sowId}`)
      })
      .catch((err) => {
        warn(`Failed to withdraw reward for SOW ${sowId}`)
        debug(err)
      })
  }

  /**
   * This should returns whether a reward is valid.
   * @param {messages.Reward} reward
   * @returns {boolean}
   */
  async validateReward(reward) {
    if (reward) return true
    return false
  }

  /**
   * This should return a receipt given a reward.
   * @param {messages.Reward} reward
   * @returns {messages.Receipt}
   */
  async generateReceipt(reward) {
    await this.withdrawReward(reward)
    const receipt = new messages.Receipt()
    receipt.setNonce(crypto.randomBytes(32))
    receipt.setReward(reward)
    receipt.setFarmerSignature(this.farmerSig)
    return receipt
  }

  async onHireConfirmed(agreement) {
    const agreementData = Buffer.from(agreement.getData())
    const port = agreementData.readUInt32LE(0)

    const self = this
    const sow = agreement.getQuote().getSow()
    info(`Listening for requester ${sow.getRequester().getDid()} on port ${port}`)
    const sowId = nonceString(sow)

    const { content } = this.cfs.partitions.resolve(this.cfs.HOME)

    content.on('upload', (index, data) => {
      this.dataTransmitted(sowId, data.length)
    })

    const opts = {
      stream
    }

    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)
    swarm.listen(port)
    function stream() {
      const cfsstream = self.cfs.replicate({
        upload: true,
        download: false
      })
      cfsstream.once('end', onend)

      function onend() {
        swarm.destroy()
      }

      return cfsstream
    }

    function handleConnection(connection, peer) {
      info(`Peer connected: ${peer.host} on port: ${peer.port}`)
    }
  }
}

module.exports = { ExampleFarmer }
