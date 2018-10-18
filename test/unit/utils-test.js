const {
  idify,
  nonceString,
  bytesToGBs,
  gbsToBytes,
  etherToWei,
  weiToEther
} = require('../../src/util')
const { messages } = require('farming-protocol-buffers')
const sinon = require('sinon')
const test = require('ava')

const { Agreement } = messages

test('util.idify', (t) => {
  t.true('host:port' === idify('host', 'port'))
  t.true('host:port' === idify('::ffff:host', 'port'))
})

test('util.nonceString', (t) => {
  	const id = 'abcd'
  	const bb = Buffer.from(id, 'hex')
  const agreeement = new Agreement()
  	agreeement.setNonce(bb)

  t.true(id === nonceString(agreeement))
})

test('util.bytesToGBs', (t) => {
  t.true(1 === bytesToGBs(1000000000))
})

test('util.gbsToBytes', (t) => {
  t.true(1000000000 === gbsToBytes(1))
})

test('util.etherToWei', (t) => {
  t.true(1000000000000000000 === etherToWei(1))
})

test('util.weiToEther', (t) => {
  t.true(1 === weiToEther(1000000000000000000))
})
