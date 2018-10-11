const Web3 = require('web3')
const { abi, networks } = require('./build/contracts/Farming.json')

class ContractABI {
  constructor(walletAdd) {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://0.0.0.0:8545'))
    const.addressKey = Object.keys(networks)[0]
    this.wallet = walletAdd
    this.contract = new web3.eth.Contract(abi, network[addressKey].address)
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
