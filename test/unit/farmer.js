const { PeerConnection } = require('../../src/peer-connection')
const { FarmerBase } = require('../../src/farmer')
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

test('farmer.onSow.ValidSow', async (t) => {
  const quoteId = '1234'
  const sow = new SOW()

  const quote = new Quote()
  quote.setNonce(quoteId)

  const farmer = new FarmerBase()
  sinon.stub(farmer, 'generateQuote').resolves(quote)
  sinon.stub(farmer, 'validateSow').resolves(true)

  const connection = new PeerConnection()
  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendQuote').callsFake(sendFake)

  await farmer.onSow(sow, connection)
  t.true(sendFake.calledOnce)
})

test('farmer.onSow.InvalidSow', async (t) => {
  const sow = new SOW()
  const quote = new Quote()

  const farmer = new FarmerBase()
  sinon.stub(farmer, 'generateQuote').resolves(quote)
  sinon.stub(farmer, 'validateSow').resolves(false)

  const connection = new PeerConnection()
  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendQuote').callsFake(sendFake)

  await farmer.onSow(sow, connection)
  t.true(sendFake.notCalled)
})

test('farmer.onAgreement.ValidAgreement', async (t) => {
  const agreementId = '1234'

  const agreement = new Agreement()
  agreement.setNonce(agreementId)

  const farmer = new FarmerBase()
  const hireConfirmFake = sinon.fake()
  sinon.stub(farmer, 'validateAgreement').resolves(true)
  sinon.stub(farmer, 'signAgreement').resolves(agreement)
  sinon.stub(farmer, 'onHireConfirmed').callsFake(hireConfirmFake)

  const connection = new PeerConnection()
  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendAgreement').callsFake(sendFake)

  await farmer.onAgreement(agreement, connection)
  t.true(sendFake.calledOnce)
  t.true(hireConfirmFake.calledOnce)
})

test('farmer.onAgreement.InvalidAgreement', async (t) => {
  const agreement = new Agreement()

  const farmer = new FarmerBase()
  const signAgreementFake = sinon.fake()
  sinon.stub(farmer, 'validateAgreement').resolves(false)
  sinon.stub(farmer, 'signAgreement').callsFake(signAgreementFake)

  const connection = new PeerConnection()
  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendAgreement').callsFake(sendFake)

  await farmer.onAgreement(agreement, connection)
  t.true(sendFake.notCalled)
})

test('farmer.onReward.ValidReward', async (t) => {
  const rewardId = '1234'

  const reward = new Reward()
  reward.setNonce(rewardId)
  const receipt = new Receipt()
  receipt.setReward(reward)

  const farmer = new FarmerBase()
  sinon.stub(farmer, 'validateReward').resolves(true)
  sinon.stub(farmer, 'generateReceipt').resolves(receipt)

  const connection = new PeerConnection()
  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendReceipt').callsFake(sendFake)

  await farmer.onReward(reward, connection)
  t.true(sendFake.calledOnce)
})

test('farmer.onReward.InvalidReward', async (t) => {
  const reward = new Reward()

  const farmer = new FarmerBase()
  const generateReceiptFake = sinon.fake()
  sinon.stub(farmer, 'validateReward').resolves(false)
  sinon.stub(farmer, 'generateReceipt').callsFake(generateReceiptFake)

  const connection = new PeerConnection()
  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendReceipt').callsFake(sendFake)

  await farmer.onReward(reward, connection)
  t.true(sendFake.notCalled)
})

test('farmer.addRequester', async (t) => {
  const farmer = new FarmerBase()
  const connection = new PeerConnection()

  const onSowFake = sinon.fake()
  sinon.stub(farmer, 'onSow').callsFake(onSowFake)

  const onAgreementFake = sinon.fake()
  sinon.stub(farmer, 'onAgreement').callsFake(onAgreementFake)

  const onRewardFake = sinon.fake()
  sinon.stub(farmer, 'onReward').callsFake(onRewardFake)

  await farmer.addRequester(connection)

  const sow = new SOW()
  await connection.onSow(sow)
  t.true(sow === onSowFake.getCall(0).args[0] && connection === onSowFake.getCall(0).args[1])

  const agreement = new Agreement()
  await connection.onAgreement(agreement)
  t.true(agreement === onAgreementFake.getCall(0).args[0] && connection === onAgreementFake.getCall(0).args[1])

  const reward = new Reward()
  await connection.onReward(reward)
  t.true(reward === onRewardFake.getCall(0).args[0] && connection === onRewardFake.getCall(0).args[1])
})

test('farmer.noOverride', async (t) => {
  const farmer = new FarmerBase()

  const sow = new SOW()
  await t.throws(farmer.validateSow(sow), Error)
  await t.throws(farmer.generateQuote(sow), Error)

  const agreement = new Agreement()
  await t.throws(farmer.validateAgreement(agreement), Error)
  await t.throws(farmer.signAgreement(agreement), Error)

  const reward = new Reward()
  await t.throws(farmer.validateReward(reward), Error)
  await t.throws(farmer.generateReceipt(reward), Error)

  await t.throws(farmer.onHireConfirmed(), Error)
})
