const { Matcher } = require('../../lib/matcher')
const messages = require('../../lib/proto/messages_pb')

/**
 * Example Matcher which hires a maximum number of workers for a maximum cost
 */
class ExampleMatcher extends Matcher {
  constructor(maxCost, maxWorkers) {
    super()
    this.maxCost = maxCost
    this.maxWorkers = maxWorkers
    this.quoteOptions = new Map()
    this.hiredWorkerQuoteOptions = new Map()
    this.reserveWorkers = []

    this.totalWorkers = 0
  }

  considerQuoteOption(quote, hireFarmerCallback) {
    const farmerId = quote.getFarmer().getId()
    this.quoteOptions.set(farmerId, { quote, cb: hireFarmerCallback })

    if (quote.getPerUnitCost() > this.maxCost) return
    if (this.hiredWorkerQuoteOptions.size < this.maxWorkers) {
      this.hireFarmer(farmerId)
    } else {
      this.reserveWorkers.unshift(farmerId)
    }
  }

  invalidateQuoteOption(quote) {
    const farmerId = quote.getFarmer().getId()
    this.hiredWorkerQuoteOptions.delete(farmerId)

    if (this.hiredWorkerQuoteOptions.size < this.maxWorkers) { this.hireFromReserve() }
  }

  hireFromReserve() {
    if (this.reserveWorkers.length > 0) {
      const reserveWorker = this.reserveWorkers.pop()
      this.hireFarmer(reserveWorker)
    }
  }

  hireFarmer(farmerId) {
    const quoteOption = this.quoteOptions.get(farmerId)
    this.hiredWorkerQuoteOptions.set(farmerId, quoteOption)
    quoteOption.cb()
  }

  onHireConfirmed(contract, callback) {
    console.log(`Requester: Contract ${contract.getId()} signed by farmer ${contract
      .getQuote()
      .getFarmer()
      .getId()}`)

    this.totalWorkers += 1
    if (this.totalWorkers === this.maxWorkers) {
      callback()
    }
  }
}

module.exports = { ExampleMatcher }
