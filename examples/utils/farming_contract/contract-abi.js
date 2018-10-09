const Web3 = require('web3')
const { abi } = require('./build/contracts/Farming.json')

class ContractABI {
  constructor() {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://172.20.0.3:8545'))
    this.wallet = '0x04cb29259ffccde07a4c988924d4452f64401fc6'
    this.contract = new web3.eth.Contract(abi, '0x9a57a984d1856c3a5e714a306b30f5cd45496f2c')
  }

  // Budget in Wei
  submitJob(jobId, budget) {
    return this.contract.methods.submitJob(maskHex(jobId)).send({
      from: this.wallet,
      value: `${budget}`
    })
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
