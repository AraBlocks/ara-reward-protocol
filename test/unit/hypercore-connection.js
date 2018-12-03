/* eslint no-new: off */
const { MSG, HypercoreConnection } = require('../../src/hypercore/hypercore-connection')
const { messages } = require('reward-protocol-buffers')
const protocol = require('hypercore-protocol')
const protocolFeed = require('hypercore-protocol/feed')
const sinon = require('sinon')
const test = require('ava')

const {
  Agreement,
  Receipt,
  Reward,
  Quote,
  SOW
} = messages

test('hypercore.send.validData', (t) => {
  const id = 'abcd'
  const bb = Buffer.from(id, 'hex')
  const opts = {}
  const peer = {}
  const stream = sinon.createStubInstance(protocol)
  const feed = sinon.createStubInstance(protocolFeed)

  const connection = new HypercoreConnection(peer, stream, feed, opts)

  const sow = new SOW()
  sow.setNonce(bb)
  connection.sendSow(sow)
  const decodedSow = SOW.deserializeBinary(feed.extension.getCall(0).args[1])
  t.true(Buffer.from(decodedSow.getNonce()).toString('hex') === id)

  const quote = new Quote()
  quote.setNonce(bb)
  connection.sendQuote(quote)
  const decodedQuote = Quote.deserializeBinary(feed.extension.getCall(1).args[1])
  t.true(Buffer.from(decodedQuote.getNonce()).toString('hex') === id)

  const agreeement = new Agreement()
  agreeement.setNonce(bb)
  connection.sendAgreement(agreeement)
  const decodedAgreement = Agreement.deserializeBinary(feed.extension.getCall(2).args[1])
  t.true(Buffer.from(decodedAgreement.getNonce()).toString('hex') === id)

  const reward = new Reward()
  reward.setNonce(bb)
  connection.sendReward(reward)
  const decodedReward = Reward.deserializeBinary(feed.extension.getCall(3).args[1])
  t.true(Buffer.from(decodedReward.getNonce()).toString('hex') === id)

  const receipt = new Receipt()
  receipt.setNonce(bb)
  connection.sendReceipt(receipt)
  const decodedReceipt = Receipt.deserializeBinary(feed.extension.getCall(4).args[1])
  t.true(Buffer.from(decodedReceipt.getNonce()).toString('hex') === id)
})

test('hypercore.onExtension.validData', async (t) => {
  const id = 'abcd'
  const bb = Buffer.from(id, 'hex')

  const opts = {}
  const peer = {}
  const stream = sinon.createStubInstance(protocol)
  const feed = sinon.createStubInstance(protocolFeed)

  const connection = new HypercoreConnection(peer, stream, feed, opts)

  const emitFake = sinon.fake()
  sinon.stub(connection, 'emit').callsFake(emitFake)

  const sow = new SOW()
  sow.setNonce(bb)
  const encodedSow = sow.serializeBinary()
  await connection.onExtension(MSG.SOW, encodedSow)
  t.true('sow' === emitFake.getCall(0).args[0] && id === Buffer.from(emitFake.getCall(0).args[1].getNonce()).toString('hex'))

  const quote = new Quote()
  quote.setNonce(bb)
  const encodedQuote = quote.serializeBinary()
  await connection.onExtension(MSG.QUOTE, encodedQuote)
  t.true('quote' === emitFake.getCall(1).args[0] && id === Buffer.from(emitFake.getCall(1).args[1].getNonce()).toString('hex'))

  const agreeement = new Agreement()
  agreeement.setNonce(bb)
  const encodedAgreement = agreeement.serializeBinary()
  await connection.onExtension(MSG.AGREEMENT, encodedAgreement)
  t.true('agreement' === emitFake.getCall(2).args[0] && id === Buffer.from(emitFake.getCall(2).args[1].getNonce()).toString('hex'))

  const reward = new Reward()
  reward.setNonce(bb)
  const encodedReward = reward.serializeBinary()
  await connection.onExtension(MSG.REWARD, encodedReward)
  t.true('reward' === emitFake.getCall(3).args[0] && id === Buffer.from(emitFake.getCall(3).args[1].getNonce()).toString('hex'))

  const receipt = new Receipt()
  receipt.setNonce(bb)
  const encodedReceipt = receipt.serializeBinary()
  await connection.onExtension(MSG.RECEIPT, encodedReceipt)
  t.true('receipt' === emitFake.getCall(4).args[0] && id === Buffer.from(emitFake.getCall(4).args[1].getNonce()).toString('hex'))
})

test('hypercore.onExtension.invalidData', (t) => {
  const opts = {}
  const peer = {}
  const stream = sinon.createStubInstance(protocol)
  const feed = sinon.createStubInstance(protocolFeed)

  const connection = new HypercoreConnection(peer, stream, feed, opts)
  const invalidData = Buffer.from('A', 'ascii')

  t.false(connection.onExtension(MSG.SOW, invalidData))
  t.false(connection.onExtension(-1, invalidData))
})

test('hypercore.constructor', (t) => {
  const opts = {}
  const peer = {}
  const stream = sinon.createStubInstance(protocol)
  const feed = sinon.createStubInstance(protocolFeed)

  const correctContructorA = new HypercoreConnection(peer, stream, feed, opts)
  const correctContructorB = new HypercoreConnection(peer, stream, feed, null)
  t.true(Boolean(correctContructorA))
  t.true(Boolean(correctContructorB))

  /* eslint-disable-next-line no-new */
  t.throws(() => { new HypercoreConnection(null, stream, feed, opts) }, TypeError)
  /* eslint-disable-next-line no-new */
  t.throws(() => { new HypercoreConnection(peer, null, feed, opts) }, TypeError)
  /* eslint-disable-next-line no-new */
  t.throws(() => { new HypercoreConnection(peer, stream, null, opts) }, TypeError)
})

test('hypercore.emit.withStream', async (t) => {
  const opts = {}
  const peer = {}
  const stream = sinon.createStubInstance(protocol)
  const feed = sinon.createStubInstance(protocolFeed)

  const connection = new HypercoreConnection(peer, stream, feed, opts)
  await connection.onTimeout()
  await connection.onClose()
  await connection.onEnd()
  await connection.onError()
  await connection.close()

  t.true(5 === stream.finalize.callCount)
})

test('hypercore.emit.withoutStream', async (t) => {
  const opts = {}
  const peer = {}
  const stream = sinon.createStubInstance(protocol)
  const feed = sinon.createStubInstance(protocolFeed)

  const connection = new HypercoreConnection(peer, stream, feed, opts)
  connection.stream = null

  await connection.onTimeout()
  await connection.onClose()
  await connection.onEnd()
  await connection.close()

  t.true(stream.finalize.notCalled)
})
