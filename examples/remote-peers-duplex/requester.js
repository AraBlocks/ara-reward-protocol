const { messages, afpstream } = require('ara-farming-protocol')

class ExampleRequester extends afpstream.sRequester {
  constructor(sow, matcher, requesterSig, startWork) {
    super(sow, matcher)
    this.badFarmerId = 'ara:did:2'
    this.agreementId = 101
    this.requesterSig = requesterSig
    this.startWork = startWork
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
    return true
  }

  /**
   * This is called when a agreement has been marked as valid and a farmer
   * is ready to start work
   * @param {messages.Agreement} agreement
   * @param {services.RFPClient} connection
   */
  async onHireConfirmed(agreement, connection) {
    console.log(`Requester: Agreement ${agreement.getId()} signed by farmer ${agreement.getQuote().getFarmer().getDid()}`)
    const port = agreement.getId() // HACK
    const peer = connection.peer
    peer.port = port
    this.startWork(peer)
  }
}

module.exports = { ExampleRequester }
