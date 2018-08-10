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
    return this.contract.methods.submitJob(this.maskHex(jobId)).send({
      from: this.wallet,
      value: `${this.convertToEther(budget)}`
    })
  }

  // Reward in Ether
  submitReward(jobId, farmerId, reward) {
    return this.contract.methods
      .submitReward(this.maskHex(jobId), this.maskHex(farmerId), this.convertToEther(reward))
      .send({ from: this.wallet })
  }

  claimReward(jobId, farmerId) {
    return this.contract.methods
      .claimReward(this.maskHex(jobId), this.maskHex(farmerId))
      .send({ from: this.wallet })
  }

  maskHex(hex){
    return `0x${hex}`
  }
}

module.exports = ContractABI
