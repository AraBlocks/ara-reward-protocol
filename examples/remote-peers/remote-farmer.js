const { ExampleFarmer } = require('./farmer')
const { broadcastFarmer } = require('../../src/farmer-server')
const messages = require('../../src/proto/messages_pb')
const ann = require('ara-network')
const ip = require('ip')

/*
    Example: Broadcasts availability on discovery channel did:ara:desiredChannel,
    and runs farmer server on port 50051. 
*/

const port = `${ip.address()}:50051`
const price = 6

// Farmer ID
const farmerID = new messages.ARAid()
farmerID.setDid(`did:ara:2`)

// Farmer Signature
const farmerSig = new messages.Signature()
farmerSig.setId = farmerID
farmerSig.setData('avalidsignature')

// Farmer Server
const farmer = new ExampleFarmer(farmerID, farmerSig, price)
broadcastFarmer(farmer, port)

// Discovery Channel
const discoveryAID = `did:ara:desiredContent`
const channel = ann.discovery.createChannel()
channel.join(discoveryAID, 19000)