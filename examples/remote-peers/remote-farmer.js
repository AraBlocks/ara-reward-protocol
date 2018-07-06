const { ExampleFarmer } = require('./farmer')
const { broadcastFarmer } = require('../../src/farmer-server')
const messages = require('../../src/proto/messages_pb')
const ann = require('ara-network')

/*
    Example:
*/

const port = `localhost:50051`
const price = 6

const farmerID = new messages.ARAid()
farmerID.setDid(`did:ara:47666f5d50f8421677da981d7a755f4644329dab38c5c32a2017919d1fe312f1`)

const farmerSig = new messages.Signature()
farmerSig.setId = farmerID
farmerSig.setData('avalidsignature')

// Generate Server
const farmer = new ExampleFarmer(farmerID, farmerSig, price)
broadcastFarmer(farmer, port)


const discoveryAID = `did:ara:desiredContent`
const channel = ann.discovery.createChannel()
channel.join(discoveryAID, 19000)