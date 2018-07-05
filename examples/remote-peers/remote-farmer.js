const { ExampleFarmer } = require('./farmer')
const { broadcastFarmer } = require('../../src/farmer-server')
const messages = require('../../src/proto/messages_pb')

/*
    Example:
*/

const port = `localhost:50051`
const price = 6

const farmerID = new messages.ARAid()
farmerID.setDid(`ara:did:3`)

const farmerSig = new messages.Signature()
farmerSig.setId = farmerID
farmerSig.setData('avalidsignature')

// Generate Server
const farmer = new ExampleFarmer(farmerID, farmerSig, price)
broadcastFarmer(farmer, port)
