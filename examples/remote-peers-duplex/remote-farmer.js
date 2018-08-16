const { contractAddress, walletAddresses, afsDIDs } = require('../constants.js')
const { messages, afpstream, util } = require('ara-farming-protocol')
const { idify, nonceString } = util
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { create } = require('ara-filesystem')
const ContractABI = require('../farming_contract/contract-abi.js')
const debug = require('debug')('afp:duplex-example:main')

const wallet = new ContractABI(contractAddress, walletAddresses[3])
const price = 1

for (let i = 0; i < afsDIDs.length; i++) {
  broadcast(afsDIDs[i], price)
}

async function broadcast(did, price) {
  debug('Broadcasting: ', did)

  // The ARAid of the Farmer
  const farmerID = new messages.AraId()
  const farmerDID = '2d5e0ad3040be242471b08013daa47876035bb565384936024a77eadd32fe4c9'
  farmerID.setDid(farmerDID)

  // A signature that a requester can use to verify that the farmer has signed an agreement
  const farmerSig = new messages.Signature()
  farmerSig.setAraId(farmerID)
  farmerSig.setData('avalidsignature')

  // Load the afs
  const { afs } = await create({ did })

  // The Farmer instance which sets a specific price, an ID, and a signature
  const farmer = new ExampleFarmer(farmerID, farmerSig, price, wallet, afs)

  // Join the discovery swarm for the requested content
  const swarm = createFarmingSwarm(did, farmer)
}

function createFarmingSwarm(did, farmer) {
  const swarm = createSwarm()
  swarm.on('connection', handleConnection)
  swarm.join(did, { announce: false })

  function handleConnection(connection, info) {
    debug(`SWARM: New peer: ${idify(info.host, info.port)}`)
    const requesterConnection = new afpstream.RequesterConnection(info, connection, {timeout: 6000 })    
    farmer.processRequester(requesterConnection)
  }

  return swarm
}
