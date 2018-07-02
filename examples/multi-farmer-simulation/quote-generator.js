const { QuoteGenerator } = require('../../lib/quote-generator');
const messages = require('../../lib/proto/messages_pb');

/**
 * Example quoter which gives back a specific cost for a farmer
 */
class ExampleQuoteGenerator extends QuoteGenerator {
  constructor(price, farmerSig) {
    super();
    this.price = price;
    this.farmerSig = farmerSig;
  }

  generateQuote(sow) {
    const quote = new messages.Quote();
    quote.setId(1);
    quote.setFarmer(this.farmerSig);
    quote.setPerUnitCost(this.price);
    quote.setSow(sow);
    return quote;
  }

  validateContract(contract) {
    const quote = contract.getQuote();
    if (quote.getPerUnitCost() == this.price) return true;
    return false;
  }
}

module.exports = { ExampleQuoteGenerator };
