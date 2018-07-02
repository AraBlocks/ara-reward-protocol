const { ContractGenerator } = require('../../lib/contract-generator')
const messages = require('../../lib/proto/messages_pb')

class ExampleContractGenerator extends ContractGenerator {
    constructor(id){
        super()
        this.id = id
    }

    validateContract(contract) {
        if (contract.getId() == this.id) return true
        else return false
    }

    generateContract(quote) {
        const contract = new messages.Contract()
        contract.setId(this.id)
        contract.setQuote(quote)
        return contract
    }
}

module.exports = { ExampleContractGenerator }