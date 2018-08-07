const { messages, matchers, afpstream } = require('ara-farming-protocol')
const { ExampleRequester } = require('./requester')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const through = require('through')
const clip = require('cli-progress')
const util = require('../util')
const pify = require('pify')
const ip = require('ip')

const did = 'ab5867eeaeacebda573ae252331f4b1b298fd9a8ca883f2b28bad5764f10f99c'
download(did)

async function download(did) {
  // A default matcher which will match for a max cost of 10 to a max of 5 farmers
  const matcher = new matchers.MaxCostMatcher(10, 5)

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
  const requester = new ExampleRequester(sow, matcher, requesterSig, startWork)

  // Load the sparse afs
  const { afs } = await create({did})
  let downloaded = false
  const content = afs.partitions.resolve(afs.HOME).content
  if (content){
      content.once('download', onupdate)
  } else {
      afs.once('content', onupdate)
  }

  // Create a swarm for downloading the content
  const contentSwarm = createContentSwarm(afs)
  contentSwarm.on('close', onend)

  // Create a swarm for finding farmers
  const farmerSwarm = createFarmerSwarm(did, requester)

  // Handle when the swarms end
  async function onend() {
    if (!downloaded) {
      downloaded = true
      console.log(await afs.readdir('.'))
      console.log('Downloaded!')
      afs.close()

      if (contentSwarm) contentSwarm.destroy()
      if (farmerSwarm) farmerSwarm.destroy()

      console.log('Swarm destroyed')
    }
  }

  // Handle when the content needs updated
  async function onupdate() {
    const feed = afs.partitions.resolve(afs.HOME).content
    if (feed) {
      const pBar = new clip.Bar({}, clip.Presets.shades_classic)
      let pStarted = false

      feed.on('download', () => {
        if (!feed.length) return
        if (!pStarted) {
          pStarted = true
          pBar.start(feed.length, 0)
        }
        pBar.update(feed.downloaded())

        // const downloaded = feed.downloaded()
        // const perc = 100 * downloaded / total
      })
      feed.once('sync', () => {
        pBar.stop()
      })
      feed.once('sync', onend)
    }
  }

  // Handle when ready to start work
  function startWork(peer) {
    console.log('Starting AFS Connection with ', peer.host, peer.port)
    contentSwarm.addPeer(peer.host, { host: peer.host, port: peer.port })
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
    const us = util.idify(ip.address(), this.address().port)
    const them = util.idify(peer.host, peer.port)

    if (us === them || 'utp' === peer.type) {
      return through()
    }

    const connection = new afpstream.RequestStream(peer, { wait: 100, timeout: 10000 })
    requester.processFarmer(connection)

    return connection.stream
  }

  function handleConnection(connection, info) {
    console.log(`Farmer Swarm: Peer connected: ${util.idify(info.host, info.port)}`)
  }

  return swarm
}

// Creates a private swarm for downloading a piece of content
function createContentSwarm(afs) {
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
      console.log('Replicate stream ended')
      swarm.destroy()
    })

    return stream
  }

  async function handleConnection(connection, info) {
    console.log(`Content Swarm: Peer connected: ${util.idify(info.host, info.port)}`)
  }

  return swarm
}

