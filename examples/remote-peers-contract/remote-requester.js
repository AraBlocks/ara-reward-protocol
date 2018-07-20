const { messages, grpcUtil, MaxCostMatcher } = require('ara-farming-protocol')
const { createChannel, createSwarm } = require('ara-network/discovery')
const { ExampleRequester } = require('./requester')
const ip = require('ip')
const wallets = require('./constant.js')

/**
 * Example: Finds peers on the discovery channel did:ara:desiredContent,
 * then connects to each peer on example port 50051 to determine costs.
 * Uses the MaxCostMatcher to determine peers.
 */

// A default matcher which will match for a max cost of 10 to a max of 5 farmers
const matcher = new MaxCostMatcher(10, 5)

// The ARAid of the Requester
const requesterID = new messages.ARAid()
const requesterDID = ip.address() // HACK
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

// TODO: Create cfs
const stream = peer => {
  //return cfs.replicate()
}

// Create a swarm for downloading the content
const opts = {
  id: requesterDID
}
const swarm = createSwarm(opts)
//swarm.join(discoveryAID + ':private')
swarm.on('connection', handleConnection)

const requesterWallet = wallets[0]
const requester = new ExampleRequester(
  sow,
  matcher,
  requesterSig,
  swarm,
  requesterWallet
)

// The RPC Connections to the farmers
const farmerConnections = new Map()

const budget = 1
requesterWallet
  .submitJob(sow.getId(), budget)
  .then(result => {
    // Join the discovery channel for the requested content
    const discoveryAID = 'did:ara:1001'
    const channel = createChannel()
    channel.join(discoveryAID)
    channel.on('peer', (id, peer, type) =>
      handlePeer(id, peer, type, requester)
    )

    // Simulate ending of the job after 2 seconds
    setTimeout(() => {
      const report = new Map()
      farmerConnections.forEach((value, key) => {
        report.set(key, Math.floor(Math.random() * 10))
      })
      requester.onJobFinished(report)
    }, 5000)
  })
  .catch(err => {
    console.log(err)
  })

// Handle when a peer connects to the swarm
function handleConnection(connection, info) {
  console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
}

// Process each peer when a new peer is discovered
function handlePeer(id, peer, type, requester) {
  const key = peer.host
  if (!farmerConnections.has(key)) {
    console.log(`CHANNEL: New peer: ${peer.host} on port: ${peer.port}`)
    const port = `${peer.host}:50051`
    const farmerConnection = grpcUtil.connectToFarmer(port)
    farmerConnections.set(key, farmerConnection)
    requester.processFarmer(farmerConnection)
  }
}
