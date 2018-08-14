const { StreamProtocol } = require('../../src/duplex/stream-protocol')
const messages = require('../../src/proto/messages_pb')
const sinon = require('sinon')
const test = require('ava')

test('duplex.onSow.ValidPeer', async (t) => {
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