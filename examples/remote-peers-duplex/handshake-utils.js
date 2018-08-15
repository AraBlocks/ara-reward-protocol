const {farmerDID, requesterDID, passphrase, networkSecret, networkKeyName,
  networkPublicKeypath, networkSecretKeypath} = require('../constants.js')
const { DID } = require('did-uri')
const crypto = require('ara-crypto')
const rc = require('../../../ara-network/rc.js')(require('ara-identity/rc')())
const { resolve } = require('path')
const pify = require('pify')
const { readFile } = require('fs')
const { unpack, keyRing } = require('../../../ara-network/keys.js')
const { Handshake } = require('../../../ara-network/handshake.js')
const { info, warn } = require('ara-console')

function configHandshake(identity, conf) {
  const {publicKey, secretKey, secret, unpacked} = conf
  const handshake = new Handshake({
        publicKey,
        secretKey,
        secret,
        remote: { publicKey: unpacked.publicKey },
        domain: { publicKey: unpacked.domain.publicKey }
  })

  identity === farmerDID && handshake.hello()
  handshake.on('hello', onhello)
  handshake.on('auth', onauth)
  handshake.on('okay', onokay)

  function onhello() {
    info('got HELLO')
    identity === requesterDID && handshake.hello()
    identity === farmerDID && handshake.auth()
  }

  function onauth() {
    info('got AUTH')
  }

  function onokay(signature) {
    info('got OKAY')
    handshake.emit('handshake', signature)
  }
  return handshake
}

async function unpackKeys(identity, keypath) {
  let id = identity
  if (identity && 0 !== identity.indexOf('did:ara:')) {
    id = `did:ara:${identity}`
  }
  const did = new DID(id)
  const publicKey = Buffer.from(did.identifier, 'hex')
  const password = crypto.blake2b(Buffer.from(passphrase))
  const hash = crypto.blake2b(publicKey).toString('hex')
  const path = resolve(rc.network.identity.root, hash, 'keystore/ara')
  const secret = Buffer.from(networkSecret)
  const keystore = JSON.parse(await pify(readFile)(path, 'utf8'))
  const secretKey = crypto.decrypt(keystore, { key: password.slice(0, 16) })
  const keyring = keypath.indexOf("pub") < 0 ? keyRing(keypath, { secret: secretKey }) : keyRing(keypath, { secret: secret })
  const buffer = await keyring.get(networkKeyName)
  const unpacked = unpack({ buffer })
  return {publicKey, secretKey, secret, unpacked}
}

module.exports = {
  unpackKeys,
  configHandshake
}
