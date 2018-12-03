/* eslint no-new: off */
const { MSG, DuplexConnection } = require('../../src/duplex/duplex-connection')
const { messages } = require('reward-protocol-buffers')
const { Duplex } = require('stream')
const sinon = require('sinon')
const test = require('ava')

const {
  Agreement,
  Receipt,
  Reward,
  Quote,
  SOW
} = messages

test('duplex.encode-decode.validData', (t) => {
  const id = 'abcd'
  const bb = Buffer.from(id, 'hex')

  const sow = new SOW()
  sow.setNonce(bb)
  const encodedSow = MSG.encode(MSG.SOW.head, sow.serializeBinary())
  const decodedSow = SOW.deserializeBinary(MSG.decode(encodedSow).data)
  t.true(Buffer.from(decodedSow.getNonce()).toString('hex') === id)

  const quote = new Quote()
  quote.setNonce(bb)
  const encodedQuote = MSG.encode(MSG.QUOTE.head, quote.serializeBinary())
  const decodedQuote = Quote.deserializeBinary(MSG.decode(encodedQuote).data)
  t.true(Buffer.from(decodedQuote.getNonce()).toString('hex') === id)

  const agreeement = new Agreement()
  agreeement.setNonce(bb)
  const encodedAgreement = MSG.encode(MSG.AGREEMENT.head, agreeement.serializeBinary())
  const decodedAgreement = Agreement.deserializeBinary(MSG.decode(encodedAgreement).data)
  t.true(Buffer.from(decodedAgreement.getNonce()).toString('hex') === id)

  const reward = new Reward()
  reward.setNonce(bb)
  const encodedReward = MSG.encode(MSG.REWARD.head, reward.serializeBinary())
  const decodedReward = Reward.deserializeBinary(MSG.decode(encodedReward).data)
  t.true(Buffer.from(decodedReward.getNonce()).toString('hex') === id)

  const receipt = new Receipt()
  receipt.setNonce(bb)
  const encodedReceipt = MSG.encode(MSG.RECEIPT.head, receipt.serializeBinary())
  const decodedReceipt = Receipt.deserializeBinary(MSG.decode(encodedReceipt).data)
  t.true(Buffer.from(decodedReceipt.getNonce()).toString('hex') === id)
})

test('duplex.send.validData', (t) => {
  const id = 'abcd'
  const bb = Buffer.from(id, 'hex')
  const opts = {}
  const peer = {}
  const duplex = sinon.createStubInstance(Duplex)

  const connection = new DuplexConnection(peer, duplex, opts)

  const sow = new SOW()
  sow.setNonce(bb)
  connection.sendSow(sow)
  const decodedSow = SOW.deserializeBinary(MSG.decode(duplex.write.getCall(0).args[0]).data)
  t.true(Buffer.from(decodedSow.getNonce()).toString('hex') === id)

  const quote = new Quote()
  quote.setNonce(bb)
  connection.sendQuote(quote)
  const decodedQuote = Quote.deserializeBinary(MSG.decode(duplex.write.getCall(1).args[0]).data)
  t.true(Buffer.from(decodedQuote.getNonce()).toString('hex') === id)

  const agreeement = new Agreement()
  agreeement.setNonce(bb)
  connection.sendAgreement(agreeement)
  const decodedAgreement = Agreement.deserializeBinary(MSG.decode(duplex.write.getCall(2).args[0]).data)
  t.true(Buffer.from(decodedAgreement.getNonce()).toString('hex') === id)

  const reward = new Reward()
  reward.setNonce(bb)
  connection.sendReward(reward)
  const decodedReward = Reward.deserializeBinary(MSG.decode(duplex.write.getCall(3).args[0]).data)
  t.true(Buffer.from(decodedReward.getNonce()).toString('hex') === id)

  const receipt = new Receipt()
  receipt.setNonce(bb)
  connection.sendReceipt(receipt)
  const decodedReceipt = Receipt.deserializeBinary(MSG.decode(duplex.write.getCall(4).args[0]).data)
  t.true(Buffer.from(decodedReceipt.getNonce()).toString('hex') === id)
})

