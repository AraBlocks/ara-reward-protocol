const { StreamProtocol } = require('./stream-protocol')
const debug = require('debug')('afp:duplex')

class RequesterConnection extends StreamProtocol {
  constructor(peer, socket, opts) {
    super(peer, socket, opts)
  }
  
  async onQuote(quote) {
    super.onQuote(quote)
    debug('Farm Stream received Quote. Destroying Stream.')
    this.stream.destroy()
  }

  async sendAgreement(agreement) {
    super.sendAgreement(agreement)
    if (this.timeout) clearTimeout(this.timeout)
  }
}

module.exports = {
  RequesterConnection
}
