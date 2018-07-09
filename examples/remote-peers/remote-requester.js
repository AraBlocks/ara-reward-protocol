const { ExampleRequester } = require('./requester')
const { messages, grpcUtil, MaxCostMatcher } = require('ara-farming-protocol')
const ann = require('ara-network')

/**
 * Example: Finds peers on the discovery channel did:ara:desiredContent,
 * then connects to each peer on example port 50051 to determine costs. 
 * Uses the MaxCostMatcher to determine peers.
 */
    
// Matcher
const matcher = new MaxCostMatcher(10, 5)

// Requester ID
const requesterID = new messages.ARAid()
requesterID.setDid('did:ara:1')

// Requester Signature
const requesterSig = new messages.Signature()
requesterSig.setId = requesterID
requesterSig.setData('avalidsignature')

// SOW
const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

const requester = new ExampleRequester(sow, matcher, requesterSig)

// RPC Connections
const farmerConnections = new Map()

// Discovery Channel
const discoveryAID = 'did:ara:desiredContent'
const channel = ann.discovery.createChannel()
channel.join(discoveryAID)
channel.on('peer', (id, peer, type) => handlePeer(id, peer, type, requester))

// Process peer on new peers
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
