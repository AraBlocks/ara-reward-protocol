const { DuplexConnection } = require('./duplex-connection')
const debug = require('debug')('afp:duplex')

// Class for managing a duplex stream connection to a requester
class RequesterConnection extends DuplexConnection {
  // If quote, peer is not a requester, then destroy
  async onQuote(quote) {
    super.onQuote(quote)
    debug('Farm Stream received Quote. Destroying Stream.')
    this.stream.destroy()
  }

  // Agreement reached, do not expect immediate response
  async sendAgreement(agreement) {
    super.sendAgreement(agreement)
    if (this.timeout) clearTimeout(this.timeout)
  }
}

module.exports = {
  RequesterConnection
}
