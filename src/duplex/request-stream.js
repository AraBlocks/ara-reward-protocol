const { StreamProtocol } = require('./stream-protocol')

class RequestStream extends StreamProtocol {
  constructor(peer, opts) {
    super(peer, opts)
  }

  onSow(sow, done) {
    super.onSow(sow, done)
    console.log('Received SOW. Destroying Stream.')
    this.stream.destroy()
  }
}

module.exports = {
  RequestStream
}
