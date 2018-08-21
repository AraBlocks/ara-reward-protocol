const { MSG } = require('../../src/duplex/stream-protocol')
const messages = require('../../src/proto/messages_pb')
const test = require('ava')

test('duplex.encode-decode.validData', (t) => {
  const id = 'abcd'
  const bb = Buffer.from(id, 'hex')

  const sow = new messages.SOW()
  sow.setNonce(bb)
  const encodedSow = MSG.encode(MSG.SOW.head, sow.serializeBinary())
  const decodedSow = messages.SOW.deserializeBinary(MSG.decode(encodedSow).data)
  t.true(Buffer.from(decodedSow.getNonce()).toString('hex') === id)

  const quote = new messages.Quote()
  quote.setNonce(bb)
  const encodedQuote = MSG.encode(MSG.QUOTE.head, quote.serializeBinary())
  const decodedQuote = messages.Quote.deserializeBinary(MSG.decode(encodedQuote).data)
  t.true(Buffer.from(decodedQuote.getNonce()).toString('hex') === id)

  const agreeement = new messages.Agreement()
  agreeement.setNonce(bb)
  const encodedAgreement = MSG.encode(MSG.AGREEMENT.head, agreeement.serializeBinary())
  const decodedAgreement = messages.Agreement.deserializeBinary(MSG.decode(encodedAgreement).data)
  t.true(Buffer.from(decodedAgreement.getNonce()).toString('hex') === id)

  const reward = new messages.Reward()
  reward.setNonce(bb)
  const encodedReward = MSG.encode(MSG.REWARD.head, reward.serializeBinary())
  const decodedReward = messages.Reward.deserializeBinary(MSG.decode(encodedReward).data)
  t.true(Buffer.from(decodedReward.getNonce()).toString('hex') === id)

  const receipt = new messages.Receipt()
  receipt.setNonce(bb)
  const encodedReceipt = MSG.encode(MSG.RECEIPT.head, receipt.serializeBinary())
  const decodedReceipt = messages.Receipt.deserializeBinary(MSG.decode(encodedReceipt).data)
  t.true(Buffer.from(decodedReceipt.getNonce()).toString('hex') === id)
})
