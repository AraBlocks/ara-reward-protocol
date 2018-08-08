const { RequesterBase } = require('../requester')

class Requester extends RequesterBase {
  constructor(sow, matcher) {
    super(sow, matcher)
  }

  async processFarmer(connection) {
    connection.stream.on('quote', quote => this.onQuote(quote, connection))
    connection.stream.on('agreement', agreement => this.onAgreement(agreement, connection))

    super.processFarmer(connection)
  }

  async onQuote(quote, connection) {
    super.onQuote(null, quote, connection)
  }

  async onAgreement(agreement, connection) {
    super.onAgreement(null, agreement, connection)
  }
}

module.exports = { Requester }
