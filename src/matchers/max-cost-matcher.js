const { MatcherBase } = require('../matcher')
const { nonceString } = require('../util')

// Matcher which hires a maximum number of workers for a maximum cost
class MaxCostMatcher extends MatcherBase {
  constructor(maxCost, maxWorkers) {
    super()
    this.maxCost = maxCost
    this.maxWorkers = maxWorkers
    this.allQuoteCallbacks = new Map()
    this.hiredQuoteCallbacks = new Map()
    this.reserveWorkers = []
  }

  async addQuote(quote, callback) {
    const quoteId = nonceString(quote)
    this.allQuoteCallbacks.set(quoteId, new QuoteCallback(quote, callback))

    if (quote.getPerUnitCost() > this.maxCost) {
      return false
    }

    if (this.hiredQuoteCallbacks.size < this.maxWorkers) {
      this.hireFarmer(quoteId)
    } else {
      this.reserveWorkers.unshift(quoteId)
    }
    return true
  }

  async removeQuote(quote) {
    const quoteId = nonceString(quote)

    // Remove from active workers
    if (this.hiredQuoteCallbacks.has(quoteId)) this.hiredQuoteCallbacks.delete(quoteId)

    // Remove from reserve workers
    const index = this.reserveWorkers.indexOf(quoteId)
    if (-1 != index) this.reserveWorkers.splice(index, 1)

    // Hire new worker
    if (this.hiredQuoteCallbacks.size < this.maxWorkers) this.hireFromReserve()
  }

  hireFromReserve() {
    if (this.reserveWorkers.length > 0) {
      const reserveWorker = this.reserveWorkers.pop()
      this.hireFarmer(reserveWorker)
    }
  }

  hireFarmer(quoteId) {
    const quoteCallback = this.allQuoteCallbacks.get(quoteId)
    this.hiredQuoteCallbacks.set(quoteId, quoteCallback)
    quoteCallback.callback()
  }
}

function QuoteCallback(quote, callback) {
  this.quote = quote
  this.callback = callback
}

module.exports = { MaxCostMatcher }
