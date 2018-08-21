const { MSG } = require('../../src/duplex/stream-protocol')
const messages = require('../../src/proto/messages_pb')
const test = require('ava')

const {
  Agreement,
  Receipt,
  Reward,
  Quote,
  SOW
} = messages

test('duplex.encode-decode.validData', (t) => {
  const id = 'abcd'
  const bb = Buffer.from(id, 'hex')

  const sow = new SOW()
  sow.setNonce(bb)
  const encodedSow = MSG.encode(MSG.SOW.head, sow.serializeBinary())
  const decodedSow = SOW.deserializeBinary(MSG.decode(encodedSow).data)
  t.true(Buffer.from(decodedSow.getNonce()).toString('hex') === id)

  const quote = new Quote()
  quote.setNonce(bb)
  const encodedQuote = MSG.encode(MSG.QUOTE.head, quote.serializeBinary())
  const decodedQuote = Quote.deserializeBinary(MSG.decode(encodedQuote).data)
  t.true(Buffer.from(decodedQuote.getNonce()).toString('hex') === id)

  const agreeement = new Agreement()
  agreeement.setNonce(bb)
  const encodedAgreement = MSG.encode(MSG.AGREEMENT.head, agreeement.serializeBinary())
  const decodedAgreement = Agreement.deserializeBinary(MSG.decode(encodedAgreement).data)
  t.true(Buffer.from(decodedAgreement.getNonce()).toString('hex') === id)

  const reward = new Reward()
  reward.setNonce(bb)
  const encodedReward = MSG.encode(MSG.REWARD.head, reward.serializeBinary())
  const decodedReward = Reward.deserializeBinary(MSG.decode(encodedReward).data)
  t.true(Buffer.from(decodedReward.getNonce()).toString('hex') === id)

  const receipt = new Receipt()
  receipt.setNonce(bb)
  const encodedReceipt = MSG.encode(MSG.RECEIPT.head, receipt.serializeBinary())
  const decodedReceipt = Receipt.deserializeBinary(MSG.decode(encodedReceipt).data)
  t.true(Buffer.from(decodedReceipt.getNonce()).toString('hex') === id)
})
