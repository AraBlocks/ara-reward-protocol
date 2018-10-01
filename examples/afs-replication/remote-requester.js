const {
  unpackKeys, configRequesterHandshake, ContractABI, constants
} = require('../index')
const {
  join,
  basename,
  resolve
} = require('path')
const pify = require('pify')
const isFile = require('is-file')
// const ignored = require('./ignore')

const {
  messages, matchers, duplex, util
} = require('../../index')
const mirror = require('mirror-folder')
const { ExampleRequester } = require('./requester')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const { info, warn } = require('ara-console')
const duplexify = require('duplexify')
const crypto = require('ara-crypto')
const debug = require('debug')('afp:duplex-example:main')
const clip = require('cli-progress')
const aid = require('ara-filesystem/aid')
const { createAFSKeyPath } = require('ara-filesystem/key-path')
const {
  web3: { toHex }
} = require('ara-util')
const { defaultStorage } = require('ara-filesystem/storage')
const { createCFS } = require('cfsnet/create')

const {
  contractAddress, walletAddresses, afsDIDs, requesterDID
} = constants
const { idify, gbsToBytes, etherToWei } = util
const { FarmerConnection } = duplex
const wallet = new ContractABI(contractAddress, walletAddresses[2])

const useSubnet = ('--subnet' === process.argv[2])

const networkkeypath = (useSubnet) ? constants.networkSecretKeypath : null

download(afsDIDs[0], 1, networkkeypath)

/**
 * Download a specific AFS
 * @param {string} did DID of the AFS
 * @param {float} reward Reward in Ether/GB
 * @param {string} keypath Path to Ara Network Key
 */
async function download(did, reward, keypath) {
  // Convert Ether/GB to Wei/Byte
  const convertedReward = etherToWei(reward) / gbsToBytes(1)

  // A default matcher which will match for a max cost to a max of 5 farmers
  const matcher = new matchers.MaxCostMatcher(convertedReward, 5)

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
  sow.setWorkUnit('Byte')
  sow.setRequester(requesterID)

  // Load the sparse afs
  // const { afs } = await create({ did })
  // const password = 't'
  // const owner = 'did:ara:4a2dacd7dce2b864a0fd96125e59a177c1a773707bff520c84efd7468f36b38e'
  // let afsId = await aid.create({ password, owner });
  // const { publicKey, secretKey } = afsId
  // console.log(Buffer.from('eec1f470ffc5e51eb39cac0abef5ddc236b7acc10dec88d54c695f778b660af7', 'hex'));
  // const afsDid = toHex('f4d40b4384e4cba215a38a1591beb24b5b4c294646e765a6a4a44cef56777637')
  // console.log(Buffer.from(afsDid));
  // const path = './.ara/afs/test2'

  // console.log("buffer: ", Buffer.from('76a09be2880fcc641682a4e6d6af95f9a6f382603201f410e45c173d9c2a0143', 'hex'));
  // const afs = await createCFS({
  //   id: '76a09be2880fcc641682a4e6d6af95f9a6f382603201f410e45c173d9c2a0143',
  //   key: Buffer.from('76a09be2880fcc641682a4e6d6af95f9a6f382603201f410e45c173d9c2a0143', 'hex'),
  //   path: '/Users/huydao/.ara/afs/336aa8549fbd09275b98df7f0c02974a91bb5113a16224b876dd423cb83f1660'
  // })
  let afs
  try {
    afs = await createCFS({
      path: '/Users/huydao/.ara/afs/newAFS'
    })
    // console.log(afs)
    // await mirrorPath('/Users/huydao/Desktop/robot.jpg', afs)
  } catch (e) {
    console.log(e);
  }
  //
  // try {
  //   await mirrorPath('/Users/huydao/Desktop/robot.jpg')
  //   console.log('full copy complete')
  //   console.log(await afs.readdir(afs.HOME));
  // } catch(e) {
  //   console.log(e);
  // }


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

  // Create the requester object
  const requester = new ExampleRequester(sow, matcher, requesterSig, wallet, afs, onComplete)

  // Visualize the download progress
  setupDownloadVisualizer(requester)

  // Load network keys if applicable
  let handshakeConf
  if (keypath) {
    info('Using subnetwork encryption')
    try { handshakeConf = await unpackKeys(requesterDID, keypath) } catch (e) { debug({ e }) }
  }

  // Find farmers
  const farmerSwarm = createFarmerSwarm(did, requester, handshakeConf)

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
function createFarmerSwarm(did, requester, conf) {
  // Override the stream if encryption handshake required
  const stream = conf ? () => configRequesterHandshake(conf) : null
  const swarm = createSwarm({
    stream
  })
  swarm.on('connection', handleConnection)
  swarm.join(did)

  function handleConnection(connection, peer) {
    info(`Farmer Swarm: Peer connected: ${idify(peer.host, peer.port)}`)
    if (conf) {
      const writer = connection.createWriteStream()
      const reader = connection.createReadStream()
      connection = duplexify(writer, reader)
    }
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
