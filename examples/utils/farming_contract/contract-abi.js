const Web3 = require('web3')
const { abi } = require('./build/contracts/Farming.json')
const { provider } = (require('ara-identity/rc')()).web3

class ContractABI {
  constructor(contractAdd, walletAdd) {
    const web3 = new Web3(new Web3.providers.HttpProvider(provider))
    this.wallet = walletAdd
    this.contract = new web3.eth.Contract(abi, contractAdd)
  }

  // Budget in Ether
  submitJob(jobId, budget) {
    return this.contract.methods.submitJob(maskHex(jobId)).send({
      from: this.wallet,
      value: `${convertToEther(budget)}`
    })
  }

  // Reward in Ether
  submitReward(jobId, farmerId, reward) {
    return this.contract.methods
      .submitReward(maskHex(jobId), maskHex(farmerId), convertToEther(reward))
      .send({ from: this.wallet })
  }

  claimReward(jobId, farmerId) {
    return this.contract.methods
      .claimReward(maskHex(jobId), maskHex(farmerId))
      .send({ from: this.wallet })
  }
}

function convertToEther(number) {
  return number * 1000000000000000000
}

function maskHex(hex) {
  return `0x${hex}`
}

module.exports = ContractABI
