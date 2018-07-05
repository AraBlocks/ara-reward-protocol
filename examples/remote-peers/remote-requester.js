const { connectToFarmer } = require('../../src/farmer-server')
const { ExampleRequester } = require('./requester')
const { MaxCostMatcher } = require('../../src/matchers/max-cost-matcher')
const messages = require('../../src/proto/messages_pb')

/*
    Example: 
*/

// Farmer
const port = `localhost:50051`
const farmerConnections = [connectToFarmer(port)]

// Requester
const matcher = new MaxCostMatcher(10, 5)

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
