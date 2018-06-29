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
    this.contract = new this.web3.eth.Contract(ABI, contractAddress);
    this.web3.eth.defaultAccount = personalAddress;
    this.personalAddress = personalAddress;
  }

  getBalance() {
    this.contract.methods
      .getBalance()
      .call({ from: this.personalAddress }, function(error, result) {
        console.log("error: ", error, "\nresult: ", result);
      });
  }

  getRate(jobId) {
    this.contract.methods
      .getRate(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log("error: ", error, "\nresult: ", result);
      });
  }

  getJob(jobId) {
    this.contract.methods
      .getJob(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log("error: ", error, "\nresult: ", result);
      });
  }

  createJob(jobId, budget) {
    this.contract.methods
      .createJob(jobId)
      .send(
        { from: this.personalAddress, value: budget, gas: 3000000 },
        function(error, result) {
          console.log("error: ", error, "\nresult: ", result);
        }
      );
  }

  acceptJob(jobId) {
    this.contract.methods
      .acceptJob(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log("error: ", error, "\nresult: ", result);
      });
  }

  startJob(jobId) {
    this.contract.methods
      .startJob(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log("error: ", error, "\nresult: ", result);
      });
  }

  abortJob(jobId) {
    this.contract.methods
      .startJob(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log("error: ", error, "\nresult: ", result);
      });
  }
}

module.exports = FarmingContract;
