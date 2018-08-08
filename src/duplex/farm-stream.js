const { StreamProtocol } = require('./stream-protocol')
const debug = require('debug')('ara-farming-protocol:stream')

class FarmStream extends StreamProtocol {
  constructor(peer, opts) {
    super(peer, opts)
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
