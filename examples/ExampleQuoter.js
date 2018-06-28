const { Quoter } = require('../quoter')
const messages = require('../proto/messages_pb')

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

module.exports = {ExampleQuoter}