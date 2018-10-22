const {messages, matchers, duplex, util} = require('ara-farming-protocol')
const ContractABI = require('./contract/contract-abi')
const { ExampleRequester } = require('./requester')
const { createSwarm } = require('ara-network/discovery')
const { info, warn } = require('ara-console')
const crypto = require('ara-crypto')
const debug = require('debug')('afp:duplex-example:main')
const clip = require('cli-progress')
const { createCFS } = require('cfsnet/create')
const { idify, gbsToBytes, etherToWei } = util
const { FarmerConnection } = duplex
const constants = require('./local/constants.json')
const { walletAddresses } = require('./ganache-addresses')
const wallet = new ContractABI(walletAddresses[constants.requesterWalletIndex])

const cfsPath = './local/.ara/cfs/requesterCFS'
const jsonPath = './local/.ara/cfs/cfsDid.json'
const cfsJson = require(jsonPath)

download(constants.requesterPrice)

/**
 * Download a specific AFS
 * @param {string} did DID of the AFS
 * @param {float} reward Reward in Ether/GB
 * @param {string} keypath Path to Ara Network Key
 */
async function download(reward) {
  // Convert Ether/GB to Wei/Byte
  const convertedReward = etherToWei(reward) / gbsToBytes(1)

  // A default matcher which will match for a max cost to a max of number of farmingCount in constants
  const matcher = new matchers.MaxCostMatcher(convertedReward, constants.farmingCount)

  // The ARAid of the Requester
  const requesterDID = '402a5807434506ea83268177b0dc84d6ec785cf6836dc44b54794e925c104610'
  const requesterID = new messages.AraId()
  requesterID.setDid(requesterDID)

  // A signature that a farmer can use to verify that the requester has signed an agreement
  const requesterSig = new messages.Signature()
  requesterSig.setAraId(requesterID)
  requesterSig.setData('avalidsignature')

  // Create the statement of work
  const sow = new messages.SOW()
  sow.setNonce(crypto.randomBytes(32))
  sow.setWorkUnit('Byte')
  sow.setRequester(requesterID)

  let cfs
  try {
    cfs = await createCFS({
      id: cfsJson.id,
      key: Buffer.from(cfsJson.key, 'hex'),
      path: cfsPath
    })
  } catch (e) {
    debug(e);
  }

  // Create the requester object
  const requester = new ExampleRequester(sow, matcher, requesterSig, wallet, cfs, onComplete)

  // Visualize the download progress
  setupDownloadVisualizer(requester)

  // Find farmers
  const farmerSwarm = createFarmerSwarm(cfsJson.key, requester)

  // Handle when the swarms end
  async function onComplete(error) {
    if (error) {
      warn(error)
    }
    info('Swarm destroyed')
    if (afs) afs.close()
    if (farmerSwarm) farmerSwarm.destroy()
    process.exit(0)
  }
}

// Creates a swarm to find farmers
function createFarmerSwarm(did, requester) {
  const swarm = createSwarm()
  swarm.on('connection', handleConnection)
  swarm.join(did)

  function handleConnection(connection, peer) {
    info(`Farmer Swarm: Peer connected: ${idify(peer.host, peer.port)}`)
    const farmerConnection = new FarmerConnection(peer, connection, { timeout: 6000 })
    process.nextTick(() => requester.addFarmer(farmerConnection))
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
