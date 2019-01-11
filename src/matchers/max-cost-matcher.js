const { MatcherBase } = require('../matcher')
const { nonceString } = require('../util')

// Matcher which hires a maximum number of workers for a maximum cost
class MaxCostMatcher extends MatcherBase {
  /**
   * Create a max-cost matcher
   * @param {string} maxCost
   * @param {int} maxWorkers
   */
  constructor(maxCost, maxWorkers) {
    super()
    this.maxCost = Number.parseFloat(maxCost)
    if (Number.isNaN(this.maxCost)) throw new Error('maxCost should be string')
    this.maxWorkers = maxWorkers
    this.allQuoteCallbacks = new Map()
    this.hiredQuoteCallbacks = new Map()
    this.reserveWorkers = []
  }

  async addQuote(quote, callback) {
    const quoteId = nonceString(quote)
    this.allQuoteCallbacks.set(quoteId, new QuoteCallback(quote, callback))

    const cost = Number.parseFloat(quote.getPerUnitCost())
    if (Number.isNaN(cost) || cost > this.maxCost) {
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
