const { ExampleFarmer } = require('./farmer')
const { broadcastFarmer, connectToFarmer } = require('../../src/farmer-server')
const { ExampleRequester } = require('./requester')
const { MaxCostMatcher } = require('../../src/matchers/max-cost-matcher')
const messages = require('../../src/proto/messages_pb')

// Simulates and connects to a number of Farmer Servers
function simulateFarmerConnections(count) {
  const sPort = 50051

  const farmerConnections = []
  const farmerIDs = []
  for (let i = 0; i < count; i++) {
    const port = `localhost:${(sPort + i).toString()}`
    const price = 5 + Math.floor(Math.random() * 10)
    const id = `ara:did:${i}`
    const farmerID = new messages.ARAid()
    farmerID.setDid(id)

    const farmerSig = new messages.Signature()
    farmerSig.setId = farmerID
    farmerSig.setData('avalidsignature')

    // Generate Server
    const farmer = new ExampleFarmer(farmerID, farmerSig, price)
    broadcastFarmer(farmer, port)

    // Generate Client Connection
    const connection = connectToFarmer(port)
    farmerConnections.push(connection)
    farmerIDs.push(id)
  }
  return { farmerConnections, farmerIDs }
}

/*
    Example: The requester submits a budget to a simulated Ethereum contract to
    start processing a job. 10 famers are generated, out of which 5 farmers who
    charge <= 10 Ara per MB are hired. Rewards are calculated based on a report
    that mapped random amount of contribution to each farmer. The requester distribute
    these rewards through the contract, and on successful delivery, notify the famers
*/

// Farmers
const { farmerConnections, farmerIDs } = simulateFarmerConnections(10)

// Requester
const matcher = new MaxCostMatcher(10, 5)

const requesterID = new messages.ARAid()
requesterID.setDid('ara:did:10056')

const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

const requesterSig = new messages.Signature()
requesterSig.setId = requesterID
requesterSig.setData('avalidsignature')

const requesterId = '0xa151a089fc8f9f04cc5cea3062c7f0bd10e9e703'
const requesterKey =
  '0185fd42264c197154af8f54bf74f8aeea2f777f83f23daa5313772aa7628aff'
const requester = new ExampleRequester(
  sow,
  matcher,
  requesterSig,
  requesterId,
  requesterKey
)

const budget = 100
requester.submitJob(budget).then((result) => {
  if (result) {
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
  } else {
    console.log('Job submission failed')
  }
})
