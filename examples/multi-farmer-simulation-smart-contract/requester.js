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

    this.farmerServers = [];
  }

  async submitJob(budget) {
    const response = await this.smartContract.createJob(
      this.contractId,
      budget
    );
    if (response) {
      this.hasJob = true;
    }
    return response;
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
  onHireConfirmed(contract, server) {
    this.farmerServers.push(server);
    console.log(
      `Requester: Contract ${contract.getId()} signed by farmer ${contract
        .getQuote()
        .getFarmer()
        .getDid()}`
    );
  }

  /**
   * Handles a job on finished
   */
  onJobFinished(report) {
    this.farmerServers.forEach(farmer => {
      this.awardFarmer(farmer, report);
    });
  }

  /**
   * Awards farmer for their work
   */
  awardFarmer(farmer, report) {
    farmer.requestQuote(this.sow, (error, quote) => {
      if (error) {
        console.log(
          `RequesterExample: Fail to get Quote while rewarding farmer`
        );
      } else {
        const farmerId = quote.getFarmer().getDid();
        const reward = this.calculateReward(farmerId, report, quote);
        this.sendReward(farmer, farmerId, this.sow, reward);
      }
    });
  }

  /**
   * Calculates farmer reward
   */
  calculateReward(farmerId, report, quote) {
    const unitsDone = report.get(farmerId);
    return quote.getPerUnitCost() * unitsDone;
  }

  /**
   * Submits a reward to the contract, and notifies the farmer that their reward is available for withdraw
   */
  async sendReward(farmer, farmerId, sow, reward) {
    const response = await this.smartContract.submitReward(
      farmerId,
      sow.getId(),
      reward
    );
    if (response) {
      farmer.deliverReward(sow, (err, response) => {
        if (err) {
          console.log(
            `RequesterExample: fail to notify farmer ${farmerId} about the reward`
          );
        } else {
          console.log(
            `RequesterExample: farmer ${farmerId} has been notified about the reward delivery`
          );
        }
      });
    } else {
      console.log(
        `RequesterExample: Fail to submit the reward for famer ${farmerId} to contract`
      );
    }
  }
}

module.exports = { ExampleRequester };
