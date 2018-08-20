const { messages, afpstream, util } = require('ara-farming-protocol')

const { idify, nonceString } = util
const { createSwarm } = require('ara-network/discovery')
const crypto = require('ara-crypto')
const debug = require('debug')('afp:duplex-example:requester')

const blocksPerUnit = 400 // TODO: adjust this measurement

class ExampleRequester extends afpstream.Requester {
  constructor(sow, matcher, requesterSig, wallet, afs, onComplete) {
    super(sow, matcher)
    this.requesterSig = requesterSig
    this.wallet = wallet
    this.hiredFarmers = new Map()
    this.swarmIdMap = new Map()
    this.deliveryMap = new Map()
    this.receipts = 0
    this.contentSwarm = this.createContentSwarm(afs, onComplete)
  }

  // Creates a private swarm for downloading a piece of content
  createContentSwarm(afs, onComplete) {
    const self = this
    let currSize = 0
    let content = afs.partitions.resolve(afs.HOME).content
    let stakeSubmitted = false

    if (content) {
      currSize = content.downloaded()
      attachDownloadListener(content)
    } else {
      afs.once('content', () => {
        content = afs.partitions.resolve(afs.HOME).content
        attachDownloadListener(content)
      })
    }

    const opts = {
      stream,
    }

    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)

    function stream(peer) {
      const stream = afs.replicate({
        upload: false,
        download: true,
        live: false
      })

      stream.once('end', () => {
        debug('Replicate stream ended')
        if (!stakeSubmitted) onComplete()
        swarm.destroy()
      })

      return stream
    }

    async function handleConnection(connection, info) {
      const contentSwarmId = connection.remoteId.toString('hex')
      const connectionId = idify(info.host, info.port)
      self.swarmIdMap.set(contentSwarmId, connectionId)
      debug(`Content Swarm: Peer connected: ${connectionId}`)
    }

    // Handle when the content needs updated
    async function attachDownloadListener(feed) {
      // Calculate and submit stake
      // NOTE: this is a hack to get content size and should be done prior to download
      feed.once('download', () => {
        debug(`old size: ${currSize}, new size: ${feed.length}`)
        const sizeDelta = feed.length - currSize
        const amount = Math.ceil(self.matcher.maxCost * sizeDelta / blocksPerUnit)
        self.emit('downloading', feed.length)
        debug(`Staking ${amount} for a size delta of ${sizeDelta} blocks`)
        self.submitStake(amount, (err) => {
          if (err) onComplete(err)
          else stakeSubmitted = true
        })
      })

      // Record download data
      feed.on('download', (index, data, from) => {
        const peerIdHex = from.remoteId.toString('hex')
        self.dataReceived(peerIdHex, 1) // TODO: Is this a good way to measure data amount?
        self.emit('progress', feed.downloaded())
      })

      // Handle when the content finishes downloading
      feed.once('sync', async () => {
        self.emit('complete')
        debug(await afs.readdir('.'))
        debug('Downloaded!')
        self.sendRewards(onComplete)
      })
    }

    return swarm
  }

  // Submit the stake to the blockchain
  async submitStake(amount, onComplete) {
    const jobId = nonceString(this.sow)
    this.wallet
      .submitJob(jobId, amount)
      .then((result) => {
        onComplete()
      })
      .catch((err) => {
        onComplete(err)
      })
  }

  async validatePeer(peer) {
    return true
  }

  async generateAgreement(quote) {
    const agreement = new messages.Agreement()
    agreement.setNonce(crypto.randomBytes(32))
    agreement.setQuote(quote)
    agreement.setRequesterSignature(this.requesterSig)
    return agreement
  }

  async validateAgreement(agreement) {
    return true
  }

  async onHireConfirmed(agreement, connection) {
    const peer = connection.peer

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
    debug(`Starting AFS Connection with ${connectionId}`)
    this.contentSwarm.addPeer(connectionId, { host: peer.host, port })
  }

  async onReceipt(receipt, connection) {
    // Expects receipt from all rewarded farmers
    this.incrementOnComplete()
  }

  dataReceived(peerSwarmId, units) {
    if (this.deliveryMap.has(peerSwarmId)) {
      const total = this.deliveryMap.get(peerSwarmId) + units
      this.deliveryMap.set(peerSwarmId, total)
    } else {
      this.deliveryMap.set(peerSwarmId, units)
    }
  }

  sendRewards(callback) {
    this.onComplete = callback

    debug('delivery map')
    debug(this.deliveryMap)
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
    const sowId = nonceString(quote.getSow())
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
