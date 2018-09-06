const { PeerConnection } = require('../../src/peer-connection')
const { RequesterBase } = require('../../src/requester')
const { MatcherBase } = require('../../src/matcher')
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

test('requester.onQuote.ValidQuote', async (t) => {
  const sow = new SOW()
  const quote = new Quote()

  const matcher = new MatcherBase()
  const matchFake = sinon.fake()
  sinon.stub(matcher, 'addQuote').callsFake(matchFake)

  const requester = new RequesterBase(sow, matcher)
  sinon.stub(requester, 'validateQuote').resolves(true)

  const connection = new PeerConnection()

  await requester.onQuote(quote, connection)

  t.true(matchFake.calledOnce)

  const hireFake = sinon.fake()
  sinon.stub(requester, 'hireFarmer').callsFake(hireFake)

  await matchFake.getCall(0).args[1]()
  t.true(hireFake.calledOnce)

})

test('requester.onQuote.InvalidQuote', async (t) => {
  const sow = new SOW()
  const quote = new Quote()

  const matcher = new MatcherBase()
  const matchFake = sinon.fake()
  sinon.stub(matcher, 'addQuote').callsFake(matchFake)

  const requester = new RequesterBase(sow, matcher)
  sinon.stub(requester, 'validateQuote').resolves(false)

  const connection = new PeerConnection()

  await requester.onQuote(quote, connection)

  t.true(matchFake.notCalled)
})

test('requester.onAgreement.ValidAgreement', async (t) => {
  const sow = new SOW()
  const agreement = new Agreement()

  const matcher = new MatcherBase()

  const requester = new RequesterBase(sow, matcher)
  const agreementConfirmFake = sinon.fake()
  sinon.stub(requester, 'validateAgreement').resolves(true)
  sinon.stub(requester, 'onHireConfirmed').callsFake(agreementConfirmFake)

  const connection = new PeerConnection()

  await requester.onAgreement(agreement, connection)

  t.true(agreementConfirmFake.calledOnce)
})

test('requester.onAgreement.InvalidAgreement', async (t) => {
  const sow = new SOW()
  const agreement = new Agreement()

  const matcher = new MatcherBase()
  const invalidQuoteFake = sinon.fake()
  sinon.stub(matcher, 'removeQuote').callsFake(invalidQuoteFake)

  const requester = new RequesterBase(sow, matcher)
  const agreementConfirmFake = sinon.fake()
  sinon.stub(requester, 'validateAgreement').resolves(false)
  sinon.stub(requester, 'onHireConfirmed').callsFake(agreementConfirmFake)

  const connection = new PeerConnection()

  await requester.onAgreement(agreement, connection)

  t.true(agreementConfirmFake.notCalled)
  t.true(invalidQuoteFake.calledOnce)
})

test('requester.hireFarmer', async (t) => {
  const sow = new SOW()
  const quote = new Quote()
  const matcher = new MatcherBase()
  const requester = new RequesterBase(sow, matcher)

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
  const sow = new SOW()
  const matcher = new MatcherBase()
  const requester = new RequesterBase(sow, matcher)
  const connection = new PeerConnection()

  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendSow').callsFake(sendFake)

  await requester.addFarmers([ connection ])

  t.true(sendFake.calledOnce)
})

test('requester.addFarmer', async (t) => {
  const sow = new SOW()
  const matcher = new MatcherBase()
  const requester = new RequesterBase(sow, matcher)
  const connection = new PeerConnection()

  const sendFake = sinon.fake()
  sinon.stub(connection, 'sendSow').callsFake(sendFake)

  const onQuoteFake = sinon.fake()
  sinon.stub(requester, 'onQuote').callsFake(onQuoteFake)

  const onAgreementFake = sinon.fake()
  sinon.stub(requester, 'onAgreement').callsFake(onAgreementFake)

  const onReceiptFake = sinon.fake()
  sinon.stub(requester, 'onReceipt').callsFake(onReceiptFake)

  await requester.addFarmer(connection)

  t.true(sendFake.calledOnce)

  const quote = new Quote()
  await connection.onQuote(quote)
  t.true(quote === onQuoteFake.getCall(0).args[0] && connection === onQuoteFake.getCall(0).args[1])

  const agreement = new Agreement()
  await connection.onAgreement(agreement)
  t.true(agreement === onAgreementFake.getCall(0).args[0] && connection === onAgreementFake.getCall(0).args[1])

  const receipt = new Receipt()
  await connection.onReceipt(receipt)
  t.true(receipt === onReceiptFake.getCall(0).args[0] && connection === onReceiptFake.getCall(0).args[1])
})

test('requester.noOverride', async (t) => {
  const sow = new SOW()
  const matcher = new MatcherBase()
  const requester = new RequesterBase(sow, matcher)
  const connection = new PeerConnection()

  const quote = new Quote()
  await t.throws(requester.validateQuote(quote), Error)
  await t.throws(requester.generateAgreement(quote), Error)

  const agreement = new Agreement()
  await t.throws(requester.validateAgreement(agreement), Error)
  await t.throws(requester.onHireConfirmed(agreement, connection), Error)

  const receipt = new Receipt()
  await t.throws(requester.onReceipt(receipt, connection), Error)
})
