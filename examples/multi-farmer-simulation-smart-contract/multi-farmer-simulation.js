const {
  Farmer,
  broadcastFarmer,
  connectToFarmer
} = require('../../lib/farmer')
const { Requester } = require('../../lib/requester')
const { ExampleMatcher } = require('./matcher')
const {
  ExampleFarmerAuth,
  ExampleRequesterAuth
} = require('./peer-authenticators')
const { ExampleQuoteGenerator } = require('./quote-generator')
const { ExampleContractGenerator } = require('./contract-generator')
const messages = require('../../lib/proto/messages_pb')

/*
    Simulates and connects to a number of Farmer Servers
*/
function simulateFarmerConnections(count, authenticator) {
  const sPort = 50051

  const farmerConnections = []
  for (let i = 0; i < count; i++) {
    const port = `localhost:${(sPort + i).toString()}`
    const price = 5 + Math.floor(Math.random() * 10)

    const farmerSig = new messages.ARAid()
    farmerSig.setId(i)
    farmerSig.setSignature(Math.floor(1000 * Math.random()))

    const quoteGenerator = new ExampleQuoteGenerator(price, farmerSig)

    // Generate Server
    const farmer = new Farmer(i, quoteGenerator, authenticator)
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
const requestAuth = new ExampleRequesterAuth(10057)
const farmerConnections = simulateFarmerConnections(10, requestAuth)

// Requester
const contractGen = new ExampleContractGenerator(104, 100)
const matcher = new ExampleMatcher(10, 5)
const farmAuth = new ExampleFarmerAuth(2)

const requesterSig = new messages.ARAid()
requesterSig.setId(10056)
requesterSig.setSignature(11111)

const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterSig)

const requester = new Requester(sow, matcher, farmAuth, contractGen)
requester.processFarmers(farmerConnections)

setTimeout(() => {
  requester.sendReward()
}, 1000)
