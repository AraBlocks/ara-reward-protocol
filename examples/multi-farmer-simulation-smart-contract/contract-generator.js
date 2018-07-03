const { ContractGenerator } = require('../../lib/contract-generator')
const messages = require('../../lib/proto/messages_pb')
const smartContract = require('./contract-factory.js')

class ExampleContractGenerator extends ContractGenerator {
  constructor(id, budget) {
    super()
    this.id = id
    this.budget = budget
  }

  validateContract(contract) {
    if (contract.getId() == this.id) return true
    return false
  }

  generateContract(quote) {
    const contract = new messages.Contract()
    contract.setId(this.id)
    contract.setQuote(quote)
    return contract
  }

  deployJobToContract() {
    smartContract.createJob(this.id, this.budget)
  }

  submitRewardToContract(farmerId, jobId, reward) {
    smartContract.submitReward(farmerId, jobId, reward)
  }
}

module.exports = { ExampleContractGenerator }
