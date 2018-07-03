const { ExampleFarmer } = require('./farmer')
const { broadcastFarmer, connectToFarmer } = require('../../src/farmer-server')
const { ExampleRequester } = require('./requester')
const { ExampleMatcher } = require('./matcher')
const messages = require('../../src/proto/messages_pb')

// Simulates and connects to a number of Farmer Servers
function simulateFarmerConnections(count) {
  const sPort = 50051

  const farmerConnections = []
  for (let i = 0; i < count; i++) {
    const port = `localhost:${(sPort + i).toString()}`
    const price = 5 + Math.floor(Math.random() * 10)

    const farmerID = new messages.ARAid()
    farmerID.setDid(`ara:did:${i}`)

    const farmerSig = new messages.Signature()
    farmerSig.setId = farmerID
    farmerSig.setData('avalidsignature')

    // Generate Server
    const farmer = new ExampleFarmer(farmerID, farmerSig, price)
    broadcastFarmer(farmer, port)

    // Generate Client Connection
    const connection = connectToFarmer(port)
    farmerConnections.push(connection)
  }
  return farmerConnections
}

/*
    Example: generate and connect to 10 farmers, then hire up to
    5 farmers who charge <= 10 Ara per MB. Requester Authenticator
    considers user 10057 as invalid requester. Farmer Authenticator
    considers user 2 as an invalid farmer.
*/

// Farmers
const farmerConnections = simulateFarmerConnections(10)

// Requester
const matcher = new ExampleMatcher(10, 5)

const requesterID = new messages.ARAid()
requesterID.setDid('ara:did:10056')

const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

const requesterSig = new messages.Signature()
requesterSig.setId = requesterID
requesterSig.setData('avalidsignature')

const requester = new ExampleRequester(sow, matcher, requesterSig)
requester.processFarmers(farmerConnections)
