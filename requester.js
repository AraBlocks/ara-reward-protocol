const messages = require('./proto/messages_pb')
const services = require('./proto/route_guide_grpc_pb')

class Requester {
  /**
   * Class that handles the communication for requesting a specific SOW for a single task.
   * @param {messages.SOW} sow
   * @param {Matcher} matcher
   * @param {Authenticator} authenticator
   */
  constructor(sow, matcher, authenticator) {
    this.sow = sow
    this.matcher = matcher
    this.authenticator = authenticator
  }

  /**
   * Iterates through an array of Farmers and gets quotes from them for the defined SOW
   * @param {services.RFPClient} farmers
   */
  processFarmers(farmers) {
    farmers.forEach((farmer) => {
      const responseHandler = function (err, response) {
        this.handleQuoteResponse(err, response, farmer)
      }
      farmer.getQuote(this.sow, responseHandler.bind(this))
    })
  }

  /**
   * On receipt of a quote from a farmer, asks the defined Matcher to consider the quote.
   * On the Matcher selecting the quote, initializes a contract, signs it for the specific
   * SOW and Farmer, then sends the contract to the farmer.
   * @param {Error} err
   * @param {messages.Quote} response
   * @param {services.RFPClient} farmer
   */
  handleQuoteResponse(err, response, farmer) {
    if (err) {
      console.log(`Quote Response: ${err}`)
    } else {
      console.log(`Requester: Received Quote ${response.getPerUnitCost()} per ${response.getSow().getWorkUnit()} from farmer ${response.getFarmer().getId()}`)

      const optionCallback = function () {
        // TODO generate actual contract
        const contract = new messages.Contract()
        contract.setId(103)
        contract.setQuote(response)

        farmer.awardContract(contract, this.handleSignedContract.bind(this))
      }

      if (this.authenticator.validatePeer(response.getFarmer())) {
        this.matcher.considerQuoteOption(response, optionCallback.bind(this))
      }
    }
  }

  /**
   * On receipt of a signed (and staked) contract from farmer, can begin distribution of work.
   * @param {Error} err
   * @param {messages.Contract} response
   */
  handleSignedContract(err, response) {
    if (err) {
      console.log(`Award Response: ${err}`)
    } else if (this.authenticator.validateContract(response)) {
      // TODO Validate stake
      // TODO Start task
      console.log(`Requester: Contract ${response.getId()} signed by farmer ${response.getQuote().getFarmer().getId()}`)
    } else {
      this.matcher.invalidateQuoteOption(response.getQuote())
    }
  }
}

module.exports = { Requester }
