const messages = require('./proto/messages_pb')

class PeerAuthenticator {
  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.')
  }
}

module.exports = { PeerAuthenticator }
