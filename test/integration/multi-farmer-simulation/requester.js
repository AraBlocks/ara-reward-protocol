const sinon = require('sinon')
const test = require('ava')

const {
  messages,
  RequesterBase,
  util
} = require('../../../index')

const { idify, nonceString } = util

class ExampleRequester extends RequesterBase {
  constructor(sow, matcher, requesterSig) {
    super(sow, matcher)
    this.badFarmerId = '2'
    this.agreementId = '101'
    this.requesterSig = requesterSig
  }

  /**
     * Returns whether a user is valid.
     * @param {messages.AraIid} peer
     * @returns {boolean}
     */
  async validatePeer(peer) {
    const farmerId = peer.getDid()
    if (farmerId == this.badFarmerId) {
      console.log(`Requester: Invalid farmer ${farmerId}`)
      return false
    }
    return true
  }

  /**
     * Generates a agreement for quote
     * @param {messages.Quote} quote
     * @returns {messages.Agreement}
     */
  async generateAgreement(quote) {
    const agreement = new messages.Agreement()
    agreement.setNonce(this.agreementId)
    agreement.setQuote(quote)
    agreement.setRequesterSignature(this.requesterSig)
    return agreement
  }

  /**
     * Returns whether a agreement is valid.
     * @param {messages.Agreement} agreement
     * @returns {boolean}
     */
  async validateAgreement(agreement) {
    if (agreement.getNonce() == this.agreementId) return true
    return false
  }

  /**
     * This is called when a agreement has been marked as valid and a farmer
     * is ready to start work
     * @param {messages.Agreement} agreement
     * @param {services.RFPClient} farmer
     */
  async onHireConfirmed(agreement, farmer) {
    console.log(`Requester: Agreement ${nonceString(agreement)} signed by farmer ${agreement.getQuote().getFarmer().getDid()}`)
  }
}

test('multi-farmer-simulation', (t) => {
  // TODO
  t.true(true)
})

module.exports = {
  ExampleRequester
}
