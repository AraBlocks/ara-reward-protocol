const messages = require('./proto/messages_pb')
const services = require('./proto/route-guide_grpc_pb')

class Requester {
  /**
   * Class that handles the communication for requesting a specific SOW
   * for a single task.
   * @param {messages.SOW} sow
   * @param {Matcher} matcher
   */
  constructor(sow, matcher) {
    this.sow = sow
    this.matcher = matcher
  }

  /**
   * Iterates through an array of Farmers and gets quotes from them for
   * the defined SOW
   * @param {[services.RFPClient]} farmers
   */
  async processFarmers(farmers) {
    farmers.forEach((farmer) => {
      this.processFarmer(farmer)
    })
  }

  /**
   * Gets quotes from a single farmer for the defined SOW
   * @param {services.RFPClient} farmer
   */
  async processFarmer(farmer) {
    const responseHandler = function (err, response) {
      this.handleQuoteResponse(err, response, farmer)
    }
    farmer.getQuote(this.sow, responseHandler.bind(this))
  }

  /**
   * On receipt of a quote from a farmer, asks the defined Matcher to
   * consider the quote and passes to the Matcher a callback for hiring
   * the farmer.
   * @param {Error} err
   * @param {messages.Quote} response
   * @param {services.RFPClient} farmer
   */
  async handleQuoteResponse(err, response, farmer) {
    if (err) {
      console.log(`Quote Response Error: ${err}`)
    } else {
      const valid = await this.validatePeer(response.getFarmer())
      if (valid) {
        const callback = () => this.hireFarmer(response, farmer)
        this.matcher.validateQuote(response, callback.bind(this))
      }
    }
  }

  /**
   * Generates an agreement and sends it to a specific farmer
   * @param {messages.Quote} quote
   * @param {services.RFPClient} farmer
   */
  async hireFarmer(quote, farmer) {
    const agreement = await this.generateAgreement(quote)
    const responseHandler = function (err, response) {
      this.handleSignedAgreement(err, response, farmer)
    }
    farmer.sendAgreement(agreement, responseHandler.bind(this))
  }

  /**
   * On receipt of a signed (and staked) agreement from farmer, can begin
   * distribution of work.
   * @param {Error} err
   * @param {messages.Agreement} response
   * @param {services.RFPClient} farmer
   */
  async handleSignedAgreement(err, response, farmer) {
    if (err) {
      console.log(`Award Response Error: ${err}`)
    } else {
      const valid = await this.validateAgreement(response)
      if (valid) {
        this.onHireConfirmed(response, farmer)
      } else {
        this.matcher.invalidateQuote(response.getQuote())
      }
    }
  }

  /**
   * This should returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  async validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.')
  }

  /**
   * This should generate and return an agreement for a quote.
   * @param {messages.Quote} quote
   * @returns {messages.Agreement}
   */
  async generateAgreement(quote) {
    throw new Error('Extended classes must implement generateAgreement.')
  }

  /**
   * This should return whether an agreement is valid.
   * @param {messages.Agreement} agreement
   * @returns {boolean}
   */
  async validateAgreement(agreement) {
    throw new Error('Extended classes must implement validateAgreement.')
  }

  /**
   * This is called when an agreement has been marked as valid and a farmer
   * is ready to start work
   * @param {messages.Agreement} agreement
   * @param {services.RFPClient} farmer
   */
  onHireConfirmed(agreement, farmer) {
    throw new Error('Extended classes must implement onHireConfirmed')
  }
}

module.exports = { Requester }
