const test = require('ava')
const sinon = require('sinon')
const messages = require('../../lib/proto/messages_pb')
const services = require('../../lib/proto/route-guide_grpc_pb')
const { Requester } = require('../../lib/requester')
const { Authenticator } = require('../../lib/authenticator')
const { Matcher } = require('../../lib/matcher')

test('requester.handleQuoteResponse.ValidPeer', (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new Matcher()
  const quoteMatchFake = sinon.fake()
  sinon.stub(stubMatcher, 'considerQuoteOption').callsFake(quoteMatchFake)

  const stubAuth = new Authenticator()
  sinon.stub(stubAuth, 'validatePeer').returns(true)

  const requester = new Requester(sow, stubMatcher, stubAuth)
  requester.handleQuoteResponse(null, quote, null)

  t.true(quoteMatchFake.calledOnce)
})

test('requester.handleQuoteResponse.InvalidPeer', (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubMatcher = new Matcher()
  const quoteMatchFake = sinon.fake()
  sinon.stub(stubMatcher, 'considerQuoteOption').callsFake(quoteMatchFake)

  const stubAuth = new Authenticator()
  sinon.stub(stubAuth, 'validatePeer').returns(false)

  const requester = new Requester(sow, stubMatcher, stubAuth)
  requester.handleQuoteResponse(null, quote, null)

  t.true(quoteMatchFake.notCalled)
})
