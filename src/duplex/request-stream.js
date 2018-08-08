const { StreamProtocol } = require('./stream-protocol')
const debug = require('debug')('ara-farming-protocol:stream')

class RequestStream extends StreamProtocol {
  constructor(peer, opts) {
    super(peer, opts)
  }

  async onSow(sow, done) {
    super.onSow(sow, done)
    debug('Request Stream received SOW. Destroying Stream.')
    this.stream.destroy()
  }
}

module.exports = {
  RequestStream
}
