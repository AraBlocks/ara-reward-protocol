const messages = require('./proto/messages_pb')
const services = require('./proto/route-guide_grpc_pb')
const debug = require('debug')('afp:requester-base')

class RequesterBase {
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
   * @param {[services.RFPClient]} connections
   */
  async processFarmers(connections) {
    connections.forEach((connection) => {
      this.processFarmer(connection)
    })
  }

  /**
   * Gets quotes from a single farmer for the defined SOW
   * @param {services.RFPClient} connection
   */
  async processFarmer(connection) {
    const responseHandler = function (err, response) {
      this.onQuote(err, response, connection)
    }
    connection.sendSow(this.sow, responseHandler.bind(this))
  }

  /**
   * On receipt of a quote from a farmer, asks the defined Matcher to
   * consider the quote and passes to the Matcher a callback for hiring
   * the farmer.
   * @param {Error} err
   * @param {messages.Quote} response
   * @param {services.RFPClient} connection
   */
  async onQuote(err, response, connection) {
    if (err) {
      debug(`Quote Response Error: ${err}`)
    } else {
      const valid = await this.validatePeer(response.getFarmer())
      if (valid) {
        const callback = () => this.hireFarmer(response, connection)
        this.matcher.validateQuote(response, callback.bind(this))
      }
    }
  }

  /**
   * Generates an agreement and sends it to a specific farmer
   * @param {messages.Quote} quote
   * @param {services.RFPClient} connection
   */
  async hireFarmer(quote, connection) {
    const agreement = await this.generateAgreement(quote)
    const responseHandler = function (err, response) {
      this.onAgreement(err, response, connection)
    }
    connection.sendAgreement(agreement, responseHandler.bind(this))
  }

  /**
   * On receipt of a signed (and staked) agreement from farmer, can begin
   * distribution of work.
   * @param {Error} err
   * @param {messages.Agreement} response
   * @param {services.RFPClient} connection
   */
  async onAgreement(err, response, connection) {
    if (err) {
      debug(`Award Response Error: ${err}`)
    } else {
      const valid = await this.validateAgreement(response)
      if (valid) {
        this.onHireConfirmed(response, connection)
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
   * @param {services.RFPClient} connection
   */
  async onHireConfirmed(agreement, connection) {
    throw new Error('Extended classes must implement onHireConfirmed')
  }

  async onReceipt(receipt, connection){
    throw new Error('Extended classes must implement onReceipt')
  }
}

module.exports = { RequesterBase }