test('duplex.onData.validData', async (t) => {
  const id = 'abcd'
  const bb = Buffer.from(id, 'hex')

  const opts = {}
  const peer = {}
  const duplex = sinon.createStubInstance(Duplex)

  const connection = new DuplexConnection(peer, duplex, opts)

  const emitFake = sinon.fake()
  sinon.stub(connection, 'emit').callsFake(emitFake)

  const sow = new SOW()
  sow.setNonce(bb)
  const encodedSow = MSG.encode(MSG.SOW.head, sow.serializeBinary())
  await connection.onData(encodedSow)
  t.true('sow' === emitFake.getCall(0).args[0] && id === Buffer.from(emitFake.getCall(0).args[1].getNonce()).toString('hex'))

  const quote = new Quote()
  quote.setNonce(bb)
  const encodedQuote = MSG.encode(MSG.QUOTE.head, quote.serializeBinary())
  await connection.onData(encodedQuote)
  t.true('quote' === emitFake.getCall(1).args[0] && id === Buffer.from(emitFake.getCall(1).args[1].getNonce()).toString('hex'))

  const agreeement = new Agreement()
  agreeement.setNonce(bb)
  const encodedAgreement = MSG.encode(MSG.AGREEMENT.head, agreeement.serializeBinary())
  await connection.onData(encodedAgreement)
  t.true('agreement' === emitFake.getCall(2).args[0] && id === Buffer.from(emitFake.getCall(2).args[1].getNonce()).toString('hex'))

  const reward = new Reward()
  reward.setNonce(bb)
  const encodedReward = MSG.encode(MSG.REWARD.head, reward.serializeBinary())
  await connection.onData(encodedReward)
  t.true('reward' === emitFake.getCall(3).args[0] && id === Buffer.from(emitFake.getCall(3).args[1].getNonce()).toString('hex'))

  const receipt = new Receipt()
  receipt.setNonce(bb)
  const encodedReceipt = MSG.encode(MSG.RECEIPT.head, receipt.serializeBinary())
  await connection.onData(encodedReceipt)
  t.true('receipt' === emitFake.getCall(4).args[0] && id === Buffer.from(emitFake.getCall(4).args[1].getNonce()).toString('hex'))
})

test('duplex.onData.invalidData', (t) => {
  const opts = {}
  const peer = {}
  const duplex = sinon.createStubInstance(Duplex)

  const connection = new DuplexConnection(peer, duplex, opts)
  const invalidData = Buffer.from('InvalidData', 'ascii')

  t.false(connection.onData(invalidData))
})

test('duplex.constructor', (t) => {
  const opts = {}
  const peer = {}
  const duplex = sinon.createStubInstance(Duplex)

  const correctContructorA = new DuplexConnection(peer, duplex, opts)
  const correctContructorB = new DuplexConnection(peer, duplex, null)
  t.true(Boolean(correctContructorA))
  t.true(Boolean(correctContructorB))

  /* eslint-disable-next-line no-new */
  t.throws(() => { new DuplexConnection(null, duplex, opts) }, TypeError)
  /* eslint-disable-next-line no-new */
  t.throws(() => { new DuplexConnection(peer, null, opts) }, TypeError)
})

test('duplex.emit.withStream', async (t) => {
  const opts = {}
  const peer = {}
  const duplex = sinon.createStubInstance(Duplex)

  const connection = new DuplexConnection(peer, duplex, opts)
  await connection.onTimeout()
  await connection.onClose()
  await connection.onEnd()
  await connection.onError()
  await connection.close()

  t.true(5 === duplex.destroy.callCount)
})

test('duplex.emit.withoutStream', async (t) => {
  const opts = {}
  const peer = {}
  const duplex = sinon.createStubInstance(Duplex)

  const connection = new DuplexConnection(peer, duplex, opts)
  connection.stream = null

  await connection.onTimeout()
  await connection.onClose()
  await connection.onEnd()
  await connection.close()

  t.true(duplex.destroy.notCalled)
})
