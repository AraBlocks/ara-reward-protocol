const { messages, grpcUtil } = require('ara-farming-protocol')
const { createChannel, createSwarm } = require('ara-network/discovery')
const { ExampleFarmer } = require('./farmer')
const afs = require('ara-filesystem')
const ip = require('ip')

/**
 * Example: Broadcasts availability on discovery channel did:ara:desiredChannel,
 * and runs farmer server on example port 50051.
 */

const farmPort = `50051`
const jobPort = `50052`


// The ARAid of the Farmer
const farmerID = new messages.ARAid()
const farmerDID = ip.address() // HACK
farmerID.setDid(farmerDID)

// A signature that a requester can use to verify that the farmer has signed an agreement
const farmerSig = new messages.Signature()
farmerSig.setAraId(farmerID)
farmerSig.setData('avalidsignature')

// The Farmer instance which sets a specific price, an ID, and a signature
const discoveryAID = 'did:ara:37f2a1642282b662fc2576951a27a5b7087e1978970251c924efcb5e8a91211d'
const price = 6
const farmer = new ExampleFarmer(farmerID, farmerSig, price, startWork)

// Start broadcasting the willingness to farm
const port = `${ip.address()}:${farmPort}`
const farmerServer = new grpcUtil.FarmerServer(farmer, port)
farmerServer.start()

// Create AFS for upload
const availableAFS = afs.create({
    did: discoveryAID,
})
const stream = (peer) => {
    return availableAFS.replicate({
        download:false,
        upload:true
    })
}

// Broadcast on the discovery channel for what the farmer can produce
const channel = createChannel()
channel.join(discoveryAID, 19000)


function startWork(agreement){
    const requester = agreement.getRequesterSignature().getAraId()
    console.log(`Agreement Data: ${requester}`)

    // Create a swarm for uploading the content
    const opts = {
        id: farmerDID,
        whitelist: [requester],
        stream: stream
    }
    const swarm = createSwarm(opts)
    swarm.listen(jobPort)
    swarm.on('connection', handleConnection)
}


// Handle when a peer connects to the swarm
function handleConnection(connection, info){
    console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
}