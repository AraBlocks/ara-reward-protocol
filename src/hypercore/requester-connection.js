const { HypercoreConnection } = require('./hypercore-connection')
const debug = require('debug')('arp:hypercore')

// Class for managing a duplex stream connection to a requester
class RequesterConnection extends HypercoreConnection {
  // If quote, peer is not a requester, then destroy
  async onQuote(quote) {
    super.onQuote(quote)
    debug('Farm Stream received Quote. Destroying Stream.')
    this.close()
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
