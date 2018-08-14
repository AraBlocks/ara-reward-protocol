const { StreamProtocol } = require('./stream-protocol')
const debug = require('debug')('afp:duplex')

class FarmStream extends StreamProtocol {
  constructor(peer, opts) {
    super(peer, opts)
  }

  async onSow(sow, done){
    const nonce = sow.getNonce()
    this.stream.emit('handshake', nonce)
    super.onSow(sow, done)
  }

  async onQuote(quote, done) {
    super.onQuote(quote, done)
    debug('Farm Stream received Quote. Destroying Stream.')
    this.stream.destroy()
  }

  async sendAgreement(agreement) {
    super.sendAgreement(agreement)
    if (this.timeout) clearTimeout(this.timeout)
  }
}

module.exports = {
  FarmStream
}
