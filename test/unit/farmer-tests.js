const test = require('ava')
const sinon = require('sinon')
const messages = require('../../proto/messages_pb')
const { Farmer } = require('../../src/farmer')
const { Authenticator } = require('../../src/authenticator')
const { Quoter } = require('../../src/quoter')

test('farmer.getQuote.ValidPeer', t => {
    const quoteId = 1234
    const sow = new messages.SOW();
    
    const quote = new messages.Quote();
    quote.setId(quoteId)

    const stubQuote = new Quoter()
    sinon.stub(stubQuote, 'generateQuote').returns(quote)

    const stubAuth = new Authenticator()
    sinon.stub(stubAuth, 'validatePeer').returns(true)

    const stubCall = {
        request: sow
    }

    const farmer = new Farmer(1, stubQuote, stubAuth)
    farmer.getQuote(stubCall, (error, response) => {
        t.true(null === error)
        t.true(quote === response)
        t.true(quoteId === response.getId())
    })
})

test('farmer.getQuote.InvalidPeer', t => {
    const sow = new messages.SOW();
    const quote = new messages.Quote();

    const stubQuote = new Quoter()
    sinon.stub(stubQuote, 'generateQuote').returns(quote)

    const stubAuth = new Authenticator()
    sinon.stub(stubAuth, 'validatePeer').returns(false)

    const stubCall = {
        request: sow
    }

    const farmer = new Farmer(1, stubQuote, stubAuth)
    farmer.getQuote(stubCall, (error, response) => {
        t.true(null != error)
        t.true(null === response)
    })
})

test('farmer.awardContract.ValidContract', t => {
    const contractId = 1234
    
    const contract = new messages.Contract();
    contract.setId(contractId)

    const stubQuote = new Quoter()

    const stubAuth = new Authenticator()
    sinon.stub(stubAuth, 'validateContract').returns(true)

    const stubCall = {
        request: contract
    }

    const farmer = new Farmer(1, stubQuote, stubAuth)
    farmer.awardContract(stubCall, (error, response) => {
        t.true(null === error)
        t.true(contract === response)
        t.true(contractId === response.getId())
    })
})

test('farmer.awardContract.InvalidContract', t => {
    const contract = new messages.Contract();

    const stubQuote = new Quoter()

    const stubAuth = new Authenticator()
    sinon.stub(stubAuth, 'validateContract').returns(false)

    const stubCall = {
        request: contract
    }

    const farmer = new Farmer(1, stubQuote, stubAuth)
    farmer.awardContract(stubCall, (error, response) => {
        t.true(null != error)
        t.true(null === response)
    })
})