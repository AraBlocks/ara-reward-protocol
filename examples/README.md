# farming-protocol examples

This folder contains a set of examples intended to demonstrate usage of the farming protocol.

## Setup

Note: as ara-farming-protocol is not yet on npm, you may need to run the following commands prior to running an example:

```
$ npm link
$ npm link ara-farming-protocol
```

## Examples

### Multifarmer with Ethereum Smart Contract Simulation

This example extends Multifarmer Simulation to work with an Ethereum smart contract. Upon the start of a job, the requester submits a budget to a simulated contract. When the job is finished, a report that documents the contribution of each farmer is generated. Based on this report, the requester will then distribute rewards through the contract and notify the farmers when the rewards have been sent.

For this example, first install Ganache and Truffle through https://truffleframework.com/. Launch Ganache and run the codes below in Terminal:

```
$ cd examples/multi-farmer-simulation-smart-contract/farming_contract
$ truffle compile
$ truffle migrate
```

Replace wallet addresses in multi-farmer-simulation-smart-contract/constant.js with those from Ganache, and the contract address from the output.

```
$ node examples/multi-farmer-simulation-smart-contract/multi-farmer-simulation.js
```

### Remote Peers with gRPC

The requester example finds peers on the discovery channel did:ara:desiredContent, then connects to each peer on an example port 50051 to determine costs. It uses the MaxCostMatcher to determine peers. The farmer example broadcasts on example port 19000 on discovery channel did:ara:desiredContent, and on the example farming port 50051.

On the farmer's computer/terminal:

```
$ node examples/remote-peers-grpc/remote-farmer.js
```

On the requester's computer/terminal:

```
$ node examples/remote-peers-grpc/remote-requester.js
```

## Remote Peers with Duplexify

The requester example finds peers on the discovery channel and communicates via duplex stream to determine costs. It uses the MaxCostMatcher to determine peers. The farmer example then broadcasts on a randomly selected port and replicates an AFS.

On the farmer's computer/terminal:

```
$ node examples/remote-peers-duplex/remote-farmer.js
```

On the requester's computer/terminal:

```
$ node examples/remote-peers-duplex/remote-requester.js
```