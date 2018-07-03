const { Matcher } = require('../../src/matcher')
const messages = require('../../src/proto/messages_pb')

// Example Matcher which hires a maximum number of workers for a maximum cost
class ExampleMatcher extends Matcher {
  constructor(maxCost, maxWorkers) {
    super()
    this.maxCost = maxCost
    this.maxWorkers = maxWorkers
    this.allQuoteCallbacks = new Map()
    this.hiredQuoteCallbacks = new Map()
    this.reserveWorkers = []
  }

  validateQuote(quote, hireFarmerCallback) {
    const farmerId = quote.getFarmer().getDid()
    this.allQuoteCallbacks.set(farmerId, new QuoteCallback(quote, hireFarmerCallback))

    if (quote.getPerUnitCost() >= this.maxCost) return

    if (this.hiredQuoteCallbacks.size < this.maxWorkers) {
      this.hireFarmer(farmerId)
    } else {
      this.reserveWorkers.unshift(farmerId)
    }
  }

  invalidateQuote(quote) {
    const farmerId = quote.getFarmer().getDid()
    this.hiredQuoteCallbacks.delete(farmerId)

    if (this.hiredQuoteCallbacks.size < this.maxWorkers) this.hireFromReserve()
  }

  hireFromReserve() {
    if (this.reserveWorkers.length > 0) {
      const reserveWorker = this.reserveWorkers.pop()
      this.hireFarmer(reserveWorker)
    }
  }

  hireFarmer(farmerId) {
    const quoteCallback = this.allQuoteCallbacks.get(farmerId)
    this.hiredQuoteCallbacks.set(farmerId, quoteCallback)
    quoteCallback.callback()
  }
}

function QuoteCallback(quote, callback) {
  this.quote = quote
  this.callback = callback
}

module.exports = { ExampleMatcher }
