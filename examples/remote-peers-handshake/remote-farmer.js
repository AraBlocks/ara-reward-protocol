const {
  contractAddress, walletAddresses, farmerDID, networkDIDs, networkPublicKeypath
} = require('../constants.js')
const { unpackKeys, configHandshake } = require('./handshake-utils.js')
const { messages, afpstream, util } = require('ara-farming-protocol')

const { idify, nonceString } = util
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const through = require('through')
const ContractABI = require('../farming_contract/contract-abi.js')
const debug = require('debug')('afp:duplex-example:main')
const duplexify = require('duplexify')

const wallet = new ContractABI(contractAddress, walletAddresses[3])
const price = 1

for (let i = 0; i < networkDIDs.length; i++) {
  broadcast(networkDIDs[i], price)
}

async function broadcast(did, price) {
  debug('Broadcasting: ', did)

  // The ARAid of the Farmer
  const farmerID = new messages.AraId()
  farmerID.setDid(farmerDID)

  // A signature that a requester can use to verify that the farmer has signed an agreement
  const farmerSig = new messages.Signature()
  farmerSig.setAraId(farmerID)
  farmerSig.setData('avalidsignature')

  // Load the afs
  const { afs } = await create({ did })

  // The Farmer instance which sets a specific price, an ID, and a signature
  const farmer = new ExampleFarmer(farmerID, farmerSig, price, port => startWork(port, afs), wallet)

  // Join the discovery swarm for the requested content
  let handshakeConf
  try { handshakeConf = await unpackKeys(farmerDID, networkPublicKeypath) } catch (e) { debug({ e }) }

  const swarm = createFarmingSwarm(did, farmer, handshakeConf)
}

function createFarmingSwarm(did, farmer, conf) {
  const opts = {
    stream
  }

  const swarm = createSwarm(opts)
  swarm.on('connection', handleConnection)
  swarm.join(did)
  function stream(peer) {
    if (peer.host.indexOf('::') !== 0 || 'utp' === peer.type) {
      return through()
    }
    return configHandshake(farmerDID, conf)
  }

  function handleConnection(connection, info) {
    debug(`SWARM: New peer: ${idify(info.host, info.port)}`)
    const writer = connection.createWriteStream()
    const reader = connection.createReadStream()
    const stream = duplexify(writer, reader)
    const requesterConnection = new afpstream.RequesterConnection(info, stream, { timeout: 6000 })
    farmer.processRequester(requesterConnection)
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
