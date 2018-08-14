const { FarmerBase } = require('../../src/farmer')
const messages = require('../../src/proto/messages_pb')
const sinon = require('sinon')
const test = require('ava')

test('farmer.onSow.ValidPeer', async (t) => {
  const quoteId = '1234'
  const sow = new messages.SOW()

  const quote = new messages.Quote()
  quote.setNonce(quoteId)

  const farmer = new FarmerBase()
  sinon.stub(farmer, 'generateQuote').resolves(quote)
  sinon.stub(farmer, 'validatePeer').resolves(true)

  const stubCall = {
    request: sow
  }

  farmer.onSow(stubCall, (error, response) => {
    t.true(null === error)
    t.true(quote === response)
    t.true(quoteId === response.getNonce())
  })
})

test('farmer.onSow.InvalidPeer', async (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const farmer = new FarmerBase()
  sinon.stub(farmer, 'generateQuote').resolves(quote)
  sinon.stub(farmer, 'validatePeer').resolves(false)

  const stubCall = {
    request: sow
  }

  farmer.onSow(stubCall, (error, response) => {
    t.true(null != error)
    t.true(null === response)
  })
})

test('farmer.onAgreement.ValidAgreement', async (t) => {
  const agreementId = '1234'

  const agreement = new messages.Agreement()
  agreement.setNonce(agreementId)

  const farmer = new FarmerBase()
  sinon.stub(farmer, 'validateAgreement').resolves(true)
  sinon.stub(farmer, 'signAgreement').resolves(agreement)

  const stubCall = {
    request: agreement
  }

  farmer.onAgreement(stubCall, (error, response) => {
    t.true(null === error)
    t.true(agreement === response)
    t.true(agreementId === response.getNonce())
  })
})

test('farmer.onAgreement.InvalidAgreement', async (t) => {
  const agreement = new messages.Agreement()

  const farmer = new FarmerBase()
  const signAgreementFake = sinon.fake()
  sinon.stub(farmer, 'validateAgreement').resolves(false)
  sinon.stub(farmer, 'signAgreement').callsFake(signAgreementFake)

  const stubCall = {
    request: agreement
  }

  farmer.onAgreement(stubCall, (error, response) => {
    t.true(null != error)
    t.true(null === response)
    t.true(signAgreementFake.notCalled)
  })
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

  const stubCall = {
    request: reward
  }

  farmer.onReward(stubCall, (error, response) => {
    t.true(null === error)
    t.true(receipt === response)
    t.true(rewardId === response.getReward().getNonce())
  })
})

test('farmer.onReward.InvalidReward', async (t) => {
  const reward = new messages.Reward()

  const farmer = new FarmerBase()
  const generateReceiptFake = sinon.fake()
  sinon.stub(farmer, 'validateReward').resolves(false)
  sinon.stub(farmer, 'generateReceipt').callsFake(generateReceiptFake)

  const stubCall = {
    request: reward
  }

  farmer.onReward(stubCall, (error, response) => {
    t.true(null != error)
    t.true(null === response)
    t.true(generateReceiptFake.notCalled)
  })
})