const test = require('ava')
const sinon = require('sinon')
const messages = require('../../src/proto/messages_pb')
const { Farmer } = require('../../src/farmer')

test('farmer.handleQuoteRequest.ValidPeer', (t) => {
  const quoteId = 1234
  const sow = new messages.SOW()

  const quote = new messages.Quote()
  quote.setId(quoteId)

  const farmer = new Farmer()
  sinon.stub(farmer, 'generateQuote').returns(quote)
  sinon.stub(farmer, 'validatePeer').returns(true)

  const stubCall = {
    request: sow
  }

  farmer.handleQuoteRequest(stubCall, (error, response) => {
    t.true(null === error)
    t.true(quote === response)
    t.true(quoteId === response.getId())
  })
})

test('farmer.handleQuoteRequest.InvalidPeer', (t) => {
  const sow = new messages.SOW()
  const quote = new messages.Quote()

  const farmer = new Farmer()
  sinon.stub(farmer, 'generateQuote').returns(quote)
  sinon.stub(farmer, 'validatePeer').returns(false)

  const stubCall = {
    request: sow
  }

  farmer.handleQuoteRequest(stubCall, (error, response) => {
    t.true(null != error)
    t.true(null === response)
  })
})

test('farmer.handleContractAward.ValidContract', (t) => {
  const contractId = 1234

  const contract = new messages.Contract()
  contract.setId(contractId)

  const farmer = new Farmer()
  sinon.stub(farmer, 'validateContract').returns(true)
  sinon.stub(farmer, 'signContract').returns(contract)

  const stubCall = {
    request: contract
  }

  farmer.handleContractAward(stubCall, (error, response) => {
    t.true(null === error)
    t.true(contract === response)
    t.true(contractId === response.getId())
  })
})

test('farmer.handleContractAward.InvalidContract', (t) => {
  const contract = new messages.Contract()

  const farmer = new Farmer()
  const signContractFake = sinon.fake()
  sinon.stub(farmer, 'validateContract').returns(false)
  sinon.stub(farmer, 'signContract').callsFake(signContractFake)

  const stubCall = {
    request: contract
  }

  farmer.handleContractAward(stubCall, (error, response) => {
    t.true(null != error)
    t.true(null === response)
    t.true(signContractFake.notCalled)
  })
})
