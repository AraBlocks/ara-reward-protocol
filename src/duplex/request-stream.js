const { StreamProtocol } = require('./stream-protocol')
const debug = require('debug')('afp:duplex')

class RequestStream extends StreamProtocol {
  constructor(peer, opts) {
    super(peer, opts)
  }

  async onSow(sow, done) {
    super.onSow(sow, done)
    debug('Request Stream received SOW. Destroying Stream.')
    this.stream.destroy()
  }

  async onQuote(quote, done) {
  	const nonce = quote.getNonce()
    this.stream.emit('handshake', nonce)
    super.onQuote(quote, done)
  }
}

module.exports = {
  RequestStream
}
