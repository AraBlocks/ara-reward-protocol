const { PeerConnection } = require('../../src/peer-connection')
const { FarmerBase } = require('../../src/farmer')
const { messages } = require('farming-protocol-buffers')
const sinon = require('sinon')
const test = require('ava')

test('farmer.onSow.ValidSow', async (t) => {
  const quoteId = '1234'
  const sow = new messages.SOW()

  const quote = new messages.Quote()
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
  const sow = new messages.SOW()
  const quote = new messages.Quote()

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

  const agreement = new messages.Agreement()
  agreement.setNonce(agreementId)

  const farmer = new FarmerBase()
  sinon.stub(farmer, 'validateAgreement').resolves(true)
  sinon.stub(farmer, 'signAgreement').resolves(agreement)

  const connection = new PeerConnection()
  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendAgreement').callsFake(sendFake)

  await farmer.onAgreement(agreement, connection)
  t.true(sendFake.calledOnce)
})

test('farmer.onAgreement.InvalidAgreement', async (t) => {
  const agreement = new messages.Agreement()

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

  const reward = new messages.Reward()
  reward.setNonce(rewardId)
  const receipt = new messages.Receipt()
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
  const reward = new messages.Reward()

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
