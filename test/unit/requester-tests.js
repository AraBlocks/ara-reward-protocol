const test = require('ava')
const sinon = require('sinon')
const messages = require('../../src/proto/messages_pb')
const { Requester } = require('../../src/requester')
const { Matcher } = require('../../src/matcher')

test('requester.onQuote.ValidPeer', async (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new Matcher()
  const quoteMatchFake = sinon.fake()
  sinon.stub(stubMatcher, 'validateQuote').callsFake(quoteMatchFake)

  const requester = new Requester(sow, stubMatcher)
  sinon.stub(requester, 'validatePeer').resolves(true)

  await requester.onQuote(null, quote, null)

  t.true(quoteMatchFake.calledOnce)
})

test('requester.onQuote.InvalidPeer', async (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new Matcher()
  const quoteMatchFake = sinon.fake()
  sinon.stub(stubMatcher, 'validateQuote').callsFake(quoteMatchFake)

  const requester = new Requester(sow, stubMatcher)
  sinon.stub(requester, 'validatePeer').resolves(false)

  await requester.onQuote(null, quote, null)

  t.true(quoteMatchFake.notCalled)
})

test('requester.onAgreement.ValidAgreement', async (t) => {
  const sow = new messages.SOW()
  const agreement = new messages.Agreement()

  const stubMatcher = new Matcher()

  const requester = new Requester(sow, stubMatcher)
  const agreementConfirmFake = sinon.fake()
  sinon.stub(requester, 'validateAgreement').resolves(true)
  sinon.stub(requester, 'onHireConfirmed').callsFake(agreementConfirmFake)

  await requester.onAgreement(null, agreement)

  t.true(agreementConfirmFake.calledOnce)
})

test('requester.onAgreement.InvalidAgreement', async (t) => {
  const sow = new messages.SOW()
  const agreement = new messages.Agreement()

  const stubMatcher = new Matcher()
  const invalidQuoteFake = sinon.fake()
  sinon.stub(stubMatcher, 'invalidateQuote').callsFake(invalidQuoteFake)

  const requester = new Requester(sow, stubMatcher)
  const agreementConfirmFake = sinon.fake()
  sinon.stub(requester, 'validateAgreement').resolves(false)
  sinon.stub(requester, 'onHireConfirmed').callsFake(agreementConfirmFake)

  await requester.onAgreement(null, agreement)

  t.true(agreementConfirmFake.notCalled)
  t.true(invalidQuoteFake.calledOnce)
})

test('requester.hireFarmer', async (t) => {
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

  await requester.hireFarmer(quote, stubRFP)

  t.true(genAgreementFake.calledOnce)
  t.true(sendAgreementFake.calledOnce)
})

test('requester.processFarmers', async (t) => {
  const sow = new messages.SOW()
  const stubMatcher = new Matcher()
  const requester = new Requester(sow, stubMatcher)

  const sendSowFake = sinon.fake()
  const stubRFP = {
    sendSow: sendSowFake
  }

  await requester.processFarmers([ stubRFP ])

  t.true(sendSowFake.calledOnce)
})

test('requester.processFarmer', async (t) => {
  const sow = new messages.SOW()
  const stubMatcher = new Matcher()
  const requester = new Requester(sow, stubMatcher)

  const sendSowFake = sinon.fake()
  const stubRFP = {
    sendSow: sendSowFake
  }

  await requester.processFarmer(stubRFP)

  t.true(sendSowFake.calledOnce)
})
