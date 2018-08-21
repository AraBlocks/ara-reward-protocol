const { messages, afpgrpc, matchers } = require('../../../index')
const { createChannel, createSwarm } = require('ara-network/discovery')
const { afsDIDs, requesterDID } = require('../../constants.js')
const { ExampleRequester } = require('./requester')
const debug = require('debug')('afp:grpc-example:main')
const crypto = require('ara-crypto')
const afs = require('ara-filesystem')

download(afsDIDs[0], 0, '50051')

async function download(did, reward, grpcPort) {
  // A default matcher which will match for a max cost of 0 to a max of 5 farmers
  const matcher = new matchers.MaxCostMatcher(reward, 5)

  // The ARAid of the Requester
  const requesterID = new messages.ARAid()
  requesterID.setDid(requesterDID)

  // A signature that a farmer can use to verify that the requester has signed an agreement
  const requesterSig = new messages.Signature()
  requesterSig.setAraId(requesterID)
  requesterSig.setData('avalidsignature')

  // Create the statement of work
  const sow = new messages.SOW()
  sow.setNonce(crypto.randomBytes(32))
  sow.setWorkUnit('GB')
  sow.setRequester(requesterID)

  // The RPC Connections to the farmers
  const farmerConnections = new Map()

  // Join the discovery channel for the requested content
  const channel = createChannel()
  channel.join(did)
  const requester = new ExampleRequester(sow, matcher, requesterSig, startWork)
  channel.on('peer', (id, peer) => handlePeer(id, peer))

  async function loadAFS(aid) {
    const createResp = await afs.create({
      did: aid,
    })
    return createResp.afs
  }

  async function startWork(peer, port) {
    const downloadAFS = await loadAFS(did)

    const opts = {
      id: requesterDID,
      stream,
    }

    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)
    swarm.addPeer(peer.host, { host: peer.host, port })

    function stream() {
      const afsstream = downloadAFS.replicate({
        upload: false,
        download: true
      })
      afsstream.once('end', onend)
      return afsstream
    }

    async function onend() {
      downloadAFS.close()
      swarm.destroy()
      channel.destroy()
      debug(await downloadAFS.readdir('.'))
      debug('Downloaded!')
      debug('Swarm destroyed')
    }

    // Handle when a peer connects to the swarm
    async function handleConnection(connection, info) {
      debug(`SWARM: New peer: ${info.host} on port: ${info.port}`)
    }
  }

  // Process each peer when a new peer is discovered
  function handlePeer(id, peer) {
    const key = peer.host
    if (!farmerConnections.has(key)) {
      debug(`CHANNEL: New peer: ${peer.host} on port: ${peer.port}`)
      const port = `${peer.host}:${grpcPort}`
      const farmerConnection = afpgrpc.util.connectToFarmer(port)
      farmerConnections.set(key, farmerConnection)
      requester.processFarmer(farmerConnection)
    }
  }
}
