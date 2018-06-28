const { Authenticator } = require('../authenticator')
const messages = require('../proto/messages_pb')

/**
 * Example authenticator to validate a farmer
 */
class ExampleFarmerAuth extends Authenticator {
  constructor(badFarmerId) {
    super()
    this.badFarmerId = badFarmerId
  }

  validateContract(contract) {
    const farmerId = contract.getQuote().getFarmer().getId()
    if (farmerId == this.badFarmerId) {
      console.log(`Invalid contract: ${contract.getId()} from bad farmer: ${farmerId}`)
      return false
    }
    return true
  }
}

/**
 * Example authenticator to validate a requester
 */
class ExampleRequesterAuth extends Authenticator {
  constructor(badRequesterId) {
    super()
    this.badRequesterId = badRequesterId
  }

  validateContract(contract) {
    const requesterId = contract.getQuote().getSow().getRequester().getId()
    if (requesterId == this.badRequesterId) {
      console.log(`Invalid contract: ${contract.getId()} from bad requester: ${requesterId}`)
      return false
    }
    return true
  }
}

module.exports = {ExampleFarmerAuth, ExampleRequesterAuth}