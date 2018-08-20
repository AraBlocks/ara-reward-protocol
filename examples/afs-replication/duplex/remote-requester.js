const {
  contractAddress, walletAddresses, afsDIDs, requesterDID, networkSecretKeypath
} = require('../../constants.js')
const { unpackKeys, configRequesterHandshake } = require('../../handshake-utils.js')
const {
  messages, matchers, afpstream, util
} = require('ara-farming-protocol')

const { idify, nonceString } = util
const { ExampleRequester } = require('./requester')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const ContractABI = require('../../farming_contract/contract-abi.js')
const crypto = require('ara-crypto')
const debug = require('debug')('afp:duplex-example:main')
const clip = require('cli-progress')

const wallet = new ContractABI(contractAddress, walletAddresses[2])

const keypath = null
// const keypath = networkSecretKeypath

download(afsDIDs[0], 1, keypath)

/**
 * Download a specific AFS
 * @param {string} did DID of the AFS
 * @param {float} reward Reward per unit of work
 * @param {string} keypath Path to Ara Network Key 
 */
async function download(did, reward, keypath) {
  // A default matcher which will match for a max cost of 10 to a max of 5 farmers
  const matcher = new matchers.MaxCostMatcher(reward, 5)

  // The ARAid of the Requester
  const requesterID = new messages.AraId()
  requesterID.setDid(requesterDID)

  // A signature that a farmer can use to verify that the requester has signed an agreement
  const requesterSig = new messages.Signature()
  requesterSig.setAraId(requesterID)
  requesterSig.setData('avalidsignature')

  // Create the statement of work
  const sow = new messages.SOW()
  sow.setNonce(crypto.randomBytes(32))
  sow.setWorkUnit('MB')
  sow.setRequester(requesterID)

  // Load the sparse afs
  const { afs } = await create({ did })

  // Create the requester object
  const requester = new ExampleRequester(sow, matcher, requesterSig, wallet, afs, onComplete)

  // Visualize the download progress
  setupDownloadVisualizer(requester)

  // Load network keys if applicable
  let handshakeConf
  if (keypath) {
    try { handshakeConf = await unpackKeys(requesterDID, networkSecretKeypath) } catch (e) { debug({ e }) }
  }

  // Find farmers
  const farmerSwarm = createFarmerSwarm(did, requester, handshakeConf)

  // Handle when the swarms end
  async function onComplete(error) {
    if (error) {
      debug(error)
    }
    debug('Swarm destroyed')
    if (afs) afs.close()
    if (farmerSwarm) farmerSwarm.destroy()
  }
}

// Creates a swarm to find farmers
function createFarmerSwarm(did, requester, conf) {
  // Override the stream if encryption handshake required
  const stream = conf ? () => configRequesterHandshake(conf) : null
  const swarm = createSwarm({
    stream
  })
  swarm.on('connection', handleConnection)
  swarm.join(did)

  function handleConnection(connection, info) {
    debug(`Farmer Swarm: Peer connected: ${idify(info.host, info.port)}`)
    let stream = connection
    if (conf) {
      const writer = connection.createWriteStream()
      const reader = connection.createReadStream()
      stream = duplexify(writer, reader)
    }
    const farmerConnection = new afpstream.FarmerConnection(info, stream, { timeout: 6000 })
    process.nextTick(() => requester.processFarmer(farmerConnection))
  }

  return swarm
}

// Creates a progress visualizer bar in cli
function setupDownloadVisualizer(requester) {
  const pBar = new clip.Bar({}, clip.Presets.shades_classic)
  requester.once('downloading', total => pBar.start(total, 0))
  requester.on('progress', value => pBar.update(value))
  requester.once('complete', () => pBar.stop())
}
