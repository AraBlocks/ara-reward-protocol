const { messages, matchers, afpgrpc } = require('../../../index')
const { ContractABI, constants } = require('../../../examples/index')
const { ExampleRequester } = require('./requester')
const { ExampleFarmer } = require('./farmer')
const debug = require('debug')('afp:contract-example:main')
const test = require('ava')

const { contractAddress, walletAddresses } = constants
const wallets = [
  new ContractABI(contractAddress, walletAddresses[0]),
  new ContractABI(contractAddress, walletAddresses[1]),
  new ContractABI(contractAddress, walletAddresses[2]),
  new ContractABI(contractAddress, walletAddresses[3]),
  new ContractABI(contractAddress, walletAddresses[4])
]

// Simulates and connects to a number of Farmer Servers
function simulateFarmerConnections(farmers) {
  const farmerConnections = []
  for (const key of farmers.keys()) {
    const details = farmers.get(key)
    const port = `localhost:${details.port}`
    const farmerID = new messages.AraId()
    farmerID.setDid(key)

    const farmerSig = new messages.Signature()
    farmerSig.setAraId(farmerID)
    farmerSig.setData('avalidsignature')

    // Generate Server
    const farmer = new ExampleFarmer(farmerID, farmerSig, details.price, details.wallet)
    afpgrpc.util.broadcastFarmer(farmer, port)

    // Generate Client Connection
    const connection = afpgrpc.util.connectToFarmer(port)
    farmerConnections.push(connection)
  }
  return farmerConnections
}

/*
    Example: The requester submits a budget to a simulated Ethereum contract to
    start processing a job. 4 famers are generated and hired. Rewards are calculated based on a report
    that mapped random amount of contribution to each farmer. The requester distribute
    these rewards through the contract, and on successful delivery, notify the famers
*/

const farmerDetails =
  new Map([ [ 'aaaa', {
    port: 50051, price: 2, units: 2, wallet: wallets[1]
  } ],
  [ 'bbbb', {
    port: 50052, price: 2, units: 1, wallet: wallets[2]
  } ],
  [ 'cccc', {
    port: 50053, price: 1, units: 2, wallet: wallets[3]
  } ],
  [ 'dddd', {
    port: 50054, price: 3, units: 1, wallet: wallets[4]
  } ] ])
const budget = Array.from(farmerDetails.values()).reduce((a, b) => a + (b.units * b.price), 0)

// Farmers
const farmerConnections = simulateFarmerConnections(farmerDetails)

// Requester
const matcher = new matchers.MaxCostMatcher(10, 4)

const requesterID = new messages.AraId()
requesterID.setDid('6002')

const sow = new messages.SOW()
const jobId = '7002'
sow.setNonce(jobId)
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

const requesterSig = new messages.Signature()
requesterSig.setAraId(requesterID)
requesterSig.setData('avalidsignature')

const requesterWallet = wallets[0]
const requester = new ExampleRequester(
  sow,
  matcher,
  requesterSig,
  requesterWallet
)

test('multi-farmer-simulation-contract', (t) => {
  debug(`Job ${jobId} has a budget of: ${budget}`)
  requesterWallet
    .submitJob(jobId, budget)
    .then(() => {
      debug('Job has been submitted to the contract')
      requester.processFarmers(farmerConnections)

      // sends the report to the requester
      setTimeout(() => {
        requester.onJobFinished(farmerDetails)
      }, 1000)
    })
    .catch((err) => {
      debug(err)
      debug('Job submission failed')
    })

  // TODO
  t.true(true)
})
