const { messages, grpcUtil } = require('ara-farming-protocol')
const { createChannel, createSwarm } = require('ara-network/discovery')
const { ExampleFarmer } = require('./farmer')
const ip = require('ip')
const wallets = require('./constant.js')
const afs = require('ara-filesystem')

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
const discoveryAID =
  'did:ara:3abc0eedd6f9b7f44c06a182b70c2c65b9faf89ddfdbbe1221b2395d0a7c4a08'
const price = 6
const farmer = new ExampleFarmer(
  farmerID,
  farmerSig,
  price,
  startWork,
  wallets[1]
)

// Start broadcasting the willingness to farm
const port = `${ip.address()}:${farmPort}`
const farmerServer = new grpcUtil.FarmerServer(farmer, port)
farmerServer.start()

// Broadcast on the discovery channel for what the farmer can produce
const channel = createChannel()
channel.join(discoveryAID, 19000)

async function startWork(agreement) {
  const requester = agreement.getRequesterSignature().getAraId()
  const reqMap = new Map()

  console.log(`Agreement Data: ${requester}`)

  const uploadAFS = await loadAFS(discoveryAID)

  // Create a swarm for uploading the content
  const opts = {
    id: farmerDID,
    stream: stream
  }

  const swarm = createSwarm(opts)
  swarm.listen(jobPort)

  swarm.on('connection', handleConnection)

  swarm.on('error', err => {
    console.log('SWARM: error:', err.message)
  })

  function stream(peer) {
    const stream = uploadAFS.replicate({
      upload: true,
      download: false
    })
    stream.once('end', onend)
    return stream
  }

  function onend() {
    uploadAFS.close()
    swarm.destroy()
    console.log('Swarm destroyed')
  }

  // Handle when a peer connects to the swarm
  function handleConnection(connection, info) {
    console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
  }
}

async function loadAFS(aid) {
  // Create AFS for upload
  const createResp = await afs.create({
    did: aid
  })
  return createResp.afs
}
