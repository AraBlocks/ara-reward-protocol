const { Requester } = require('../../src/requester');
const messages = require('../../src/proto/messages_pb');
const Contract = require('./contract/contract.js');

class ExampleRequester extends Requester {
  constructor(sow, matcher, requesterSig, requesterId, requesterKey) {
    super(sow, matcher);
    this.badFarmerId = 'ara:did:2';
    this.requesterSig = requesterSig;
    this.contractId = 101;
    this.smartContract = new Contract(requesterId, requesterKey);
  }

  submitJob(budget) {
    this.smartContract.createJob(this.contractId, budget);
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    const farmerId = peer.getDid();
    if (farmerId == this.badFarmerId) {
      console.log(`Requester: Invalid farmer ${farmerId}`);
      return false;
    }
    return true;
  }

  /**
   * Generates a contract for quote
   * @param {messages.Quote} quote
   * @returns {messages.Contract}
   */
  generateContract(quote) {
    const contract = new messages.Contract();
    contract.setId(this.contractId);
    contract.setQuote(quote);
    contract.setRequesterSignature(this.requesterSig);
    return contract;
  }

  /**
   * Returns whether a contract is valid.
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    if (contract.getId() == this.contractId) return true;
    return false;
  }

  /**
   * On receipt of a signed (and staked) contract from farmer, begins distribution of work
   */
  onHireConfirmed(contract) {
    console.log(
      `Requester: Contract ${contract.getId()} signed by farmer ${contract
        .getQuote()
        .getFarmer()
        .getDid()}`
    );
  }

  /**
   * After a job is finished, submits reward for each farmer to contract and notifies the farmers that their reward is ready to be withdrawn
   */
  sendReward() {
    const smartContract = this.smartContract;
    const sow = this.sow;
    this.farmers.forEach(farmer => {
      farmer.getQuote(this.sow, (error, quote) => {
        const reward = quote.getPerUnitCost();
        smartContract.submitReward(farmer.getId, sow.getId(), reward);
      });
    });
    // farmer.notifyAvailableReward();
  }
}

module.exports = { ExampleRequester };
