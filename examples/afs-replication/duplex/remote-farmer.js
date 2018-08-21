const {
  unpackKeys, configFarmerHandshake, ContractABI, constants
} = require('../../index')
const { messages, afpstream, util } = require('../../../index')
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const duplexify = require('duplexify')
const debug = require('debug')('afp:duplex-example:main')

const {
  contractAddress, walletAddresses, afsDIDs, farmerDID
} = constants
const { idify } = util
const wallet = new ContractABI(contractAddress, walletAddresses[3])

const networkkeypath = null
// const networkkeypath = constants.networkPublicKeypath

for (let i = 0; i < afsDIDs.length; i++) {
  broadcast(afsDIDs[i], 1, networkkeypath)
}

/**
 * Broadcast the ability to farm for an AFS
 * @param {string} did DID of the AFS
 * @param {int} price Desired cost per unit
 * @param {string} keypath Keypath to Ara Network Key
 */
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

  // Load network keys for encryption if applicable
  let handshakeConf
  if (keypath) {
    try { handshakeConf = await unpackKeys(farmerDID, keypath) } catch (e) { debug({ e }) }
  }

  // Join the discovery swarm for the requested content
  createFarmingSwarm(did, farmer, handshakeConf)
}

// Creates a swarm to find requesters
function createFarmingSwarm(did, farmer, conf) {
  const stream = conf ? () => configFarmerHandshake(conf) : null
  const swarm = createSwarm({
    stream
  })
  swarm.on('connection', handleConnection)
  swarm.join(did, { announce: false })

  function handleConnection(connection, info) {
    debug(`SWARM: New peer: ${idify(info.host, info.port)}`)
    let duplex = connection
    if (conf) {
      const writer = connection.createWriteStream()
      const reader = connection.createReadStream()
      duplex = duplexify(writer, reader)
    }
    const requesterConnection = new afpstream.RequesterConnection(info, duplex, { timeout: 6000 })
    farmer.processRequester(requesterConnection)
  }

  return swarm
}
