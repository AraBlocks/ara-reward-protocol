const Web3 = require('web3')
const { abi } = require('./build/contracts/Farming.json')
const { provider } = require('../constants')

class ContractABI {
  constructor(contractAdd, walletAdd) {
    const web3 = new Web3(new Web3.providers.HttpProvider(provider))
    this.wallet = walletAdd
    this.contract = new web3.eth.Contract(abi, contractAdd)
  }

  convertToEther(number) {
    return number * 1000000000000000000
  }

  // Budget in Ether
  submitJob(jobId, budget) {
    return this.contract.methods.submitJob(jobId).send({
      from: this.wallet,
      value: `${this.convertToEther(budget)}`
    })
  }

  // Reward in Ether
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
