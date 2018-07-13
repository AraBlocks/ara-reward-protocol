const { ExampleFarmer } = require('./farmer')
const { ExampleRequester } = require('./requester')
const { messages, MaxCostMatcher, grpcUtil } = require('ara-farming-protocol')
const wallets = require('./constant.js')

// Simulates and connects to a number of Farmer Servers
function simulateFarmerConnections(count) {
  const sPort = 50051

  const farmerConnections = []
  const farmerIDs = []
  for (let i = 0; i < count; i++) {
    const port = `localhost:${(sPort + i).toString()}`
    const price = Math.floor(Math.random() * 9)
    const id = `ara:did:${i}`
    const farmerID = new messages.ARAid()
    farmerID.setDid(id)

    const farmerSig = new messages.Signature()
    farmerSig.setId = farmerID
    farmerSig.setData('avalidsignature')

    // Generate Server
    const farmer = new ExampleFarmer(farmerID, farmerSig, price, wallets[i])
    grpcUtil.broadcastFarmer(farmer, port)

    // Generate Client Connection
    const connection = grpcUtil.connectToFarmer(port)
    farmerConnections.push(connection)
    farmerIDs.push(id)
  }
  return { farmerConnections, farmerIDs }
}

/*
    Example: The requester submits a budget to a simulated Ethereum contract to
    start processing a job. 4 famers are generated and hired. Rewards are calculated based on a report
    that mapped random amount of contribution to each farmer. The requester distribute
    these rewards through the contract, and on successful delivery, notify the famers
*/

// Farmers
const { farmerConnections, farmerIDs } = simulateFarmerConnections(4)

// Requester
const matcher = new MaxCostMatcher(10, 4)

const requesterID = new messages.ARAid()
requesterID.setDid('ara:did:10056')

const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

const requesterSig = new messages.Signature()
requesterSig.setId = requesterID
requesterSig.setData('avalidsignature')

const requesterWallet = wallets[4]
const requester = new ExampleRequester(
  sow,
  matcher,
  requesterSig,
  requesterWallet
)

const budget = 30
requesterWallet
  .submitJob(sow.getId(), budget)
  .then((result) => {
    console.log('Job has been submitted to the contract')
    requester.processFarmers(farmerConnections)

    // generates a report when the job is finished
    const report = new Map()
    farmerIDs.forEach((farmerId) => {
      report.set(farmerId, Math.floor(Math.random() * 10))
    })

    // sends the report to the requester
    setTimeout(() => {
      requester.onJobFinished(report)
    }, 1000)
  })
  .catch((err) => {
    console.log(err)
    console.log('Job submission failed')
  })
