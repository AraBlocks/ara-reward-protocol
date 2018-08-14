const { ExampleFarmer } = require('../../examples/multi-farmer-simulation-smart-contract/farmer.js')
const messages = require('../../src/proto/messages_pb')
const sinon = require('sinon')
const test = require('ava')

const farmer = new ExampleFarmer(null, new messages.Signature(), 1, null)

test('farmer.generateReceipt', (t) => {
  const reward = new messages.Reward()

  const stubWithdraw = sinon.fake()

  sinon.stub(farmer, 'withdrawReward').callsFake(stubWithdraw)
  farmer.generateReceipt(reward)

  t.true(stubWithdraw.calledOnce)
})
