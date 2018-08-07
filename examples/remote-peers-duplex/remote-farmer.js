const { messages, afpstream } = require('ara-farming-protocol')
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const through = require('through')
const util = require('../util')
const ip = require('ip')

const dids = [
  'ab5867eeaeacebda573ae252331f4b1b298fd9a8ca883f2b28bad5764f10f99c',
  '5a0ca463a488b4d3d85ea243087043e1b87b35eae8e15c86c99c4b4d9c14179b'
]

for (let i = 0; i < dids.length; i++) {
  broadcast(dids[i])
}

async function broadcast(did) {
  console.log('Broadcasting: ', did)

  // The ARAid of the Farmer
  const farmerID = new messages.ARAid()
  const farmerDID = 'did:ara:75'
  farmerID.setDid(farmerDID)

  // A signature that a requester can use to verify that the farmer has signed an agreement
  const farmerSig = new messages.Signature()
  farmerSig.setAraId(farmerID)
  farmerSig.setData('avalidsignature')

  // Load the afs
  const { afs } = await create({ did })

  // The Farmer instance which sets a specific price, an ID, and a signature
  const price = 6
  const farmer = new ExampleFarmer(farmerID, farmerSig, price, (port) => startWork(port, afs))

  // Join the discovery swarm for the requested content
  const swarm = createFarmingSwarm(did, farmer)
}

function createFarmingSwarm(did, farmer){
  const opts = {
    stream,
  }

  const swarm = createSwarm(opts)
  swarm.on('connection', handleConnection)
  swarm.join(did)

  function stream(peer) {
    const us = util.idify(ip.address(), this.address().port)
    const them = util.idify(peer.host, peer.port)

    if (us === them) {
      return through()
    }
    const connection = new afpstream.FarmStream(peer, { wait: 100, timeout: 10000 })
    farmer.processRequester(connection)

    return connection.stream
  }

  function handleConnection(connection, info) {
    console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
  }

  return swarm
}

async function startWork(port, afs) {
  const opts = {
    stream
  }
  const swarm = createSwarm(opts)
  swarm.on('connection', handleConnection)
  swarm.listen(port)

  function stream(peer) {
    const stream = afs.replicate({
      upload: true,
      download: false
    })
    stream.once('end', onend)

    function onend() {
      console.log('Uploaded!')
      swarm.destroy()
    }

    return stream
  }

  function handleConnection(connection, info) {
    console.log(`Peer connected: ${info.host} on port: ${info.port}`)
  }
}
