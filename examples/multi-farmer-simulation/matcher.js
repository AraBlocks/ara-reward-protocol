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
    this.hiredWorkerContracts = new Map()
    this.reserveWorkers = []
  }

  considerQuoteOption(quote, hireFarmerCallback) {
    const farmerId = quote.getFarmer().getId()
    this.quoteOptions.set(farmerId, { quote, cb: hireFarmerCallback })

    if (quote.getPerUnitCost() > this.maxCost) return

    if (this.hiredWorkerContracts.size < this.maxWorkers) {
      this.hireFarmer(farmerId)
    } else {
      this.reserveWorkers.unshift(farmerId)
    }
  }

  invalidateQuoteOption(quote) {
    const farmerId = quote.getFarmer().getId()
    this.hiredWorkerContracts.delete(farmerId)

    if (this.hiredWorkerContracts.size < this.maxWorkers) this.hireFromReserve()
  }

  hireFromReserve() {
    if (this.reserveWorkers.length > 0) {
      const reserveWorker = this.reserveWorkers.pop()
      this.hireFarmer(reserveWorker)
    }
  }

  hireFarmer(farmerId) {
    const quoteOption = this.quoteOptions.get(farmerId)
    const contract = this.generateContract(quoteOption.quote)
    this.hiredWorkerContracts.set(farmerId, contract)
    quoteOption.cb(contract)
  }

  generateContract(quote) {
    const contract = new messages.Contract()
    contract.setId(103)
    contract.setQuote(quote)
    return contract
  }
}

module.exports = { ExampleMatcher }
