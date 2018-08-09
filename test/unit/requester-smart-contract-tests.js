const { ExampleRequester } = require('../../examples/multi-farmer-simulation-smart-contract/requester.js')
const { MatcherBase } = require('../../src/matcher')
const messages = require('../../src/proto/messages_pb')
const sinon = require('sinon')
const test = require('ava')

const requester = new ExampleRequester(
  new messages.SOW(),
  new MatcherBase(),
  new messages.Signature(),
  null
)

const reward = new messages.Reward()
reward.setFarmer(new messages.ARAid())
reward.setSow(new messages.SOW())

test('requester.sendReward.succeed', async (t) => {
  const fakeDelivery = sinon.fake()

  const stubContract = {
    submitReward: sinon.stub().resolves()
  }
  const server = {
    sendReward: sinon.stub().callsFake(fakeDelivery)
  }
  requester.wallet = stubContract
  await requester.sendReward(server, reward)

  t.true(fakeDelivery.calledOnce)
})

test('requester.sendReward.fail', async (t) => {
  const fakeDelivery = sinon.fake()

  const stubContract = {
    submitReward: sinon.stub().rejects()
  }

  const server = {
    sendReward: sinon.stub().callsFake(fakeDelivery)
  }

  requester.wallet = stubContract
  await requester.sendReward(server, reward)

  t.true(fakeDelivery.notCalled)
})