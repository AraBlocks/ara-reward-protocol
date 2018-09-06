const { MSG, DuplexConnection } = require('../../src/duplex/duplex-connection')
const { messages } = require('farming-protocol-buffers')
const { Duplex } = require('stream');
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

test('duplex.on.validData', async (t) => {
  const opts = {}
  const peer = {}
  const duplex = sinon.createStubInstance(Duplex)

  const connection = new DuplexConnection(peer, duplex, opts)

  const emitFake = sinon.fake()
  sinon.stub(connection, 'emit').callsFake(emitFake)

  const sow = new SOW()
  await connection.onSow(sow)
  t.true('sow' === emitFake.getCall(0).args[0] && sow === emitFake.getCall(0).args[1])

  const quote = new Quote()
  await connection.onQuote(quote)
  t.true('quote' === emitFake.getCall(1).args[0] && quote === emitFake.getCall(1).args[1])

  const agreement = new Agreement()
  await connection.onAgreement(agreement)
  t.true('agreement' === emitFake.getCall(2).args[0] && agreement === emitFake.getCall(2).args[1])

  const reward = new Reward()
  await connection.onReward(reward)
  t.true('reward' === emitFake.getCall(3).args[0] && reward === emitFake.getCall(3).args[1])

  const receipt = new Receipt()
  await connection.onReceipt(receipt)
  t.true('receipt' === emitFake.getCall(4).args[0] && receipt === emitFake.getCall(4).args[1])
})
