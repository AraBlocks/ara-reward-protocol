const messages = require('./proto/messages_pb');
const services = require('./proto/route-guide_grpc_pb');

class Requester {
  /**
   * Class that handles the communication for requesting a specific SOW
   * for a single task.
   * @param {messages.SOW} sow
   * @param {Matcher} matcher
   * @param {services.RFPClient} farmers
   */
  constructor(sow, matcher) {
    this.sow = sow;
    this.matcher = matcher;
    this.hasJob = false;
  }

  /**
   * Iterates through an array of Farmers and gets quotes from them for
   * the defined SOW
   * @param {services.RFPClient} farmers
   */
  processFarmers(farmers) {
    farmers.forEach(farmer => {
      const responseHandler = function(err, response) {
        this.handleQuoteRequest(err, response, farmer);
      };
      farmer.requestQuote(this.sow, responseHandler.bind(this));
    });
  }

  /**
   * On receipt of a quote from a farmer, asks the defined Matcher to
   * consider the quote and passes to the Matcher a callback for hiring
   * the farmer.
   * @param {Error} err
   * @param {messages.Quote} request
   * @param {services.RFPClient} farmer
   */
  handleQuoteRequest(err, request, farmer) {
    if (err) {
      console.log(`Quote Response Error: ${err}`);
    } else if (this.validatePeer(request.getFarmer())) {
      const callback = () => this.hireFarmer(request, farmer);
      this.matcher.validateQuote(request, callback.bind(this));
    }
  }

  /**
   * Generates a contract and sends it to a specific farmer
   * @param {messages.Quote} quote
   * @param {services.RFPClient} farmer
   */
  hireFarmer(quote, farmer) {
    const contract = this.generateContract(quote);
    const responseHandler = function(err, response) {
      this.handleSignedContract(err, response, farmer);
    };
    farmer.awardContract(contract, responseHandler.bind(this));
  }

  /**
   * On receipt of a signed (and staked) contract from farmer, can begin
   * distribution of work.
   * @param {Error} err
   * @param {messages.Contract} response
   * @param {services.RFPClient} farmer
   */
  handleSignedContract(err, response, farmer) {
    if (err) {
      console.log(`Award Response Error: ${err}`);
    } else if (this.validateContract(response)) {
      this.onHireConfirmed(response, farmer);
    } else {
      this.matcher.invalidateQuote(response.getQuote());
    }
  }

  /**
   * This should returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.');
  }

  /**
   * This should generate and return a contract for a quote.
   * @param {messages.Quote} quote
   * @returns {messages.Contract}
   */
  generateContract(quote) {
    throw new Error('Extended classes must implement generateContract.');
  }

  /**
   * This should return whether a contract is valid.
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract.');
  }

  /**
   * This is called when a contract has been marked as valid and a farmer
   * is ready to start work
   * @param {messages.Contract} contract
   * @param {services.RFPClient} farmer
   */
  onHireConfirmed(contract, farmer) {
    throw new Error('Extended classes must implement onHireConfirmed');
  }
}

module.exports = { Requester };
