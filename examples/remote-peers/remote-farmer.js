const { messages, grpcUtil } = require('ara-farming-protocol')
const { ExampleFarmer } = require('./farmer')
const ann = require('ara-network')
const ip = require('ip')

/**
 * Example: Broadcasts availability on discovery channel did:ara:desiredChannel,
 * and runs farmer server on example port 50051.
 */

// The ARAid of the Farmer
const farmerID = new messages.ARAid()
farmerID.setDid('did:ara:brandonsPC')

// A signature that a requester can use to verify that the farmer has signed an agreement
const farmerSig = new messages.Signature()
farmerSig.setId = farmerID
farmerSig.setData('avalidsignature')

// The Farmer instance which sets a specific price, an ID, and a signature
const price = 6
const farmer = new ExampleFarmer(farmerID, farmerSig, price)

// Start broadcasting the willingness to farm
const port = `${ip.address()}:50051`
const farmerServer = new grpcUtil.FarmerServer(farmer, port)
farmerServer.start()

// Broadcast on the discovery channel for what the farmer can produce
const discoveryAID = 'did:ara:1000'
const channel = ann.discovery.createChannel()
channel.join(discoveryAID, 19000)
