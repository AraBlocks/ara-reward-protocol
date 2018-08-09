const { contractAddress, walletAddresses } = require('../constants.js')
const { messages, matchers, afpstream } = require('ara-farming-protocol')
const { ExampleRequester } = require('./requester')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const { idify } = require('../util')
const ContractABI = require('../farming_contract/contract-abi.js')
const through = require('through')
const debug = require('debug')('afp:duplex-example:remote')
const clip = require('cli-progress')
const pify = require('pify')
const ip = require('ip')

const wallet = new ContractABI(contractAddress, walletAddresses[3])

const did = 'c0e80c9943b5c99c626b8888f0526c43eeadc22087ef68532c309d565c35afea' // 50 MB
//const did = '556399cef520525d2733567eab2a3505d156fa2ca2a94c5aa9964e844a3dc1a8' // 2 GB
download(did, 1)

async function download(did, reward) {
  // A default matcher which will match for a max cost of 10 to a max of 5 farmers
  const matcher = new matchers.MaxCostMatcher(reward, 5)

  // The ARAid of the Requester
  const requesterID = new messages.ARAid()
  const requesterDID = 'did:ara:1'
  requesterID.setDid(requesterDID)

  // A signature that a farmer can use to verify that the requester has signed an agreement
  const requesterSig = new messages.Signature()
  requesterSig.setAraId(requesterID)
  requesterSig.setData('avalidsignature')

  // Create the statement of work
  const sow = new messages.SOW()
  sow.setId(2)
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
      content.once('download', onupdate)
  } else {
      afs.once('content', onupdate)
  }

  // Create a swarm for downloading the content
  const contentSwarm = createContentSwarm(afs, requester)
  contentSwarm.on('close', onend)
  let farmerSwarm = null
  const rewardAllocation = reward * 10 // TODO: determine this based on download size

  wallet
    .submitJob(sow.getId(), rewardAllocation)
    .then((result) => {
      debug(`Job ${sow.getId()} has been submitted to the contract with ${rewardAllocation} tokens`)
      
      // Create a swarm for finding farmers
      farmerSwarm = createFarmerSwarm(did, requester)
    })
    .catch((err) => {
      debug('Job submission failed')
      onend(err)
    })


  // Handle when the swarms end
  async function onend(error) {
    if (error) {
      console.log(error)
      destroySwarms()
    } 
    else if (!downloaded) {
      downloaded = true
      debug(await afs.readdir('.'))
      debug('Downloaded!')
      requester.sendRewards(destroySwarms)
    }
  }

  function destroySwarms(){
    if (!destroyed){
      debug('Swarm destroyed')
      destroyed = true
      if (afs) afs.close()
      if (contentSwarm) contentSwarm.destroy()
      if (farmerSwarm) farmerSwarm.destroy()
    }
  }

  // Handle when the content needs updated
  async function onupdate() {
    const feed = afs.partitions.resolve(afs.HOME).content
    if (feed) {
      const pBar = new clip.Bar({}, clip.Presets.shades_classic)
      let pStarted = false

      feed.on('download', (index, data, from) => {
        const peerIdHex = from.remoteId.toString('hex')
        requester.dataReceived(peerIdHex, 1)

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
      feed.once('sync', onend)
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
function createFarmerSwarm(did, requester) {
  const opts = {
    stream,
  }
  const swarm = createSwarm(opts)
  swarm.on('connection', handleConnection)

  swarm.join(did)

  function stream(peer) {
    const us = idify(ip.address(), this.address().port)
    const them = idify(peer.host, peer.port)

    if (us === them || 'utp' === peer.type) {
      return through()
    }

    const connection = new afpstream.RequestStream(peer, { wait: 100, timeout: 10000 })
    requester.processFarmer(connection)

    return connection.stream
  }

  function handleConnection(connection, info) {
    debug(`Farmer Swarm: Peer connected: ${idify(info.host, info.port)}`)
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

