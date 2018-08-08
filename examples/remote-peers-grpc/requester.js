const { messages, RequesterBase } = require('ara-farming-protocol')

class ExampleRequester extends RequesterBase {
  constructor(sow, matcher, requesterSig, onStartWork) {
    super(sow, matcher)
    this.badFarmerId = 'ara:did:2'
    this.agreementId = 101
    this.requesterSig = requesterSig
    this.onStartWork = onStartWork
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
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
    agreement.setId(this.agreementId)
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
    if (agreement.getId() == this.agreementId) return true
    return false
  }

  /**
   * This is called when a agreement has been marked as valid and a farmer
   * is ready to start work
   * @param {messages.Agreement} agreement
   * @param {services.RFPClient} farmer
   */
  async onHireConfirmed(agreement, farmer) {
    console.log(`Requester: Agreement ${agreement.getId()} signed by farmer ${agreement.getQuote().getFarmer().getDid()}`)
    const host = agreement.getQuote().getFarmer().getDid() // HACK
    this.onStartWork(host)
  }
}

module.exports = { ExampleRequester }
