const { messages, grpcUtil, MaxCostMatcher } = require('ara-farming-protocol')
const { ExampleRequester } = require('./requester')
const { createChannel } = require('ara-network/discovery')

/**
 * Example: Finds peers on the discovery channel did:ara:desiredContent,
 * then connects to each peer on example port 50051 to determine costs.
 * Uses the MaxCostMatcher to determine peers.
 */

// A default matcher which will match for a max cost of 10 to a max of 5 farmers
const matcher = new MaxCostMatcher(10, 5)

// The ARAid of the Requester
const requesterID = new messages.ARAid()
requesterID.setDid('did:ara:1')

// A signature that a farmer can use to verify that the requester has signed a contract
const requesterSig = new messages.Signature()
requesterSig.setId = requesterID
requesterSig.setData('avalidsignature')

// Create the statement of work
const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

const requester = new ExampleRequester(sow, matcher, requesterSig)

// The RPC Connections to the farmers
const farmerConnections = new Map()

// Join the discovery channel for the requested content
const discoveryAID = 'did:ara:1000'
const channel = createChannel()
channel.join(discoveryAID)
channel.on('peer', (id, peer, type) => handlePeer(id, peer, type, requester))

// Process each peer when a new peer is discovered
function handlePeer(id, peer, type, requester) {
  const key = peer.host
  if (!farmerConnections.has(key)) {
    console.log(`New peer: ${peer.host} on port: ${peer.port}`)
    const port = `${peer.host}:50051`
    const farmerConnection = grpcUtil.connectToFarmer(port)
    farmerConnections.set(key, farmerConnection)
    requester.processFarmer(farmerConnection)
  }
}
