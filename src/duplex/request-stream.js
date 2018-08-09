const { StreamProtocol } = require('./stream-protocol')
const debug = require('debug')('afp:stream')

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
  	const id = quote.getFarmer().getDid() // TODO: make this a nonce
    this.stream.emit('handshake', id)
    super.onQuote(quote, done)
  }
}

module.exports = {
  RequestStream
}
