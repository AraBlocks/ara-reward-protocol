const { FarmerBase } = require('../farmer')

// Class defining the required working conditions demanded by (and RPC methods of) a Farmer
class Farmer extends FarmerBase {
  async processRequester(connection) {
    connection.stream.on('sow', sow => this.onSow(sow, connection))
    connection.stream.on('agreement', agreement => this.onAgreement(agreement, connection))
    connection.stream.on('reward', reward => this.onReward(reward, connection))
  }

  async onSow(sow, connection) {
    const callback = (error, quote) => {
      connection.sendQuote(quote)
    }
    super.onSow({ request: sow }, callback)
  }

  async onAgreement(agreement, connection) {
    const callback = (error, agreement) => {
      connection.sendAgreement(agreement)
    }
    super.onAgreement({ request: agreement }, callback)
  }

  async onReward(reward, connection) {
    const callback = (error, receipt) => {
      connection.sendReceipt(receipt)
    }
    super.onReward({ request: reward }, callback)
  }
}

module.exports = { Farmer }
