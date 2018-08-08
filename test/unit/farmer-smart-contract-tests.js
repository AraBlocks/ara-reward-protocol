const { ExampleFarmer } = require('../../examples/multi-farmer-simulation-smart-contract/farmer.js')
const messages = require('../../src/proto/messages_pb')
const sinon = require('sinon')
const test = require('ava')

const farmer = new ExampleFarmer(null, new messages.Signature(), 1, null)

test('farmer.onReward', (t) => {
  const stubCall = {
    request: 'request'
  }

  const stubWithdraw = sinon.fake()
  const stubCallback = sinon.fake()

  sinon.stub(farmer, 'withdrawReward').callsFake(stubWithdraw)
  farmer.onReward(stubCall, stubCallback)

  t.true(stubWithdraw.calledOnce)
  t.true(stubCallback.calledOnce)
})
