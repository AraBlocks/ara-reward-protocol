const sinon = require('sinon')
const test = require('ava')

const {
  messages,
  matchers,
  afpgrpc,
} = require('../../../index')

const { ExampleFarmer } = require('./farmer')
const { ExampleRequester } = require('./requester')

// Simulates and connects to a number of Farmer Servers
function simulateFarmerConnections(count) {
  const sPort = 50051

  const farmerConnections = []
  for (let i = 0; i < count; i++) {
    const port = `localhost:${(sPort + i).toString()}`
    const price = 5 + Math.floor(Math.random() * 10)

    const farmerID = new messages.AraId()
    farmerID.setDid(`${i}`)

    const farmerSig = new messages.Signature()
    farmerSig.setAraId(farmerID)
    farmerSig.setData('avalidsignature')

    // Generate Server
    const farmer = new ExampleFarmer(farmerID, farmerSig, price)
    afpgrpc.util.broadcastFarmer(farmer, port)

    // Generate Client Connection
    const connection = afpgrpc.util.connectToFarmer(port)
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
const matcher = new matchers.MaxCostMatcher(10, 5)

const requesterID = new messages.AraId()
requesterID.setDid('10056')

const sow = new messages.SOW()
sow.setNonce('2')
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

const requesterSig = new messages.Signature()
requesterSig.setAraId(requesterID)
requesterSig.setData('avalidsignature')

const requester = new ExampleRequester(sow, matcher, requesterSig)

test('multi-farmer-simulation', (t) => {
  requester.processFarmers(farmerConnections)

  // TODO
  t.true(true)
})
