/* eslint-disable-next-line import/no-unresolved */
const { messages, duplex, util } = require('ara-reward-protocol')
const ContractABI = require('./contract/contract-abi')
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { info } = require('ara-console')
const { createFarmerCFS } = require('./cfs-create')

const { idify, etherToWei, gbsToBytes } = util
const { RequesterConnection } = duplex
const { walletAddresses } = require('./ganache-addresses')
const constants = require('./local/constants.json')

const wallet = new ContractABI(walletAddresses[constants.farmerWalletIndex])
const rootPath = './local/'
const contentPath = rootPath + constants.contentPath
const cfsPath = `${rootPath + constants.cfsPath}/farmer`

broadcast(constants.farmerPrice)

/**
 * Broadcast the ability to farm for a CFS
 * @param {int} price Desired Cost in Ether per GB
 */
async function broadcast(price) {
  info('Broadcasting')

  // The ARAid of the Farmer
  const farmerID = new messages.AraId()
  farmerID.setDid(constants.farmerDID)

  // A signature that a requester can use to verify that the farmer has signed an agreement
  const farmerSig = new messages.Signature()
  farmerSig.setAraId(constants.farmerID)
  farmerSig.setData('avalidsignature')

  const farmerCFS = await createFarmerCFS(contentPath, cfsPath)

  // Convert Ether/GB to Wei/Byte
  const convertedPrice = etherToWei(price) / gbsToBytes(1)

  // The Farmer instance which sets a specific price, an ID, and a signature
  const farmer = new ExampleFarmer(farmerID, farmerSig, convertedPrice, wallet, farmerCFS.cfs)

  // Join the discovery swarm for the requested content
  createFarmingSwarm(farmerCFS.cfsJson.key, farmer)
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
