const { PeerAuthenticator } = require('../../lib/peer-authenticator')
const messages = require('../../lib/proto/messages_pb')

/**
 * Example authenticator to validate a farmer
 */
class ExampleFarmerAuth extends PeerAuthenticator {
  constructor(badFarmerId) {
    super()
    this.badFarmerId = badFarmerId
  }

  validatePeer(peer) {
    const farmerId = peer.getId()
    if (farmerId == this.badFarmerId) {
      console.log(`Requester: Invalid farmer ${farmerId}`)
      return false
    }
    return true
  }
}

/**
 * Example authenticator to validate a requester
 */
class ExampleRequesterAuth extends PeerAuthenticator {
  constructor(badRequesterId) {
    super()
    this.badRequesterId = badRequesterId
  }

  validatePeer(peer) {
    const requesterId = peer.getId()
    if (requesterId == this.badRequesterId) {
      console.log(`Farmer: Invalid requester ${requesterId}`)
      return false
    }
    return true
  }
}

module.exports = { ExampleFarmerAuth, ExampleRequesterAuth }
