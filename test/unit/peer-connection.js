const { PeerConnection } = require('../../src/peer-connection')
const { messages } = require('farming-protocol-buffers')
const sinon = require('sinon')
const test = require('ava')

const {
  Agreement,
  Receipt,
  Reward,
  Quote,
  SOW
} = messages

test('peer-connection.send.noOverride', async (t) => {
  const connection = new PeerConnection()

  const sow = new SOW()
  await t.throws(connection.sendSow(sow), Error)

  const quote = new Quote()
  await t.throws(connection.sendQuote(quote), Error)

  const agreement = new Agreement()
  await t.throws(connection.sendAgreement(agreement), Error)

  const reward = new Reward()
  await t.throws(connection.sendReward(reward), Error)

  const receipt = new Receipt()
  await t.throws(connection.sendReceipt(receipt), Error)
})

test('peer-connection.on.validData', async (t) => {
  const connection = new PeerConnection()
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
