const mirror = require('mirror-folder')
const { messages, duplex, util } = require('../index')
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { info } = require('ara-console')
const duplexify = require('duplexify')
const debug = require('debug')('afp:duplex-example:main')
const { join, basename, resolve } = require('path')
const { web3: { toHex } } = require('ara-util')
const {createFarmerCFS} = require('./cfs-create')
const { createCFS } = require('cfsnet/create')
const { walletAddresses } = require('./constants')
const ContractABI = require('./local/farming_contract/contract-abi')
const constants = require('./constants')
const { idify, etherToWei, gbsToBytes } = util
const { RequesterConnection } = duplex
const wallet = new ContractABI(walletAddresses[3])

const imagePath = ('./robot.jpg')
const cfsPath = ('./local/.ara/cfs/farmerCFS')
const jsonPath = './local/.ara/cfs/cfsDid.json'

broadcast(1)



/**
 * Broadcast the ability to farm for an AFS
 * @param {int} price Desired Cost in Ether per GB
 */
async function broadcast(price) {
  info('Broadcasting')

  // The ARAid of the Farmer
  const farmerDID = 'f05074eecbe4589f0b6ba8ea54b1a91bc17f167afdc66d63eea4bddd9d51f63e'
  const farmerID = new messages.AraId()
  farmerID.setDid(farmerDID)

  // A signature that a requester can use to verify that the farmer has signed an agreement
  const farmerSig = new messages.Signature()
  farmerSig.setAraId(farmerID)
  farmerSig.setData('avalidsignature')

  let cfs
  let cfsJson

  try {
    cfsJson = require(jsonPath)
    cfs = await createCFS({
      id: cfsJson.id,
      key: Buffer.from(cfsJson.key, 'hex'),
      path: './local/.ara/cfs/farmerAFS'
    })
  } catch(e) {
    const farmerCFS = await createFarmerCFS(imagePath, cfsPath, jsonPath)
    cfs = farmerCFS.cfs
    cfsJson = farmerCFS.cfsJson
  }

  // Convert Ether/GB to Wei/Byte
  const convertedPrice = etherToWei(price) / gbsToBytes(1)

  // The Farmer instance which sets a specific price, an ID, and a signature
  const farmer = new ExampleFarmer(farmerID, farmerSig, convertedPrice, wallet, cfs)

  // Join the discovery swarm for the requested content
  createFarmingSwarm(cfsJson.key, farmer)
}

// Creates a swarm to find requesters
function createFarmingSwarm(did, farmer) {
  const swarm = createSwarm()
  swarm.on('connection', handleConnection)
  swarm.join(did, { announce: false })

  function handleConnection(connection, peer) {
    info(`SWARM: New peer: ${idify(peer.host, peer.port)}`)
    const requesterConnection = new RequesterConnection(peer, connection, { timeout: 6000 })
    farmer.addRequester(requesterConnection)
  }

  return swarm
}
