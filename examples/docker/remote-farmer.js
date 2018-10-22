const { messages, duplex, util } = require('ara-farming-protocol')
const ContractABI = require('./contract/contract-abi')
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { info } = require('ara-console')
const debug = require('debug')('afp:duplex-example:main')
const { join, basename } = require('path')
const {createFarmerCFS} = require('./cfs-create')
const { createCFS } = require('cfsnet/create')
const { idify, etherToWei, gbsToBytes } = util
const { RequesterConnection } = duplex
const { walletAddresses } = require('./ganache-addresses')
const constants = require('./local/constants.json')
const wallet = new ContractABI(walletAddresses[constants.farmingWalletIndex])

const imagePath = './example-content.mp4'
const cfsPath = './local/.ara/cfs/farmerCFS'
const jsonPath = './local/.ara/cfs/cfsDid.json'

broadcast(constants.farmerPrice)

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
      path: cfsPath
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
