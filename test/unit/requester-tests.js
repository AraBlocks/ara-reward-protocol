const test = require('ava')
const sinon = require('sinon')
const messages = require('../../lib/proto/messages_pb')
const services = require('../../lib/proto/route-guide_grpc_pb')
const { Requester } = require('../../lib/requester')
const { PeerAuthenticator } = require('../../lib/peer-authenticator')
const { ContractGenerator } = require('../../lib/contract-generator')
const { Matcher } = require('../../lib/matcher')

test('requester.handleQuoteResponse.ValidPeer', (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new Matcher()
  const quoteMatchFake = sinon.fake()
  sinon.stub(stubMatcher, 'considerQuoteOption').callsFake(quoteMatchFake)

  const stubContract = new ContractGenerator()

  const stubAuth = new PeerAuthenticator()
  sinon.stub(stubAuth, 'validatePeer').returns(true)

  const requester = new Requester(sow, stubMatcher, stubAuth, stubContract)
  requester.handleQuoteResponse(null, quote, null)

  t.true(quoteMatchFake.calledOnce)
})

test('requester.handleQuoteResponse.InvalidPeer', (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new Matcher()
  const quoteMatchFake = sinon.fake()
  sinon.stub(stubMatcher, 'considerQuoteOption').callsFake(quoteMatchFake)

  const stubContract = new ContractGenerator()

  const stubAuth = new PeerAuthenticator()
  sinon.stub(stubAuth, 'validatePeer').returns(false)

  const requester = new Requester(sow, stubMatcher, stubAuth, stubContract)
  requester.handleQuoteResponse(null, quote, null)

  t.true(quoteMatchFake.notCalled)
})

test('requester.handleSignedContract.ValidContract', (t) => {
  const sow = new messages.SOW()
  const contract = new messages.Contract()

  const stubMatcher = new Matcher()
  const contractConfirmFake = sinon.fake()
  sinon.stub(stubMatcher, 'onHireConfirmed').callsFake(contractConfirmFake)

  const stubContract = new ContractGenerator()
  sinon.stub(stubContract, 'validateContract').returns(true)

  const stubAuth = new PeerAuthenticator()

  const requester = new Requester(sow, stubMatcher, stubAuth, stubContract)
  requester.handleSignedContract(null, contract)

  t.true(contractConfirmFake.calledOnce)
})

test('requester.handleSignedContract.InvalidContract', (t) => {
  const sow = new messages.SOW()
  const contract = new messages.Contract()

  const stubMatcher = new Matcher()
  const contractConfirmFake = sinon.fake()
  sinon.stub(stubMatcher, 'onHireConfirmed').callsFake(contractConfirmFake)
  const invalidQuoteFake = sinon.fake()
  sinon.stub(stubMatcher, 'invalidateQuoteOption').callsFake(invalidQuoteFake)

  const stubContract = new ContractGenerator()
  sinon.stub(stubContract, 'validateContract').returns(false)

  const stubAuth = new PeerAuthenticator()

  const requester = new Requester(sow, stubMatcher, stubAuth, stubContract)
  requester.handleSignedContract(null, contract)

  t.true(contractConfirmFake.notCalled)
  t.true(invalidQuoteFake.calledOnce)
})
