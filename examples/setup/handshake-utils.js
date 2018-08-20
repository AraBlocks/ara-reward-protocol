const { passphrase, networkSecret, networkKeyName } = require('./constants.js')
const { unpack, keyRing } = require('ara-network/keys')
const { info, warn } = require('ara-console')
const { Handshake } = require('ara-network/handshake')
const { readFile } = require('fs')
const { resolve } = require('path')
const { DID } = require('did-uri')
const crypto = require('ara-crypto')
const pify = require('pify')
const rc = require('ara-network/rc.js')(require('ara-identity/rc')())

function configFarmerHandshake(conf) {
  const handshake = getHandshake(conf)
  handshake.hello()
  handshake.on('hello', onhello)

  function onhello() {
    info('got HELLO')
    handshake.auth()
  }

  return handshake
}

function configRequesterHandshake(conf) {
  const handshake = getHandshake(conf)

  function onhello() {
    info('got HELLO')
    handshake.hello()
  }

  return handshake
}

function getHandshake(conf) {
  const {
    publicKey, secretKey, secret, unpacked
  } = conf
  const handshake = new Handshake({
    publicKey,
    secretKey,
    secret,
    remote: { publicKey: unpacked.publicKey },
    domain: { publicKey: unpacked.domain.publicKey }
  })

  handshake.on('auth', onauth)
  handshake.on('okay', onokay)

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
  const keyring = keypath.indexOf('pub') < 0 ? keyRing(keypath, { secret: secretKey }) : keyRing(keypath, { secret })
  if (await keyring.has(networkKeyName)) {
    const buffer = await keyring.get(networkKeyName)
    const unpacked = unpack({ buffer })
    return {
      publicKey, secretKey, secret, unpacked
    }
  }
  warn(`No key for network "${networkKeyName}". Data will be unencrypted.`)
}

module.exports = {
  unpackKeys,
  configFarmerHandshake,
  configRequesterHandshake
}
