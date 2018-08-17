const { contractAddress, walletAddresses, afsDIDs, farmerDID, networkPublicKeypath } = require('../../constants.js')
const { unpackKeys, configFarmerHandshake } = require('../../handshake-utils.js')
const { messages, afpstream, util } = require('ara-farming-protocol')
const { idify, nonceString } = util
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const ContractABI = require('../../farming_contract/contract-abi.js')
const duplexify = require('duplexify')
const debug = require('debug')('afp:duplex-example:main')

const wallet = new ContractABI(contractAddress, walletAddresses[3])
const price = 1

const keypath = null
//const keypath = networkPublicKeypath

for (let i = 0; i < afsDIDs.length; i++) {
  broadcast(afsDIDs[i], price, keypath)
}

async function broadcast(did, price, keypath) {
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
  const farmer = new ExampleFarmer(farmerID, farmerSig, price, wallet, afs)

  // Load network keys if applicable
  let handshakeConf
  if (keypath) {
    try { handshakeConf = await unpackKeys(farmerDID, keypath) } catch (e) { debug({ e }) }
  }

  // Join the discovery swarm for the requested content
  const swarm = createFarmingSwarm(did, farmer, handshakeConf)
}

function createFarmingSwarm(did, farmer, conf) {
  const stream = conf ? () => configFarmerHandshake(conf) : null
  const swarm = createSwarm({
    stream
  })
  swarm.on('connection', handleConnection)
  swarm.join(did, { announce: false })

  function handleConnection(connection, info) {
    debug(`SWARM: New peer: ${idify(info.host, info.port)}`)
    let stream = connection
    if (conf) {
      const writer = connection.createWriteStream()
      const reader = connection.createReadStream()
      stream = duplexify(writer, reader)
    }
    const requesterConnection = new afpstream.RequesterConnection(info, stream, {timeout: 6000 })    
    farmer.processRequester(requesterConnection)
  }

  return swarm
}
