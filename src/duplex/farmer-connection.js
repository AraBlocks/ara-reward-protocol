const { StreamProtocol } = require('./stream-protocol')
const debug = require('debug')('afp:duplex')

class FarmerConnection extends StreamProtocol {
  constructor(peer, socket, opts) {
    super(peer, socket, opts)
  }

  async onSow(sow) {
    super.onSow(sow)
    debug('Request Stream received SOW. Destroying Stream.')
    this.stream.destroy()
  }
}

module.exports = {
  FarmerConnection
}
