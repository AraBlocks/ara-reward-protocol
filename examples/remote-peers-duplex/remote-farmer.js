const { contractAddress, walletAddresses } = require('../constants.js')
const { messages, afpstream } = require('ara-farming-protocol')
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const ContractABI = require('../farming_contract/contract-abi.js')
const through = require('through')
const idify = afpstream.util.idify
const debug = require('debug')('afp:duplex-example:main')

const ip = require('ip')

const wallet = new ContractABI(contractAddress, walletAddresses[3])
const price = 1

const dids = [
  '70a89141135ca935d532bcb85893be9dff45b68d217288f346e9c0f86fdb7c43',
  '45dc2b50b53a31f5fd602e47290596fdee377ba0c5fb2a1019fdf96bc32b1363',
  '0f77f680a036d0f04676902bcb6df4b399f885c366d09746b50a302fef2dea74'
]

for (let i = 0; i < dids.length; i++) {
  broadcast(dids[i], price)
}

async function broadcast(did, price) {
  debug('Broadcasting: ', did)

  // The ARAid of the Farmer
  const farmerID = new messages.AraId()
  const farmerDID = '2d5e0ad3040be242471b08013daa47876035bb565384936024a77eadd32fe4c9'
  farmerID.setDid(farmerDID)

  // A signature that a requester can use to verify that the farmer has signed an agreement
  const farmerSig = new messages.Signature()
  farmerSig.setAraId(farmerID)
  farmerSig.setData('avalidsignature')

  // Load the afs
  const { afs } = await create({ did })

  // The Farmer instance which sets a specific price, an ID, and a signature
  const farmer = new ExampleFarmer(farmerID, farmerSig, price, (port) => startWork(port, afs), wallet)

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
    const us = idify(ip.address(), this.address().port)
    const them = idify(peer.host, peer.port)

    if (us === them) {
      return through()
    }
    const connection = new afpstream.FarmStream(peer, { timeout: 10000 })
    farmer.processRequester(connection)

    return connection.stream
  }

  function handleConnection(connection, info) {
    debug(`SWARM: New peer: ${info.host} on port: ${info.port}`)
  }

  return swarm
}

async function startWork(port, afs) {
  let uploaded = 0
  const content = afs.partitions.resolve(afs.HOME).content
  content.on('upload', (index, data) => {
    uploaded += 1 // TODO: is this a good way to measure data amount?
  })

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
      debug(`Uploaded ${uploaded} blocks to peer ${peer.host}`)
      swarm.destroy()
    }

    return stream
  }

  function handleConnection(connection, info) {
    debug(`Peer connected: ${info.host} on port: ${info.port}`)
  }
}
