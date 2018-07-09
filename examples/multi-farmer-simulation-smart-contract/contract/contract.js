const Web3 = require('web3');
const { abi, address } = require('./ABI');
const EthereumTx = require('ethereumjs-tx');

class FarmingContract {
  constructor(personalAddress, personalKey) {
    if (typeof this.web3 !== 'undefined') {
      this.web3 = new Web3(this.web3.currentProvider);
    } else {
      this.web3 = new Web3(
        new Web3.providers.HttpProvider('http://192.168.128.232:7545')
      );
    }
    this.contract = new this.web3.eth.Contract(abi, address);
    this.web3.eth.defaultAccount = personalAddress;

    this.personalAddress = personalAddress;
    this.personalKey = personalKey;
  }

  sign(abiData, txValue) {
    const web3 = this.web3;
    web3.eth.getTransactionCount(this.personalAddress, function(err, nonce) {
      let tx = new EthereumTx({
        nonce: 3,
        gasLimit: 3000000,
        to: address,
        value: 0,
        data: abiData
      });
      const privateKey = Buffer.from(
        'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
        'hex'
      );
      tx.sign(privateKey);
      var raw = '0x' + tx.serialize().toString('hex');
      web3.eth.sendSignedTransaction(raw, function(err, transactionHash) {
        console.log(err, transactionHash);
      });
    });
  }

  getBalance() {
    this.contract.methods
      .getBalance()
      .call({ from: this.personalAddress }, function(error, result) {
        console.log('error: ', error, '\nresult: ', result);
      });
  }

  getRate(jobId) {
    this.contract.methods
      .getRate(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log('error: ', error, '\nresult: ', result);
      });
  }

  getJob(jobId) {
    this.contract.methods
      .getJob(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log('error: ', error, '\nresult: ', result);
      });
  }

  createJob(jobId, budget) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 3000);
    });
  }
  // const encodedMethod = this.contract.methods.createJob(jobId).encodeABI();
  // this.sign(encodedMethod, budget);

  acceptJob(jobId) {
    this.contract.methods
      .acceptJob(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log('error: ', error, '\nresult: ', result);
      });
  }

  startJob(jobId) {
    this.contract.methods
      .startJob(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log('error: ', error, '\nresult: ', result);
      });
  }

  abortJob(jobId) {
    this.contract.methods
      .startJob(jobId)
      .call({ from: this.personalAddress }, function(error, result) {
        console.log('error: ', error, '\nresult: ', result);
      });
  }

  submitReward(farmerId, jobId, reward) {
    console.log('Contract: reward submitted: ', reward);
  }
}

module.exports = FarmingContract;
