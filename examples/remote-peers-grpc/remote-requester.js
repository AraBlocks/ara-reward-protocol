const { messages, afpgrpc, matchers } = require('ara-farming-protocol')
const { createChannel, createSwarm } = require('ara-network/discovery')
const { ExampleRequester } = require('./requester')
const afs = require('ara-filesystem')
const ip = require('ip')

/**
 * Example: Finds peers on the discovery channel did:ara:desiredContent,
 * then connects to each peer on example port 50051 to determine costs.
 * Uses the MaxCostMatcher to determine peers.
 */

main()

async function main() {
  // A default matcher which will match for a max cost of 10 to a max of 5 farmers
  const matcher = new matchers.MaxCostMatcher(10, 5)

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
  const discoveryAID = 'did:ara:38d781b7a58b07bd9246be264d571ef46ced2504db679ef556416cf200c43116'

  // Join the discovery channel for the requested content
  const channel = createChannel()
  channel.join(discoveryAID)
  const requester = new ExampleRequester(sow, matcher, requesterSig, startWork)
  channel.on('peer', (id, peer, type) => handlePeer(id, peer, type, requester))

  async function loadAFS(aid) {
    const createResp = await afs.create({
      did: aid,
    })
    return createResp.afs
  }

  async function startWork(ip) {
    const jobPort = '50052'
    const downloadAFS = await loadAFS(discoveryAID)

    const opts = {
      id: requesterDID,
      stream,
      whitelist: [ ip ],
    }

    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)
    swarm.addPeer(ip, { host: ip, port: jobPort })

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
      console.log('Downloaded!')
      console.log('Swarm destroyed')
    }

    // Handle when a peer connects to the swarm
    async function handleConnection(connection, info) {
      console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
    }
  }

  // Process each peer when a new peer is discovered
  function handlePeer(id, peer, type, requester) {
    const key = peer.host
    if (!farmerConnections.has(key)) {
      console.log(`CHANNEL: New peer: ${peer.host} on port: ${peer.port}`)
      const port = `${peer.host}:50051`
      const farmerConnection = afpgrpc.util.connectToFarmer(port)
      farmerConnections.set(key, farmerConnection)
      requester.processFarmer(farmerConnection)
    }
  }
}
