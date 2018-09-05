const { PeerConnection } = require('../../src/peer-connection')
const { RequesterBase } = require('../../src/requester')
const { MatcherBase } = require('../../src/matcher')
const { messages } = require('farming-protocol-buffers')
const sinon = require('sinon')
const test = require('ava')

test('requester.onQuote.ValidQuote', async (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new MatcherBase()
  const matchFake = sinon.fake()
  sinon.stub(stubMatcher, 'addQuote').callsFake(matchFake)

  const requester = new RequesterBase(sow, stubMatcher)
  sinon.stub(requester, 'validateQuote').resolves(true)

  const connection = new PeerConnection()

  await requester.onQuote(quote, connection)

  t.true(matchFake.calledOnce)
})

test('requester.onQuote.InvalidQuote', async (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new MatcherBase()
  const matchFake = sinon.fake()
  sinon.stub(stubMatcher, 'addQuote').callsFake(matchFake)

  const requester = new RequesterBase(sow, stubMatcher)
  sinon.stub(requester, 'validateQuote').resolves(false)

  const connection = new PeerConnection()

  await requester.onQuote(quote, connection)

  t.true(matchFake.notCalled)
})

test('requester.onAgreement.ValidAgreement', async (t) => {
  const sow = new messages.SOW()
  const agreement = new messages.Agreement()

  const stubMatcher = new MatcherBase()

  const requester = new RequesterBase(sow, stubMatcher)
  const agreementConfirmFake = sinon.fake()
  sinon.stub(requester, 'validateAgreement').resolves(true)
  sinon.stub(requester, 'onHireConfirmed').callsFake(agreementConfirmFake)

  const connection = new PeerConnection()

  await requester.onAgreement(agreement, connection)

  t.true(agreementConfirmFake.calledOnce)
})

test('requester.onAgreement.InvalidAgreement', async (t) => {
  const sow = new messages.SOW()
  const agreement = new messages.Agreement()

  const stubMatcher = new MatcherBase()
  const invalidQuoteFake = sinon.fake()
  sinon.stub(stubMatcher, 'removeQuote').callsFake(invalidQuoteFake)

  const requester = new RequesterBase(sow, stubMatcher)
  const agreementConfirmFake = sinon.fake()
  sinon.stub(requester, 'validateAgreement').resolves(false)
  sinon.stub(requester, 'onHireConfirmed').callsFake(agreementConfirmFake)

  const connection = new PeerConnection()

  await requester.onAgreement(agreement, connection)

  t.true(agreementConfirmFake.notCalled)
  t.true(invalidQuoteFake.calledOnce)
})

test('requester.hireFarmer', async (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()
  const stubMatcher = new MatcherBase()
  const requester = new RequesterBase(sow, stubMatcher)

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

test('requester.addFarmers', async (t) => {
  const sow = new messages.SOW()
  const stubMatcher = new MatcherBase()
  const requester = new RequesterBase(sow, stubMatcher)
  const connection = new PeerConnection()

  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendSow').callsFake(sendFake)

  await requester.addFarmers([ connection ])

  t.true(sendFake.calledOnce)
})

test('requester.addFarmer', async (t) => {
  const sow = new messages.SOW()
  const stubMatcher = new MatcherBase()
  const requester = new RequesterBase(sow, stubMatcher)
  const connection = new PeerConnection()

  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendSow').callsFake(sendFake)

  await requester.addFarmer(connection)

  t.true(sendFake.calledOnce)
})
