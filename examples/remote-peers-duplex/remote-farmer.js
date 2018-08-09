const { contractAddress, walletAddresses } = require('../constants.js')
const { messages, afpstream } = require('ara-farming-protocol')
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const ContractABI = require('../farming_contract/contract-abi.js')
const through = require('through')
const { idify } = require('../util')
const ip = require('ip')

const wallet = new ContractABI(contractAddress, walletAddresses[0])
const price = 1

const dids = [
  'c0e80c9943b5c99c626b8888f0526c43eeadc22087ef68532c309d565c35afea',
  '556399cef520525d2733567eab2a3505d156fa2ca2a94c5aa9964e844a3dc1a8'
]

for (let i = 0; i < dids.length; i++) {
  broadcast(dids[i], price)
}

async function broadcast(did, price) {
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
