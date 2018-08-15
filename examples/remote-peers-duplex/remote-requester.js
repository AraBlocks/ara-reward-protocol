const { contractAddress, walletAddresses, requesterDID, networkDIDs, networkSecretKeypath } = require('../constants.js')
const {unpackKeys, configHandshake} = require('./handshake-utils.js')
const { messages, matchers, afpstream, util } = require('ara-farming-protocol')
const { idify, nonceString } = util
const { ExampleRequester } = require('./requester')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const ContractABI = require('../farming_contract/contract-abi.js')
const crypto = require('ara-crypto')
const debug = require('debug')('afp:duplex-example:main')
const clip = require('cli-progress')
const wallet = new ContractABI(contractAddress, walletAddresses[4])
const did = networkDIDs[0]
const through = require('through')
const duplexify = require('duplexify')


download(did, 1)

async function download(did, reward) {
  // A default matcher which will match for a max cost of 10 to a max of 5 farmers
  const matcher = new matchers.MaxCostMatcher(reward, 5)

  // The ARAid of the Requester
  const requesterID = new messages.AraId()
  requesterID.setDid(requesterDID)

  // A signature that a farmer can use to verify that the requester has signed an agreement
  const requesterSig = new messages.Signature()
  requesterSig.setAraId(requesterID)
  requesterSig.setData('avalidsignature')

  // Create the statement of work
  const sow = new messages.SOW()
  sow.setNonce(crypto.randomBytes(32))
  sow.setWorkUnit('MB')
  sow.setRequester(requesterID)

  // Create the requester object
  const requester = new ExampleRequester(sow, matcher, requesterSig, startWork, wallet)

  // Load the sparse afs
  const { afs } = await create({did})
  let downloaded = false
  let destroyed = false
  const content = afs.partitions.resolve(afs.HOME).content
  if (content){
      content.once('download', onUpdate)
  } else {
      afs.once('content', onUpdate)
  }

  // Create a swarm for downloading the content
  const contentSwarm = createContentSwarm(afs, requester)
  contentSwarm.on('end', onEnd)

  // Submit the reward allocation and find farmers
  let farmerSwarm = null

  const rewardAllocation = reward * 10 // TODO: determine this based on download size
  const jobId = nonceString(sow)

  let handshakeConf
  try { handshakeConf = await unpackKeys(requesterDID, networkSecretKeypath) }
  catch (e) { console.log({e})}

  wallet
    .submitJob(jobId, rewardAllocation)
    .then((result) => {
      debug(`Job ${jobId} has been submitted to the contract with ${rewardAllocation} tokens`)
      farmerSwarm = createFarmerSwarm(did, requester, handshakeConf)
    })
    .catch((err) => {
      debug('Job submission failed')
      onEnd(err)
    })


  // Handle when the content finishes downloading
  async function onDownload(){
    if (!downloaded) {
      downloaded = true
      debug(await afs.readdir('.'))
      debug('Downloaded!')
      requester.sendRewards(destroySwarms)
    }
  }

  // Handle when the swarms end
  async function onEnd(error) {
    if (error) {
      debug(error)
      destroySwarms()
    }
  }

  // Destroy the swarms
  function destroySwarms(){
    if (!destroyed){
      destroyed = true
      debug('Swarm destroyed')
      if (afs) afs.close()
      if (contentSwarm) contentSwarm.destroy()
      if (farmerSwarm) farmerSwarm.destroy()
    }
  }

  // Handle when the content needs updated
  async function onUpdate() {
    const feed = afs.partitions.resolve(afs.HOME).content
    if (feed) {
      const pBar = new clip.Bar({}, clip.Presets.shades_classic)
      let pStarted = false

      feed.on('download', (index, data, from) => {
        const peerIdHex = from.remoteId.toString('hex')
        requester.dataReceived(peerIdHex, 1) // TODO: Is this a good way to measure data amount?

        if (!feed.length) return
        if (!pStarted) {
          pStarted = true
          pBar.start(feed.length, 0)
        }
        pBar.update(feed.downloaded())
      })
      feed.once('sync', () => {
        pBar.stop()
      })
      feed.once('sync', onDownload)
    }
  }

  // Handle when ready to start work
  function startWork(peer, port) {
    const connectionId = idify(peer.host, port)
    debug(`Starting AFS Connection with ${connectionId}`)
    contentSwarm.addPeer(connectionId, { host: peer.host, port: port })
  }
}

// Creates a swarm to find farmers
function createFarmerSwarm(did, requester, conf) {
  const opts = {
      stream
  }

  const swarm = createSwarm(opts)
  swarm.on('connection', handleConnection)
  swarm.join(did)

  function stream(peer) {
    if (null === peer.channel) {
      return through()
    }
    return configHandshake(requesterDID, conf)
  }

  function handleConnection(connection, info) {
    debug(`Farmer Swarm: Peer connected: ${idify(info.host, info.port)}`)
    const writer = connection.createWriteStream()
    const reader = connection.createReadStream()
    const stream = duplexify(writer, reader)
    const farmerConnection = new afpstream.FarmerConnection(info, stream, {timeout: 22220000})
    process.nextTick(() => requester.processFarmer(farmerConnection))
  }

  return swarm
}

// Creates a private swarm for downloading a piece of content
function createContentSwarm(afs, requester) {
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
      swarm.destroy()
    })

    return stream
  }

  async function handleConnection(connection, info) {
    const contentSwarmId = connection.remoteId.toString('hex')
    const connectionId = idify(info.host, info.port)
    requester.addSwarmId(connectionId, contentSwarmId)
    debug(`Content Swarm: Peer connected: ${connectionId} with id: ${contentSwarmId}`)
  }

  return swarm
}
