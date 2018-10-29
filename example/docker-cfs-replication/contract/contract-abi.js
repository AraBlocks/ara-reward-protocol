const Web3 = require('web3')
const { abi, networks } = require('../local/contract-address.json')

class ContractABI {
  constructor(walletAdd) {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://ganachecli:8545')) // use 'localhost' to test locally, 'ganachecli' to test on docker
    const addressKey = Object.keys(networks)[0]
    this.wallet = walletAdd
    this.contract = new web3.eth.Contract(abi, networks[addressKey].address)
  }

  // Budget in Wei
  submitJob(jobId, budget) {
    return this.contract.methods.submitJob(maskHex(jobId)).send({
      from: this.wallet,
      value: `${budget}`
    })
  }

  getRewardBalance(jobId, farmerId) {
    return this.contract.methods
      .getRewardBalance(maskHex(jobId), maskHex(farmerId))
      .send({ from: this.wallet })
  }

  // Reward in Wei
  submitReward(jobId, farmerId, reward) {
    return this.contract.methods
      .submitReward(maskHex(jobId), maskHex(farmerId), reward)
      .send({ from: this.wallet })
  }

  claimReward(jobId, farmerId) {
    return this.contract.methods
      .claimReward(maskHex(jobId), maskHex(farmerId))
      .send({ from: this.wallet })
  }
}

function maskHex(hex) {
  return `0x${hex}`
}

module.exports = ContractABI
