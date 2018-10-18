const { DuplexConnection } = require('./duplex-connection')
const debug = require('debug')('afp:duplex')

// Class for managing a duplex stream connection to a farmer
class FarmerConnection extends DuplexConnection {
  // If sow, peer is not a farmer, then destroy
  async onSow(sow) {
    super.onSow(sow)
    debug('Request Stream received SOW. Destroying Stream.')
    this.stream.destroy()
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
