const { MatcherBase } = require('../../src/matcher')
const { messages } = require('reward-protocol-buffers')
const test = require('ava')

const { Quote } = messages

test('matcher.send.noOverride', async (t) => {
  const matcher = new MatcherBase()
  const quote = new Quote()
  await t.throws(matcher.addQuote(quote, () => {}), Error)
  await t.throws(matcher.removeQuote(quote), Error)
})
