const sinon = require('sinon')
const test = require('ava')

const {
  messages, matchers, afpgrpc, RequesterBase, FarmerBase
} = require('../../index')

class ExampleRequester extends RequesterBase {
  constructor(sow, matcher, requesterSig) {
    super(sow, matcher)
    this.badFarmerId = 'ara:did:2'
    this.agreementId = 101
    this.requesterSig = requesterSig
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    const farmerId = peer.getDid()
    if (farmerId == this.badFarmerId) {
      console.log(`Requester: Invalid farmer ${farmerId}`)
      return false
    }
    return true
  }

  /**
   * Generates a agreement for quote
   * @param {messages.Quote} quote
   * @returns {messages.Agreement}
   */
  async generateAgreement(quote) {
    const agreement = new messages.Agreement()
    agreement.setNonce(this.agreementId)
    agreement.setQuote(quote)
    agreement.setRequesterSignature(this.requesterSig)
    return agreement
  }

  /**
   * Returns whether a agreement is valid.
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  async validateAgreement(agreement) {
    if (agreement.getNonce() == this.agreementId) return true
    return false
  }

  /**
   * This is called when a agreement has been marked as valid and a farmer
   * is ready to start work
   * @param {messages.Agreement} agreement
   * @param {services.RFPClient} farmer
   */
  async onHireConfirmed(agreement, farmer) {
    console.log(`Requester: Agreement ${agreement.getNonce()} signed by farmer ${agreement.getQuote().getFarmer().getDid()}`)
  }
}

class ExampleFarmer extends FarmerBase {
  constructor(farmerId, farmerSig, price) {
    super()
    this.badRequesterId = 10057
    this.quoteId = 1
    this.price = price
    this.farmerId = farmerId
    this.farmerSig = farmerSig
  }

  /**
   * Returns a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  async generateQuote(sow) {
    const quote = new messages.Quote()
    quote.setNonce(this.quoteId)
    quote.setFarmer(this.farmerId)
    quote.setPerUnitCost(this.price)
    quote.setSow(sow)
    return quote
  }

  /**
   * Returns whether a agreement is valid
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  async validateAgreement(agreement) {
    const quote = agreement.getQuote()
    return quote.getPerUnitCost() == this.price
  }

  /**
   * Sign and return a agreement
   * @param {messages.Agreement} agreement
   * @returns {messages.Agreement}
   */
  async signAgreement(agreement) {
    agreement.setFarmerSignature(this.farmerSig)
    return agreement
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    const requesterId = peer.getDid()
    return requesterId != this.badRequesterId
  }
}

// Simulates and connects to a number of Farmer Servers
function simulateFarmerConnections(count) {
  const sPort = 50051

  const farmerConnections = []
  for (let i = 0; i < count; i++) {
    const port = `localhost:${(sPort + i).toString()}`
    const price = 5 + Math.floor(Math.random() * 10)

    const farmerID = new messages.ARAid()
    farmerID.setDid(`ara:did:${i}`)

    const farmerSig = new messages.Signature()
    farmerSig.setAraId(farmerID)
    farmerSig.setData('avalidsignature')

    // Generate Server
    const farmer = new ExampleFarmer(farmerID, farmerSig, price)
    afpgrpc.util.broadcastFarmer(farmer, port)

    // Generate Client Connection
    const connection = afpgrpc.util.connectToFarmer(port)
    farmerConnections.push(connection)
  }
  return farmerConnections
}

/*
    Example: generate and connect to 10 farmers, then hire up to
    5 farmers who charge <= 10 Ara per MB. Requester Authenticator
    considers user 10057 as invalid requester. Farmer Authenticator
    considers user 2 as an invalid farmer.
*/

// Farmers
const farmerConnections = simulateFarmerConnections(10)

// Requester
const matcher = new matchers.MaxCostMatcher(10, 5)

const requesterID = new messages.ARAid()
requesterID.setDid('ara:did:10056')

const sow = new messages.SOW()
sow.setNonce(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterID)

const requesterSig = new messages.Signature()
requesterSig.setAraId(requesterID)
requesterSig.setData('avalidsignature')

const requester = new ExampleRequester(sow, matcher, requesterSig)

test('multi-farmer-simulation', (t) => {
  requester.processFarmers(farmerConnections)

  // TODO
  t.true(true)
})
