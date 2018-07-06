const { connectToFarmer } = require('../../src/farmer-server')
const { ExampleRequester } = require('./requester')
const { MaxCostMatcher } = require('../../src/matchers/max-cost-matcher')
const messages = require('../../src/proto/messages_pb')
const ann = require('ara-network')

/*
    Example: 
*/

// TODO Create AFS/CFS for contentChannel
// TODO Get peers for contentChannel
// TODO Attempt to connect to peers with contentChannel (Reserved port?)

// Requester
const matcher = new MaxCostMatcher(10, 5)

const requesterID = new messages.ARAid()
requesterID.setDid('did:ara:392bf0b8cfaf74e7d4e66b3960168c9892f3cb589b6594e26bff83736d49c220')

const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

const requesterSig = new messages.Signature()
requesterSig.setId = requesterID
requesterSig.setData('avalidsignature')

const requester = new ExampleRequester(sow, matcher, requesterSig)

const discoveryAID = `did:ara:desiredContent`
const channel = ann.discovery.createChannel()
channel.join(discoveryAID, 19000)
channel.on('peer', (id, peer, type) => handlePeer(id, peer, type, requester))


function handlePeer (id, peer, type, requester){
    console.log(`Found peer: ${peer.host}`)
    const port = `${peer.host}:50051`
    const farmerConnection = [connectToFarmer(port)]
    requester.processFarmers(farmerConnection)
}