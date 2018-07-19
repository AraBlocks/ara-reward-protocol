const Web3 = require('web3')
const { abi } = require('./build/contracts/Farming.json')

class ContractABI {
  constructor(contractAdd, walletAdd) {
    const web3 = new Web3(
      new Web3.providers.HttpProvider('http://192.168.128.232:7545')
    )
    this.wallet = walletAdd
    this.contract = new web3.eth.Contract(abi, contractAdd)
  }

  convertToEther(number) {
    return number * 100000000000000000
  }

  submitJob(jobId, budget) {
    return this.contract.methods.submitJob(jobId).send({
      from: this.wallet,
      value: `${this.convertToEther(budget)}`
    })
  }

  submitReward(jobId, farmerId, reward) {
    return this.contract.methods
      .submitReward(jobId, farmerId, this.convertToEther(reward))
      .send({ from: this.wallet })
  }

  claimReward(jobId, farmerId) {
    return this.contract.methods
      .claimReward(jobId, farmerId)
      .send({ from: this.wallet })
  }
}

module.exports = ContractABI
