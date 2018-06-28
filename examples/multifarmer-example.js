const { Farmer, broadcastFarmer, connectToFarmer } = require('../farmer')
const { Requester } = require('../requester')
const { ExampleMatcher } = require('./ExampleMatcher')
const { ExampleFarmerAuth, ExampleRequesterAuth } = require('./ExampleAuthenticators')
const { ExampleQuoter } = require('./ExampleQuoter')
const messages = require('../proto/messages_pb')

/*
    Simulates and connects to a number of Farmer Servers
*/
function simulateFarmerConnections(count, authenticator) {
  const sPort = 50051

  const farmers = []
  for (let i = 0; i < count; i++) {
    const port = `localhost:${(sPort + i).toString()}`
    const price = 5 + Math.floor(Math.random() * 10)

    const farmerSig = new messages.ARAid()
    farmerSig.setId(i)
    farmerSig.setSignature(Math.floor(1000 * Math.random()))

    const quoter = new ExampleQuoter(price, farmerSig)

    // Generate Server
    const farmer = new Farmer(quoter, i, authenticator)
    broadcastFarmer(farmer, port)

    // Generate Client Connection
    const connection = connectToFarmer(port)
    farmers.push(connection)
  }
  return farmers
}

/*
    Example: generate and connect to 50 farmers, then hire up to
    7 farmers who charge <= 10 Ara per MB. Requester Authenticator
    considers user 10057 as invalid requester. Farmer Authenticator
    considers uder 2 as an invalid farmer.
*/

// Farmers
const requestAuth = new ExampleRequesterAuth(10057)
const farmers = simulateFarmerConnections(50, requestAuth)

// Requester
const matcher = new ExampleMatcher(10, 7)
const farmAuth = new ExampleFarmerAuth(2)

const requesterSig = new messages.ARAid()
requesterSig.setId(10056)
requesterSig.setSignature(11111)

const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterSig)

const requester = new Requester(sow, matcher, farmAuth)
requester.processFarmers(farmers)
