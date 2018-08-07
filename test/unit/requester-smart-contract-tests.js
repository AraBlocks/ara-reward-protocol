const test = require('ava')
const sinon = require('sinon')
const messages = require('../../src/proto/messages_pb')
const { Matcher } = require('../../src/matcher')
const {
  ExampleRequester
} = require('../../examples/multi-farmer-simulation-smart-contract/requester.js')

const requester = new ExampleRequester(
  new messages.SOW(),
  new Matcher(),
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
    deliverReward: sinon.stub().callsFake(fakeDelivery)
  }
  requester.wallet = stubContract
  await requester.sendReward(server, reward)

  t.true(fakeDelivery.calledOnce)
})

test('requester.sendReward.succeed', async (t) => {
  const fakeDelivery = sinon.fake()

  const stubContract = {
    submitReward: sinon.stub().rejects()
  }

  const server = {
    deliverReward: sinon.stub().callsFake(fakeDelivery)
  }

  requester.wallet = stubContract
  await requester.sendReward(server, reward)
  t.true(!fakeDelivery.called)
})
