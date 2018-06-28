const Web3 = require("web3");
const ABI = require("./ABI");

class FarmingContract {
  constructor(contractAddress, personalAddress) {
    if (typeof this.web3 !== "undefined") {
      this.web3 = new Web3(this.web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://192.168.128.232:7545")
      );
    }
    this.web3.eth.defaultAccount = personalAddress;
  }

  getBalance() {}

  getRate(jobId) {}

  createJob(jobId, budget) {}

  acceptJob(jobId) {}

  startJob(jobId) {}

  abortJob(jobId) {}
}

module.exports = FarmingContract;
