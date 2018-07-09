const test = require('ava');
const sinon = require('sinon');
const messages = require('../../src/proto/messages_pb');
const { Requester } = require('../../src/requester');
const { Matcher } = require('../../src/matcher');
const {
  ExampleRequester
} = require('../../examples/multi-farmer-simulation-smart-contract/requester.js');

test('requester.submitJob.succeed', async t => {
  const sow = new messages.SOW();
  const matcher = new Matcher();
  const sig = new messages.Signature();

  const requester = new ExampleRequester(sow, matcher, sig, '', '');

  const stubContract = {
    createJob: sinon.stub().resolves(true)
  };

  requester.smartContract = stubContract;
  await requester.submitJob(100).then(result => {
    t.true(requester.hasJob);
  });
});

test('requester.submitJob.fail', async t => {
  const sow = new messages.SOW();
  const matcher = new Matcher();
  const sig = new messages.Signature();

  const requester = new ExampleRequester(sow, matcher, sig, '', '');

  const stubContract = {
    createJob: sinon.stub().resolves(false)
  };

  requester.smartContract = stubContract;
  await requester.submitJob(100).then(result => {
    t.true(!requester.hasJob);
  });
});

test('requester.handleQuoteResponse.ValidPeer', t => {
  const sow = new messages.SOW();
  const quote = new messages.Quote();

  const stubMatcher = new Matcher();
  const quoteMatchFake = sinon.fake();
  sinon.stub(stubMatcher, 'validateQuote').callsFake(quoteMatchFake);

  const requester = new Requester(sow, stubMatcher);
  sinon.stub(requester, 'validatePeer').returns(true);

  requester.handleQuoteResponse(null, quote, null);

  t.true(quoteMatchFake.calledOnce);
});

test('requester.handleQuoteResponse.InvalidPeer', t => {
  const sow = new messages.SOW();
  const quote = new messages.Quote();

  const stubMatcher = new Matcher();
  const quoteMatchFake = sinon.fake();
  sinon.stub(stubMatcher, 'validateQuote').callsFake(quoteMatchFake);

  const requester = new Requester(sow, stubMatcher);
  sinon.stub(requester, 'validatePeer').returns(false);

  requester.handleQuoteResponse(null, quote, null);

  t.true(quoteMatchFake.notCalled);
});

test('requester.handleSignedContract.ValidContract', t => {
  const sow = new messages.SOW();
  const contract = new messages.Contract();

  const stubMatcher = new Matcher();

  const requester = new Requester(sow, stubMatcher);
  const contractConfirmFake = sinon.fake();
  sinon.stub(requester, 'validateContract').returns(true);
  sinon.stub(requester, 'onHireConfirmed').callsFake(contractConfirmFake);

  requester.handleSignedContract(null, contract);

  t.true(contractConfirmFake.calledOnce);
});

test('requester.handleSignedContract.InvalidContract', t => {
  const sow = new messages.SOW();
  const contract = new messages.Contract();

  const stubMatcher = new Matcher();
  const invalidQuoteFake = sinon.fake();
  sinon.stub(stubMatcher, 'invalidateQuote').callsFake(invalidQuoteFake);

  const requester = new Requester(sow, stubMatcher);
  const contractConfirmFake = sinon.fake();
  sinon.stub(requester, 'validateContract').returns(false);
  sinon.stub(requester, 'onHireConfirmed').callsFake(contractConfirmFake);

  requester.handleSignedContract(null, contract);

  t.true(contractConfirmFake.notCalled);
  t.true(invalidQuoteFake.calledOnce);
});

test('requester.hireFarmer', t => {
  const sow = new messages.SOW();
  const quote = new messages.Quote();
  const stubMatcher = new Matcher();
  const requester = new Requester(sow, stubMatcher);
  const genContractFake = sinon.fake();
  sinon.stub(requester, 'generateContract').callsFake(genContractFake);

  const awardContractFake = sinon.fake();

  const stubRFP = {
    awardContract: awardContractFake
  };

  requester.hireFarmer(quote, stubRFP);

  t.true(genContractFake.calledOnce);
  t.true(awardContractFake.calledOnce);
});

test('requester.processFarmers', t => {
  const sow = new messages.SOW();
  const stubMatcher = new Matcher();
  const requester = new Requester(sow, stubMatcher);

  const getQuoteFake = sinon.fake();
  const stubRFP = {
    getQuote: getQuoteFake
  };

  requester.processFarmers([stubRFP]);
  t.true(getQuoteFake.calledOnce);
});
