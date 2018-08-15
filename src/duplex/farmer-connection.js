const { StreamProtocol } = require('./stream-protocol')
const debug = require('debug')('afp:duplex')

// Class for managing a duplex stream connection to a farmer
class FarmerConnection extends StreamProtocol {
  constructor(peer, socket, opts) {
    super(peer, socket, opts)
  }

    // If sow, peer is not a farmer, then destroy
  async onSow(sow) {
    super.onSow(sow)
    debug('Request Stream received SOW. Destroying Stream.')
    this.stream.destroy()
  }
}

module.exports = {
  FarmerConnection
}
