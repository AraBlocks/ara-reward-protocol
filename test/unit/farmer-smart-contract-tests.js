const test = require('ava')
const sinon = require('sinon')
const messages = require('../../src/proto/messages_pb')
const {
  ExampleFarmer
} = require('../../examples/multi-farmer-simulation-smart-contract/farmer.js')

const farmer = new ExampleFarmer(null, new messages.Signature(), 1, null)

test('farmer.handleRewardDelivery', (t) => {
  const stubCall = {
    request: 'request'
  }

  const stubWithdraw = sinon.fake()
  const stubCallback = sinon.fake()

  sinon.stub(farmer, 'withdrawReward').callsFake(stubWithdraw)
  farmer.handleRewardDelivery(stubCall, stubCallback)

  t.true(stubWithdraw.calledOnce)
  t.true(stubCallback.calledOnce)
})
