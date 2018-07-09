const test = require('ava')
const sinon = require('sinon')
const messages = require('../../src/proto/messages_pb')
const { Requester } = require('../../src/requester')
const { Matcher } = require('../../src/matcher')

test('requester.handleQuoteResponse.ValidPeer', (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new Matcher()
  const quoteMatchFake = sinon.fake()
  sinon.stub(stubMatcher, 'validateQuote').callsFake(quoteMatchFake)

  const requester = new Requester(sow, stubMatcher)
  sinon.stub(requester, 'validatePeer').returns(true)

  requester.handleQuoteResponse(null, quote, null)

  t.true(quoteMatchFake.calledOnce)
})

test('requester.handleQuoteResponse.InvalidPeer', (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new Matcher()
  const quoteMatchFake = sinon.fake()
  sinon.stub(stubMatcher, 'validateQuote').callsFake(quoteMatchFake)

  const requester = new Requester(sow, stubMatcher)
  sinon.stub(requester, 'validatePeer').returns(false)

  requester.handleQuoteResponse(null, quote, null)

  t.true(quoteMatchFake.notCalled)
})

test('requester.handleSignedAgreement.ValidAgreement', (t) => {
  const sow = new messages.SOW()
  const agreement = new messages.Agreement()

  const stubMatcher = new Matcher()

  const requester = new Requester(sow, stubMatcher)
  const agreementConfirmFake = sinon.fake()
  sinon.stub(requester, 'validateAgreement').returns(true)
  sinon.stub(requester, 'onHireConfirmed').callsFake(agreementConfirmFake)

  requester.handleSignedAgreement(null, agreement)

  t.true(agreementConfirmFake.calledOnce)
})

test('requester.handleSignedAgreement.InvalidAgreement', (t) => {
  const sow = new messages.SOW()
  const agreement = new messages.Agreement()

  const stubMatcher = new Matcher()
  const invalidQuoteFake = sinon.fake()
  sinon.stub(stubMatcher, 'invalidateQuote').callsFake(invalidQuoteFake)

  const requester = new Requester(sow, stubMatcher)
  const agreementConfirmFake = sinon.fake()
  sinon.stub(requester, 'validateAgreement').returns(false)
  sinon.stub(requester, 'onHireConfirmed').callsFake(agreementConfirmFake)

  requester.handleSignedAgreement(null, agreement)

  t.true(agreementConfirmFake.notCalled)
  t.true(invalidQuoteFake.calledOnce)
})

test('requester.hireFarmer', (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()
  const stubMatcher = new Matcher()
  const requester = new Requester(sow, stubMatcher)

  const genAgreementFake = sinon.fake()
  sinon.stub(requester, 'generateAgreement').callsFake(genAgreementFake)

  const sendAgreementFake = sinon.fake()

  const stubRFP = {
    sendAgreement: sendAgreementFake
  }

  requester.hireFarmer(quote, stubRFP)

  t.true(genAgreementFake.calledOnce)
  t.true(sendAgreementFake.calledOnce)
})

test('requester.processFarmers', (t) => {
  const sow = new messages.SOW()
  const stubMatcher = new Matcher()
  const requester = new Requester(sow, stubMatcher)

  const getQuoteFake = sinon.fake()
  const stubRFP = {
    getQuote: getQuoteFake
  }

  requester.processFarmers([ stubRFP ])
  t.true(getQuoteFake.calledOnce)
})
