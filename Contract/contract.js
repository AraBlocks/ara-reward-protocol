const Web3 = require("web3");
const abi = require("./ABI");
const EthereumTx = require("ethereumjs-tx");

class FarmingContract {
  constructor(contractAddress, personalAddress, personalKey) {
    if (typeof this.web3 !== "undefined") {
      this.web3 = new Web3(this.web3.currentProvider);
    } else {
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://192.168.128.232:7545")
      );
    }
    this.contract = new this.web3.eth.Contract(abi, contractAddress);
    this.web3.eth.defaultAccount = personalAddress;

    this.personalAddress = personalAddress;
    this.contractAddress = contractAddress;
    this.personalKey = personalKey;
  }

  sign(abiData, txValue) {
    const eth = this.web3.eth;
    this.web3.eth.getTransactionCount(this.personalAddress, function(
      err,
      nonce
    ) {
      var tx = new EthereumTx({
        nonce: nonce,
        gasLimit: 3000000,
        to: this.contractAddress,
        value: txValue,
        data: abiData
      });
      tx.sign(Buffer.from(this.personalKey, "hex"));

      var raw = "0x" + tx.serialize().toString("hex");
      eth.sendSignedTransaction(raw, function(err, transactionHash) {
        console.log(err, transactionHash);
      });
    });
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
    const encodedMethod = this.contract.methods.createJob(jobId).encodeABI();
    this.sign(encodedMethod, budget);
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
