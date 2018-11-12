/* eslint class-methods-use-this: 1 */
/* eslint-disable-next-line import/no-unresolved */
const { messages, RequesterBase, util } = require('ara-farming-protocol')
const { createSwarm } = require('ara-network/discovery')
const { info, warn } = require('ara-console')
const crypto = require('ara-crypto')
const debug = require('debug')('afp:duplex-example:requester')
const web3 = require('web3')

const {
  idify, nonceString, weiToEther
} = util

class ExampleRequester extends RequesterBase {
  constructor(sow, matcher, requesterSig, wallet, cfs, onComplete) {
    super(sow, matcher)
    this.requesterSig = requesterSig
    this.wallet = wallet
    this.hiredFarmers = new Map()
    this.swarmIdMap = new Map()
    this.deliveryMap = new Map()
    this.receipts = 0
    this.contentSwarm = this.createContentSwarm(cfs, onComplete)
  }

  // Creates a private swarm for downloading a piece of content
  createContentSwarm(cfs, onComplete) {
    const self = this
    let oldByteLength = 0
    const { content } = cfs.partitions.resolve(cfs.HOME)
    let stakeSubmitted = false

    if (content) {
      oldByteLength = 0
      attachDownloadListener(content)
    } else {
      cfs.once('content', () => {
        attachDownloadListener(cfs.partitions.resolve(cfs.HOME).content)
      })
    }

    const opts = {
      stream
    }

    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)

    function stream() {
      const cfsstream = cfs.replicate({
        upload: false,
        download: true,
        live: false
      })

      cfsstream.once('end', () => {
        debug('Replicate stream ended')
        if (!stakeSubmitted) onComplete()
        swarm.destroy()
      })

      return cfsstream
    }

    async function handleConnection(connection, peer) {
      const contentSwarmId = connection.remoteId.toString('hex')
      const connectionId = idify(peer.host, peer.port)
      self.swarmIdMap.set(contentSwarmId, connectionId)
      info(`Content Swarm: Peer connected: ${connectionId}`)
    }

    // Handle when the content needs updated
    async function attachDownloadListener(feed) {
      // Calculate and submit stake
      feed.once('download', () => {
        debug(`old size: ${oldByteLength}, new size: ${feed.byteLength}`)
        const amount = self.matcher.maxCost
        info(`Staking ${weiToEther(amount)} for the requested content`)
        self.submitStake(amount, (err) => {
          if (err) onComplete(err)
          else stakeSubmitted = true
        })
        self.emit('downloading', feed.length)
      })

      // Record download data
      feed.on('download', (index, data, from) => {
        const peerIdHex = from.remoteId.toString('hex')
        self.dataReceived(peerIdHex, data.length)
        self.emit('progress', feed.downloaded())
      })

      // Handle when the content finishes downloading
      feed.once('sync', async () => {
        self.emit('complete')
        debug(await cfs.readdir('.'))
        info('Downloaded!')
        await self.sendRewards(onComplete)
      })
    }

    return swarm
  }

  // Submit the stake to the blockchain
  async submitStake(amount, onComplete) {
    const jobId = nonceString(this.sow)
    await this.wallet
      .submitJob(jobId, amount)
      .then(() => {
        onComplete()
      })
      .catch((err) => {
        onComplete(err)
      })
  }

  async validateQuote(quote) {
    if (quote) return true
    return false
  }

  async generateAgreement(quote) {
    const agreement = new messages.Agreement()
    agreement.setNonce(crypto.randomBytes(32))
    agreement.setQuote(quote)
    agreement.setRequesterSignature(this.requesterSig)
    return agreement
  }

  async validateAgreement(agreement) {
    if (agreement) return true
    return false
  }

  async onHireConfirmed(agreement, connection) {
    const { peer } = connection

    // Extract port
    const data = Buffer.from(agreement.getData())
    const port = data.readUInt32LE(0)

    // Store hired farmer
    const peerId = idify(peer.host, port)
    this.hiredFarmers.set(peerId, { connection, agreement })

    // Start work
    this.startWork(peer, port)
  }

  // Handle when ready to start work
  async startWork(peer, port) {
    const connectionId = idify(peer.host, port)
    debug(`Starting cfs Connection with ${connectionId}`)
    this.contentSwarm.addPeer(connectionId, { host: peer.host, port })
  }

  async onReceipt(receipt, connection) {
    // Expects receipt from all rewarded farmers
    if (receipt && connection) {
      this.incrementOnComplete()
    }
  }

  dataReceived(peerSwarmId, units) {
    if (this.deliveryMap.has(peerSwarmId)) {
      const total = this.deliveryMap.get(peerSwarmId) + units
      this.deliveryMap.set(peerSwarmId, total)
    } else {
      this.deliveryMap.set(peerSwarmId, units)
    }
  }

  async sendRewards(callback) {
    this.onComplete = callback

    this.deliveryMap.forEach(async (value, key) => {
      const peerId = this.swarmIdMap.get(key)
      const units = value
      if (units > 0 && this.hiredFarmers.has(peerId)) {
        await this.awardFarmer(peerId, units)
      } else {
        debug(`Farmer ${peerId} will not be rewarded.`)
        this.incrementOnComplete()
      }
    })
  }

  incrementOnComplete() {
    this.receipts++
    if (this.onComplete && this.receipts === this.deliveryMap.size) {
      debug('Firing onComplete')
      this.onComplete()
    }
  }

  /**
   * Awards farmer for their work
   */
  async awardFarmer(peerId, units) {
    const { connection, agreement } = this.hiredFarmers.get(peerId)
    const reward = this.generateReward(agreement, units)
    await this.sendReward(connection, reward)
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
  async sendReward(connection, reward) {
    const quote = reward.getAgreement().getQuote()
    const sowId = nonceString(quote.getSow())
    const farmerId = quote.getFarmer().getDid()
    const amount = reward.getAmount()

    info(`Sending reward to farmer ${farmerId} for ${weiToEther(amount)} tokens`)
    try {
      const hexAmount = web3.utils.numberToHex(amount / 1000)
      await this.wallet
        .submitReward(sowId, farmerId, hexAmount)
        .then(() => {
          connection.sendReward(reward)
        })
        .catch((err) => {
          warn(`Failed to submit the reward to farmer ${farmerId} for job ${sowId}`)
          debug(err)
        })
    } catch (e) {
      debug(e)
    }
  }
}

module.exports = { ExampleRequester }
