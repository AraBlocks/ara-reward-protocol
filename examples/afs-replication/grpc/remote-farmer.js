const { createChannel, createSwarm } = require('ara-network/discovery')
const { afsDIDs, farmerDID } = require('../../constants.js')
const { messages, afpgrpc } = require('../../../index')
const { ExampleFarmer } = require('./farmer')
const debug = require('debug')('afp:grpc-example:main')
const afs = require('ara-filesystem')
const ip = require('ip')

broadcast(afsDIDs[0], '50051')

async function broadcast(did, grpcport) {
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
  const address = `${ip.address()}:${grpcport}`
  const farmerServer = new afpgrpc.util.FarmerServer(farmer, address)
  farmerServer.start()

  // Broadcast on the discovery channel for what the farmer can produce
  const channel = createChannel()
  channel.join(did)

  async function startWork(agreement, port) {
    const uploadAFS = await loadAFS(did)

    // Create a swarm for uploading the content
    const opts = {
      id: farmerDID,
      stream,
    }

    const swarm = createSwarm(opts)
    swarm.listen(port)

    swarm.on('connection', handleConnection)

    function stream() {
      const afsstream = uploadAFS.replicate({
        upload: true,
        download: false
      })
      afsstream.once('end', onend)
      return afsstream
    }

    function onend() {
      uploadAFS.close()
      swarm.destroy()
      debug('Swarm destroyed')
    }

    // Handle when a peer connects to the swarm
    function handleConnection(connection, info) {
      debug(`SWARM: New peer: ${info.host} on port: ${info.port}`)
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

