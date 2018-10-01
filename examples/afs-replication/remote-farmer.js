const {
  unpackKeys, configFarmerHandshake, ContractABI, constants
} = require('../index')
const mirror = require('mirror-folder')
const { messages, duplex, util } = require('../../index')
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { info } = require('ara-console')
const { create } = require('ara-filesystem')
const duplexify = require('duplexify')
const debug = require('debug')('afp:duplex-example:main')
const aid = require('ara-filesystem/aid')
const { createAFSKeyPath } = require('ara-filesystem/key-path')
const {
  join,
  basename,
  resolve
} = require('path')
const {
  web3: { toHex }
} = require('ara-util')
const { defaultStorage } = require('ara-filesystem/storage')
const { createCFS } = require('cfsnet/create')


const {
  contractAddress, walletAddresses, afsDIDs, farmerDID
} = constants
const { idify, etherToWei, gbsToBytes } = util
const { RequesterConnection } = duplex
const wallet = new ContractABI(contractAddress, walletAddresses[3])

const useSubnet = ('--subnet' === process.argv[2])

const networkkeypath = (useSubnet) ? constants.networkPublicKeypath : null

for (let i = 0; i < afsDIDs.length; i++) {
  broadcast(afsDIDs[i], 1, networkkeypath)
}

/**
 * Broadcast the ability to farm for an AFS
 * @param {string} did DID of the AFS
 * @param {int} price Desired Cost in Ether per GB
 * @param {string} keypath Keypath to Ara Network Key
 */
async function broadcast(did, price, keypath) {
  info('Broadcasting: ', did)

  // The ARAid of the Farmer
  const farmerID = new messages.AraId()
  farmerID.setDid(farmerDID)

  // A signature that a requester can use to verify that the farmer has signed an agreement
  const farmerSig = new messages.Signature()
  farmerSig.setAraId(farmerID)
  farmerSig.setData('avalidsignature')

  let afs
  try {
    afs = await createCFS({
      path: '/Users/huydao/.ara/afs/newAFS2'
    })
    await mirrorPath('robot.jpg', afs)
  } catch (e) {
    console.log(e);
  }

  async function mirrorPath(path, afs) {
    debug(`copy start: ${path}`)
    const name = join(afs.HOME, basename(path))

    // Mirror and log
    const progress = mirror({ name: path }, { name, fs: afs }, { keepExisting: true })
    progress.on('put', (src, dst) => {
      debug(`adding path ${dst.name}`)
    })
    progress.on('skip', (src, dst) => {
      debug(`skipping path ${dst.name}`)
    })
    progress.on('del', (dst) => {
      debug(`deleting path ${dst.name}`)
    })

    // Await end or error
    const error = await new Promise((accept, reject) => progress.once('end', accept).once('error', reject))

    if (error) {
      debug(`copy error: ${path}: ${error}`)
    } else {
      debug(`copy complete: ${path}`)
    }
  }

  // Convert Ether/GB to Wei/Byte
  const convertedPrice = etherToWei(price) / gbsToBytes(1)

  // The Farmer instance which sets a specific price, an ID, and a signature
  const farmer = new ExampleFarmer(farmerID, farmerSig, convertedPrice, wallet, afs)

  // Load network keys for encryption if applicable
  let handshakeConf
  if (keypath) {
    info('Using subnetwork encryption')
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

  function handleConnection(connection, peer) {
    info(`SWARM: New peer: ${idify(peer.host, peer.port)}`)
    if (conf) {
      const writer = connection.createWriteStream()
      const reader = connection.createReadStream()
      connection = duplexify(writer, reader)
    }
    const requesterConnection = new RequesterConnection(peer, connection, { timeout: 6000 })
    farmer.addRequester(requesterConnection)
  }

  return swarm
}
