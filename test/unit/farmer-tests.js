const test = require('ava')
const sinon = require('sinon')
const messages = require('../../src/proto/messages_pb')
const { Farmer } = require('../../src/farmer')

test('farmer.handleQuoteRequest.ValidPeer', async (t) => {
  const quoteId = 1234
  const sow = new messages.SOW()

  const quote = new messages.Quote()
  quote.setId(quoteId)

  const farmer = new Farmer()
  sinon.stub(farmer, 'generateQuote').resolves(quote)
  sinon.stub(farmer, 'validatePeer').resolves(true)

  const stubCall = {
    request: sow
  }

  farmer.handleQuoteRequest(stubCall, (error, response) => {
    t.true(null === error)
    t.true(quote === response)
    t.true(quoteId === response.getId())
  })
})

test('farmer.handleQuoteRequest.InvalidPeer', async (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const farmer = new Farmer()
  sinon.stub(farmer, 'generateQuote').resolves(quote)
  sinon.stub(farmer, 'validatePeer').resolves(false)

  const stubCall = {
    request: sow
  }

  farmer.handleQuoteRequest(stubCall, (error, response) => {
    t.true(null != error)
    t.true(null === response)
  })
})

test('farmer.handleAgreementReceipt.ValidAgreement', async (t) => {
  const agreementId = 1234

  const agreement = new messages.Agreement()
  agreement.setId(agreementId)

  const farmer = new Farmer()
  sinon.stub(farmer, 'validateAgreement').resolves(true)
  sinon.stub(farmer, 'signAgreement').resolves(agreement)

  const stubCall = {
    request: agreement
  }

  farmer.handleAgreementReceipt(stubCall, (error, response) => {
    t.true(null === error)
    t.true(agreement === response)
    t.true(agreementId === response.getId())
  })
})

test('farmer.handleAgreementReceipt.InvalidAgreement', async (t) => {
  const agreement = new messages.Agreement()

  const farmer = new Farmer()
  const signAgreementFake = sinon.fake()
  sinon.stub(farmer, 'validateAgreement').resolves(false)
  sinon.stub(farmer, 'signAgreement').callsFake(signAgreementFake)

  const stubCall = {
    request: agreement
  }

  farmer.handleAgreementReceipt(stubCall, (error, response) => {
    t.true(null != error)
    t.true(null === response)
    t.true(signAgreementFake.notCalled)
  })
})
