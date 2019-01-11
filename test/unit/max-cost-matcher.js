const { MaxCostMatcher } = require('../../src/matchers/max-cost-matcher')
const {
  messages: {
    Quote
  }
} = require('reward-protocol-buffers')
const test = require('ava')

const LOW_COST = '5.000000005'
const HIGH_COST = '5.000000006'

test('matcher.addQuote', async (t) => {
  const matcher = new MaxCostMatcher(LOW_COST, 5)

  const goodQuoteId = Buffer.from('abcd', 'hex')
  const goodQuote = new Quote()
  goodQuote.setNonce(goodQuoteId)
  goodQuote.setPerUnitCost(LOW_COST)

  t.true(await matcher.addQuote(goodQuote, () => {}))

  const badQuoteId = Buffer.from('1234', 'hex')
  const badQuote = new Quote()
  badQuote.setNonce(badQuoteId)
  badQuote.setPerUnitCost(HIGH_COST)

  t.false(await matcher.addQuote(badQuote, () => {}))
})

test('matcher.removeQuote', async (t) => {
  const matcher = new MaxCostMatcher(LOW_COST, 0)

  const nonceString = 'abcd'
  const quoteId = Buffer.from(nonceString, 'hex')
  const quote = new Quote()
  quote.setNonce(quoteId)
  quote.setPerUnitCost(LOW_COST)
  matcher.addQuote(quote, () => {})

  matcher.removeQuote(quote)
  t.true(-1 === matcher.reserveWorkers.indexOf(nonceString))
  t.false(matcher.hiredQuoteCallbacks.has(nonceString))
  t.true(0 === matcher.hiredQuoteCallbacks.size)

  matcher.removeQuote(quote)
})

test('matcher.hireFromReserve', async (t) => {
  const matcher = new MaxCostMatcher(LOW_COST, 1)
  matcher.hireFromReserve()

  const nonceString1 = 'abcd'
  const quoteId1 = Buffer.from(nonceString1, 'hex')
  const quote1 = new Quote()
  quote1.setNonce(quoteId1)
  quote1.setPerUnitCost(LOW_COST)

  const nonceString2 = '1234'
  const quoteId2 = Buffer.from(nonceString2, 'hex')
  const quote2 = new Quote()
  quote2.setNonce(quoteId2)
  quote2.setPerUnitCost(LOW_COST)

  t.true(await matcher.addQuote(quote1, () => {}))
  t.true(await matcher.addQuote(quote2, () => {}))
  matcher.removeQuote(quote1)
  t.false(matcher.hiredQuoteCallbacks.has(nonceString1))
  t.true(matcher.hiredQuoteCallbacks.has(nonceString2))
})
