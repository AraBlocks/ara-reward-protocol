const { messages, grpcUtil, MaxCostMatcher } = require('ara-farming-protocol')
const { createChannel, createSwarm } = require('ara-network/discovery')
const { ExampleRequester } = require('./requester')
const ip = require('ip')
const wallets = require('./constant.js')
const afs = require('ara-filesystem')

// A default matcher which will match for a max cost of 10 to a max of 5 farmers
const matcher = new MaxCostMatcher(10, 5)

// The ARAid of the Requester
const requesterID = new messages.ARAid()
const requesterDID = ip.address() // HACK
requesterID.setDid(requesterDID)

// A signature that a farmer can use to verify that the requester has signed an agreement
const requesterSig = new messages.Signature()
requesterSig.setAraId(requesterID)
requesterSig.setData('avalidsignature')

// Create the statement of work
const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

// The RPC Connections to the farmers
const farmerConnections = new Map()

// A channel which allows the requester and farmers to discover each other
const discoveryAID =
  'did:ara:3abc0eedd6f9b7f44c06a182b70c2c65b9faf89ddfdbbe1221b2395d0a7c4a08'
const channel = createChannel()
channel.join(discoveryAID)

const requesterWallet = wallets[0]
let requester = new ExampleRequester(
  sow,
  matcher,
  requesterSig,
  startWork,
  requesterWallet
)

// Begin work by submitting the job id and budget to the contract
const budget = 1
requesterWallet
  .submitJob(sow.getId(), budget)
  .then(result => {
    // Join the discovery channel for the requested content and process available farmers
    channel.on('peer', (id, peer, type) =>
      handlePeer(id, peer, type, requester)
    )
  })
  .catch(err => {
    console.log(err)
  })

// Process each peer when a new peer is discovered
function handlePeer(id, peer, type, requester) {
  const key = peer.host
  if (!farmerConnections.has(key)) {
    console.log(`Channel: New peer: ${peer.host} on port: ${peer.port}`)
    const port = `${peer.host}:50051`
    const farmerConnection = grpcUtil.connectToFarmer(port)
    farmerConnections.set(key, farmerConnection)
    requester.processFarmer(farmerConnection)
  }
}

// Called after the requester has verified a farmer to start work
async function startWork(ip) {
  const jobPort = `50052`
  const createResp = await afs.create({
    did: discoveryAID
  })
  const downloadAFS = createResp.afs

  const opts = {
    id: requesterDID,
    stream: stream
  }

  function stream(peer) {
    const stream = downloadAFS.replicate({
      upload: false,
      download: true
    })
    stream.once('end', onend)
    return stream
  }

  // Create a swarm for downloading the content
  const swarm = createSwarm(opts)
  swarm.on('connection', handleConnection)
  swarm.addPeer(ip, { host: ip, port: jobPort })

  // Handle when a peer connects to the swarm
  async function handleConnection(connection, info) {
    console.log(`Swarm: New peer: ${info.host} on port: ${info.port}`, '\n')

    try {
      await downloadAFS.download('.')
    } catch (err) {
      console.log(`Error: ${err}`)
    }
  }

  // Handle when the content has been synced to distribute rewards
  async function onend() {
    downloadAFS.close()
    swarm.destroy()
    channel.destroy()
    console.log(`Swarm: Content is synced`)

    const report = new Map()
    farmerConnections.forEach((value, key) => {
      report.set(key, Math.floor(Math.random() * 10))
    })
    requester.onJobFinished(report)
  }
}
