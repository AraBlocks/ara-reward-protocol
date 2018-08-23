const { RequesterBase } = require('../requester')

class Requester extends RequesterBase {
  async processFarmer(connection) {
    connection.stream.on('quote', quote => this.onQuote(quote, connection))
    connection.stream.on('agreement', agreement => this.onAgreement(agreement, connection))
    connection.stream.on('receipt', receipt => this.onReceipt(receipt, connection))
    super.processFarmer(connection)
  }

  async onQuote(quote, connection) {
    super.onQuote(null, quote, connection)
  }

  async onAgreement(agreement, connection) {
    super.onAgreement(null, agreement, connection)
  }

  async onReceipt(receipt, connection) {
    super.onReceipt(null, receipt, connection)
  }
}

module.exports = { Requester }
