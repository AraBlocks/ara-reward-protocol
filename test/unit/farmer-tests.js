const test = require('ava')
const sinon = require('sinon')
const messages = require('../../lib/proto/messages_pb')
const { Farmer } = require('../../lib/farmer')
const { Authenticator } = require('../../lib/authenticator')
const { QuoteGenerator } = require('../../lib/quote-generator')

test('farmer.getQuote.ValidPeer', (t) => {
  const quoteId = 1234
  const sow = new messages.SOW()

  const quote = new messages.Quote()
  quote.setId(quoteId)

  const stubQuoteGen = new QuoteGenerator()
  sinon.stub(stubQuoteGen, 'generateQuote').returns(quote)

  const stubAuth = new Authenticator()
  sinon.stub(stubAuth, 'validatePeer').returns(true)

  const stubCall = {
    request: sow
  }

  const farmer = new Farmer(1, stubQuoteGen, stubAuth)
  farmer.getQuote(stubCall, (error, response) => {
    t.true(null === error)
    t.true(quote === response)
    t.true(quoteId === response.getId())
  })
})

test('farmer.getQuote.InvalidPeer', (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const stubQuoteGen = new QuoteGenerator()
  sinon.stub(stubQuoteGen, 'generateQuote').returns(quote)

  const stubAuth = new Authenticator()
  sinon.stub(stubAuth, 'validatePeer').returns(false)

  const stubCall = {
    request: sow
  }

  const farmer = new Farmer(1, stubQuoteGen, stubAuth)
  farmer.getQuote(stubCall, (error, response) => {
    t.true(null != error)
    t.true(null === response)
  })
})

test('farmer.awardContract.ValidContract', (t) => {
  const contractId = 1234

  const contract = new messages.Contract()
  contract.setId(contractId)

  const stubQuoteGen = new QuoteGenerator()

  const stubAuth = new Authenticator()
  sinon.stub(stubAuth, 'validateContract').returns(true)

  const stubCall = {
    request: contract
  }

  const farmer = new Farmer(1, stubQuoteGen, stubAuth)
  farmer.awardContract(stubCall, (error, response) => {
    t.true(null === error)
    t.true(contract === response)
    t.true(contractId === response.getId())
  })
})

test('farmer.awardContract.InvalidContract', (t) => {
  const contract = new messages.Contract()

  const stubQuoteGen = new QuoteGenerator()

  const stubAuth = new Authenticator()
  sinon.stub(stubAuth, 'validateContract').returns(false)

  const stubCall = {
    request: contract
  }

  const farmer = new Farmer(1, stubQuoteGen, stubAuth)
  farmer.awardContract(stubCall, (error, response) => {
    t.true(null != error)
    t.true(null === response)
  })
})
