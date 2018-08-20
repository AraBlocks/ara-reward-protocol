const { messages, RequesterBase } = require('ara-farming-protocol')
const debug = require('debug')('afp:grpc-example:requester')
const crypto = require('ara-crypto')

class ExampleRequester extends RequesterBase {
  constructor(sow, matcher, requesterSig, onStartWork) {
    super(sow, matcher)
    this.requesterSig = requesterSig
    this.onStartWork = onStartWork
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    return true
  }

  /**
   * Generates a agreement for quote
   * @param {messages.Quote} quote
   * @returns {messages.Agreement}
   */
  async generateAgreement(quote) {
    const agreement = new messages.Agreement()
    agreement.setNonce(crypto.randomBytes(32))
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
   * @param {services.RFPClient} farmer
   */
  async onHireConfirmed(agreement, farmer) {

    // Extract port
    const data = Buffer.from(agreement.getData())
    const port = data.readUInt32LE(0)
    
    this.onStartWork(peer, port)
  }
}

module.exports = { ExampleRequester }
