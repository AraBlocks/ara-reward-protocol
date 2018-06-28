const Web3 = require("web3");
const ABI = require("./ABI");

class FarmingContract {
  constructor(contractAddress, moderatorAddress) {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider("http://192.168.128.232:7545")
    );
    this.contract = new this.web3.eth.Contract(ABI, contractAddress);

    // if (typeof web3 !== "undefined") {
    //   this.web3 = new Web3(Web3.currentProvider);
    // } else {
    //   // set the provider you want from Web3.providers
    //   this.web3 = new Web3(
    //     new Web3.providers.HttpProvider("http://192.168.128.232:7545")
    //   );
    // }

    this.web3.eth.defaultAccount = moderatorAddress;
  }
}

module.exports = FarmingContract;
