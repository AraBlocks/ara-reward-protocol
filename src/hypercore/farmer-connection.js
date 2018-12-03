const { HypercoreConnection } = require('./hypercore-connection')
const debug = require('debug')('arp:hypercore')

// Class for managing a duplex stream connection to a farmer
class FarmerConnection extends HypercoreConnection {
  // If sow, peer is not a farmer, then destroy
  async onSow(sow) {
    super.onSow(sow)
    debug('Request Stream received SOW. Destroying Stream.')
    this.close()
  }

  // Communication finished, do not expect response
  async sendReceipt(receipt) {
    super.sendReceipt(receipt)
    if (this.timeout) clearTimeout(this.timeout)
  }
}

module.exports = {
  FarmerConnection
}
