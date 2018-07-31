const test = require('ava')
const sinon = require('sinon')
const messages = require('../../src/proto/messages_pb')
const { Requester } = require('../../src/requester')
const { Matcher } = require('../../src/matcher')
const {
  ExampleRequester
} = require('../../examples/multi-farmer-simulation-smart-contract/requester.js')

const requester = new ExampleRequester(
  new messages.SOW(),
  new Matcher(),
  new messages.Signature(),
  '',
  ''
)

const reward = new messages.Reward()
reward.setFarmer(new messages.ARAid())
reward.setSow(new messages.SOW())

test('requester.submitJob.succeed', async (t) => {
  const stubContract = {
    createJob: sinon.stub().resolves(true)
  }

  requester.smartContract = stubContract
  await requester.submitJob(100).then((result) => {
    t.true(result)
  })
})

test('requester.submitJob.fail', async (t) => {
  const stubContract = {
    createJob: sinon.stub().resolves(false)
  }

  requester.smartContract = stubContract
  await requester.submitJob(100).then((result) => {
    t.true(!result)
  })
})

test('requester.sendReward.succeed', async (t) => {
  const fakeDeliver = sinon.fake()

  const stubContract = {
    submitReward: sinon.stub().resolves(true)
  }
  const server = {
    deliverReward: fakeDeliver
  }

  requester.smartContract = stubContract
  await requester.sendReward(server, reward).then(() => {
    t.true(fakeDeliver.calledOnce)
  })
})

test('requester.sendReward.fail', async (t) => {
  const fakeDeliver = sinon.fake()

  const stubContract = {
    submitReward: sinon.stub().resolves(false)
  }
  const server = {
    deliverReward: fakeDeliver
  }

  requester.smartContract = stubContract
  await requester.sendReward(server, reward).then(() => {
    t.true(fakeDeliver.notCalled)
  })
})
