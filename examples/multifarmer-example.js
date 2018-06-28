const { Farmer, broadcastFarmer, connectToFarmer } = require('../farmer')
const { Requester } = require('../requester')
const { Matcher } = require('../matcher')
const { Authenticator } = require('../authenticator')
const { Quoter } = require('../quoter')
const messages = require('../proto/messages_pb')

/**
 * Example Matcher which hires a maximum number of workers for a maximum cost
 */
class ExampleMatcher extends Matcher {
  constructor(maxCost, maxWorkers) {
    super()
    this.maxCost = maxCost
    this.maxWorkers = maxWorkers
    this.hiredWorkers = new Map()
    this.reserveWorkers = []
  }

  considerQuoteOption(quote, hireFarmerCallback) {
    if (quote.getPerUnitCost() > this.maxCost) return

    const farmerId = quote.getFarmer().getId()

    if (this.hiredWorkers.size < this.maxWorkers) {
      this.hiredWorkers.set(farmerId, hireFarmerCallback)
      hireFarmerCallback()
    } else {
      this.reserveWorkers.push({ id: farmerId, cb: hireFarmerCallback })
    }
  }

  invalidateQuoteOption(quote) {
    const farmerId = quote.getFarmer().getId()
    this.hiredWorkers.delete(farmerId)

    if (this.hiredWorkers.size < this.maxWorkers) this.hireFromReserve()
  }

  hireFromReserve() {
    if (this.reserveWorkers.length > 0) {
      const reserveWorker = this.reserveWorkers.pop()
      this.hiredWorkers.set(reserveWorker.id, reserveWorker.cb)
      reserveWorker.cb()
    }
  }
}

/**
 * Example authenticator to validate a farmer
 */
class ExampleFarmerAuth extends Authenticator {
  constructor(badFarmerId) {
    super()
    this.badFarmerId = badFarmerId
  }

  validateContract(contract) {
    const farmerId = contract.getQuote().getFarmer().getId()
    if (farmerId == this.badFarmerId) {
      console.log(`Invalid contract: ${contract.getId()} from bad farmer: ${farmerId}`)
      return false
    }
    return true
  }
}

/**
 * Example authenticator to validate a requester
 */
class ExampleRequesterAuth extends Authenticator {
  constructor(badRequesterId) {
    super()
    this.badRequesterId = badRequesterId
  }

  validateContract(contract) {
    const requesterId = contract.getQuote().getSow().getRequester().getId()
    if (requesterId == this.badRequesterId) {
      console.log(`Invalid contract: ${contract.getId()} from bad requester: ${requesterId}`)
      return false
    }
    return true
  }
}

/**
 * Example quoter which gives back a specific cost for a farmer
 */
class ExampleQuoter extends Quoter {
  constructor(price, farmerSig) {
    super()
    this.price = price
    this.farmerSig = farmerSig
  }

  generateQuote(sow) {
    const quote = new messages.Quote()
    quote.setId(1)
    quote.setFarmer(this.farmerSig)
    quote.setPerUnitCost(this.price)
    quote.setSow(sow)

    return quote
  }
}

/*
    Simulates and connects to a number of Farmer Servers
*/
function simulateFarmerConnections(count, authenticator) {
  const sPort = 50051

  const farmers = []
  for (let i = 0; i < count; i++) {
    const port = `localhost:${(sPort + i).toString()}`
    const price = 5 + Math.floor(Math.random() * 10)

    const farmerSig = new messages.ARAid()
    farmerSig.setId(i)
    farmerSig.setSignature(Math.floor(1000 * Math.random()))

    const quoter = new ExampleQuoter(price, farmerSig)

    // Generate Server
    const farmer = new Farmer(quoter, i, authenticator)
    broadcastFarmer(farmer, port)

    // Generate Client Connection
    const connection = connectToFarmer(port)
    farmers.push(connection)
  }
  return farmers
}

/*
    Example: generate and connect to 50 farmers, then hire up to
    7 farmers who charge <= 10 Ara per MB. Authenticator only considers
    user 10056 as valid requester.
*/

// Farmers
const requestAuth = new ExampleRequesterAuth(10057)
const farmers = simulateFarmerConnections(50, requestAuth)

// Requester
const matcher = new ExampleMatcher(10, 7)
const farmAuth = new ExampleFarmerAuth(2)

const requesterSig = new messages.ARAid()
requesterSig.setId(10056)
requesterSig.setSignature(11111)

const sow = new messages.SOW()
sow.setId(2)
sow.setWorkUnit('MB')
sow.setRequester(requesterSig)

const requester = new Requester(sow, matcher, farmAuth)
requester.processFarmers(farmers)
