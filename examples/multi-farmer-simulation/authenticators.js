const { Authenticator } = require('../../lib/authenticator')
const messages = require('../../lib/proto/messages_pb')

/**
 * Example authenticator to validate a farmer
 */
class ExampleFarmerAuth extends Authenticator {
  constructor(badFarmerId) {
    super()
    this.badFarmerId = badFarmerId
  }

  validatePeer(peer) {
    const farmerId = peer.getId()
    if (farmerId == this.badFarmerId) {
      console.log(`Invalid farmer: ${farmerId}`)
      return false
    }
    return true
  }

  validateContract(contract) {
    // TODO validate contract and stake
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

  validatePeer(peer) {
    const requesterId = peer.getId()
    if (requesterId == this.badRequesterId) {
      console.log(`Invalid requester: ${requesterId}`)
      return false
    }
    return true
  }

  validateContract(contract) {
    // TODO validate contract and stake
    return true
  }
}

module.exports = { ExampleFarmerAuth, ExampleRequesterAuth }
