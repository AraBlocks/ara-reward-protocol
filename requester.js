const messages = require('./proto/messages_pb')

/*
    Class that handles the communication for requesting a specific SOW for a single task.
*/
class Requester {
  constructor(sow, matcher) {
    this.sow = sow
    this.matcher = matcher
  }

  /*
        Iterates through an array of Farmers and gets quotes from them for the defined SOW
    */
  processFarmers(farmers) {
    farmers.forEach((farmer) => {
      const responseHandler = function (err, response) {
        this.handleQuoteResponse(err, response, farmer)
      }
      farmer.getQuote(this.sow, responseHandler.bind(this))
    })
  }

  /*
        On receipt of a quote from a farmer, asks the defined Matcher to consider the quote.
        On the Matcher selecting the quote, initializes a contract, signs it for the specific
        SOW and Farmer, then sends the contract to the farmer.
    */
  handleQuoteResponse(err, response, farmer) {
    if (err) {
      console.log(`Quote Response: ${err}`)
    } else {
      console.log(`Requester: Received Quote ${response.getPerUnitCost()} per ${response.getSow().getWorkUnit()} from farmer ${response.getFarmer().getId()}`)

      const optionCallback = function () {
        // TODO: generate actual contract
        const contract = new messages.Contract()
        contract.setId(103)
        contract.setQuote(response)

        farmer.awardContract(contract, this.handleSignedContract.bind(this))
      }

      this.matcher.considerQuoteOption(response, optionCallback.bind(this))
    }
  }

  /*
        On receipt of a signed (and staked) contract from farmer, can begin distribution of work.
    */
  handleSignedContract(err, response) {
    if (err) {
      console.log(`Award Response: ${err}`)
    } else {
      console.log(`Requester: Contract ${response.getId()} signed by farmer ${response.getQuote().getFarmer().getId()}`)
    }
  }
}

module.exports = { Requester }
