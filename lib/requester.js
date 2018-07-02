const messages = require('./proto/messages_pb');
const services = require('./proto/route-guide_grpc_pb');

class Requester {
  /**
   * Class that handles the communication for requesting a specific SOW for a single task.
   * @param {messages.SOW} sow
   * @param {Matcher} matcher
   * @param {PeerAuthenticator} peerAuth
   * @param {ContractGenerator} contractGen
   */
  constructor(sow, matcher, peerAuth, contractGen) {
    this.sow = sow;
    this.matcher = matcher;
    this.peerAuth = peerAuth;
    this.contractGen = contractGen;
  }

  /**
   * Iterates through an array of Farmers and gets quotes from them for the defined SOW
   * @param {services.RFPClient} farmers
   */
  processFarmers(farmers) {
    farmers.forEach(farmer => {
      const responseHandler = function(err, response) {
        this.handleQuoteResponse(err, response, farmer);
      };
      farmer.getQuote(this.sow, responseHandler.bind(this));
    });
  }

  /**
   * On receipt of a quote from a farmer, asks the defined Matcher to consider the quote
   * and passes to the Matcher a callback for hiring the farmer.
   * @param {Error} err
   * @param {messages.Quote} response
   * @param {services.RFPClient} farmer
   */
  handleQuoteResponse(err, response, farmer) {
    if (err) {
      console.log(`Quote Response: ${err}`);
    } else if (this.peerAuth.validatePeer(response.getFarmer())) {
      const cb = this.createHireFarmerCallback(response, farmer);
      this.matcher.considerQuoteOption(response, cb.bind(this));
    }
  }

  /**
   * Creates a callback function which generates a contract and sends it to a specific farmer
   * @param {messages.Quote} quote
   * @param {services.RFPClient} farmer
   * @returns {function}
   */
  createHireFarmerCallback(quote, farmer) {
    const optionCallback = function() {
      const contract = this.contractGen.generateContract(quote); // Generate contract for each farmer, should there be only one contract gets generated?
      farmer.awardContract(contract, this.handleSignedContract.bind(this));
    };
    return optionCallback;
  }

  /**
   * On receipt of a signed (and staked) contract from farmer, can begin distribution of work.
   * @param {Error} err
   * @param {messages.Contract} response
   */
  handleSignedContract(err, response) {
    if (err) {
      console.log(`Award Response: ${err}`);
    } else if (this.contractGen.validateContract(response)) {
      const responseHandler = function() {
        this.handleHiringResponse();
      };
      this.matcher.onHireConfirmed(response, responseHandler.bind(this));
    } else {
      this.matcher.invalidateQuoteOption(response.getQuote());
    }
  }

  handleHiringResponse() {
    this.contractGen.deploySmartContract();
  }

  processFarmers(farmers) {
    farmers.forEach(farmer => {
      const responseHandler = function(err, response) {
        this.handleQuoteResponse(err, response, farmer);
      };
      farmer.getQuote(this.sow, responseHandler.bind(this));
    });
  }

  sendReward() {}
}

module.exports = { Requester };
