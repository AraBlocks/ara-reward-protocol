const { Matcher } = require('../matcher')
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
      this.reserveWorkers.unshift({ id: farmerId, cb: hireFarmerCallback })
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

module.exports = { ExampleMatcher }
