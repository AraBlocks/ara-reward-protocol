const { messages, grpcUtil, MaxCostMatcher } = require('ara-farming-protocol')
const { createChannel, createSwarm } = require('ara-network/discovery')
const { ExampleRequester } = require('./requester')
const ip = require('ip')
const wallets = require('./constant.js')
const afs = require('ara-filesystem')

/**
 * Example: Finds peers on the discovery channel did:ara:desiredContent,
 * then connects to each peer on example port 50051 to determine costs.
 * Uses the MaxCostMatcher to determine peers.
 */

main()

async function main() {
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

  // Create a swarm for downloading the content
  const discoveryAID =
    'did:ara:38d781b7a58b07bd9246be264d571ef46ced2504db679ef556416cf200c43116'
  const requesterWallet = wallets[0]
  const budget = 1
  requesterWallet
    .submitJob(sow.getId(), budget)
    .then(result => {
      // Join the discovery channel for the requested content
      const channel = createChannel()
      channel.join(discoveryAID)
      const requester = new ExampleRequester(
        sow,
        matcher,
        requesterSig,
        startWork,
        requesterWallet
      )

      console.log('looking for peer')

      channel.on('peer', (id, peer, type) =>
        handlePeer(id, peer, type, requester)
      )
    })
    .catch(err => {
      console.log(err)
    })

  async function loadAFS(aid) {
    console.log(aid)
    const createResp = await afs.create({
      did: aid,
      password: 'test'
    })
    return createResp.afs
  }

  async function startWork(ip) {
    const jobPort = `50052`
    const downloadAFS = await loadAFS(discoveryAID)

    const opts = {
      id: requesterDID,
      stream: stream,
      whitelist: [ip]
      //connect: connect
    }

    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)
    swarm.addPeer(ip, { host: ip, port: jobPort })

    // function connect(connection, wire){
    //     console.log("Connect called")
    //     pump(wire, connection, wire)
    //     swarm.emit('connection', connection, connection.peer)
    //     //connection.emit('handshake', requesterDID)
    // }

    function stream(peer) {
      const partition = downloadAFS.partitions.resolve(downloadAFS.HOME)
      if (partition.content) {
        const { content } = partition
        content.once('sync', () => {
          console.log('Did sync %s', toLower(bytes(content.byteLength)))
        })
      }

      const stream = downloadAFS.replicate({
        upload: false,
        download: true
      })
      stream.once('end', onend)
      stream.peer = peer
      return stream
    }

    async function onend() {
      downloadAFS.close()
      swarm.destroy()
      channel.destroy()
      console.log(await downloadAFS.readdir('.'))
      console.log(`Downloaded!`)
      console.log('Swarm destroyed')

      const report = new Map()
      farmerConnections.forEach((value, key) => {
        report.set(key, Math.floor(Math.random() * 10))
      })
      requester.onJobFinished(report)
    }

    // Handle when a peer connects to the swarm
    async function handleConnection(connection, info) {
      console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)

      try {
        downloadAFS.on('sync', () => {
          console.log('SYNC!')
        })
        downloadAFS.on('syncing', () => {
          console.log('SYNCING!')
        })
        await downloadAFS.download('.')
      } catch (err) {
        console.log(`Error: ${err}`)
      }
    }
  }

  // Process each peer when a new peer is discovered
  function handlePeer(id, peer, type, requester) {
    const key = peer.host
    if (!farmerConnections.has(key)) {
      console.log(`CHANNEL: New peer: ${peer.host} on port: ${peer.port}`)
      const port = `${peer.host}:50051`
      const farmerConnection = grpcUtil.connectToFarmer(port)
      farmerConnections.set(key, farmerConnection)
      requester.processFarmer(farmerConnection)
    }
  }
}

// Create channel to discover each other => process each farmer using grpc =>
// When the farmer gets hired, spin up swarm to do the streaming work
