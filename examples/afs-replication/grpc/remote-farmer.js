const { afsDIDs, farmerDID } = require('../../constants.js')
const { createChannel, createSwarm } = require('ara-network/discovery')
const { messages, afpgrpc } = require('ara-farming-protocol')
const { ExampleFarmer } = require('./farmer')
const afs = require('ara-filesystem')
const ip = require('ip')

/**
 * Example: Broadcasts availability on discovery channel did:ara:desiredChannel,
 * and runs farmer server on example port 50051.
 */

broadcast(afsDIDs[0])

async function broadcast(did) {
  const farmPort = '50051'

  // The ARAid of the Farmer
  const farmerID = new messages.ARAid()
  farmerID.setDid(farmerDID)

  // A signature that a requester can use to verify that the farmer has signed an agreement
  const farmerSig = new messages.Signature()
  farmerSig.setAraId(farmerID)
  farmerSig.setData('avalidsignature')

  // The Farmer instance which sets a specific price, an ID, and a signature
  const price = 6
  const farmer = new ExampleFarmer(farmerID, farmerSig, price, startWork)

  // Start broadcasting the willingness to farm
  const port = `${ip.address()}:${farmPort}`
  const farmerServer = new afpgrpc.util.FarmerServer(farmer, port)
  farmerServer.start()

  // Broadcast on the discovery channel for what the farmer can produce
  const channel = createChannel()
  channel.join(did, 19000)

  async function startWork(agreement, port) {
    const requester = agreement.getRequesterSignature().getAraId()
    const reqMap = new Map()

    console.log(`Agreement Data: ${requester}`)

    const uploadAFS = await loadAFS(did)

    // Create a swarm for uploading the content
    const opts = {
      id: farmerDID,
      stream,
    }

    const swarm = createSwarm(opts)
    swarm.listen(port)

    swarm.on('connection', handleConnection)

    swarm.on('error', (err) => {
      console.log('SWARM: error:', err.message)
    })
    swarm.on('peer', () => {
      console.log('SWARM: OnPeer!')
    })
    swarm.on('authorize', (id, done) => {
      console.log(`authorize peer: ${id}`)
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
      did: aid,
    })
    return createResp.afs
  }
}

