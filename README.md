# farming-protocol

ARA Farming Protocol (AFP) provides methods for distributed decentralized services, or decents, in the ARA Network to request work from its peers and determine the specifications of work contracts (i.e. rewards and other service-specific details).

### Terminology

#### Farming

Performing a service for another peer in the network, potentially for a reward.

#### Farmer

A peer in the network who participates in farming.

#### Requester

A peer in the network who intends to distribute work amoungst farmers.

### Introduction

AFP defines a set of extensible classes in Javascript and objects in Proto which enable peers of a distributed service to communicate about and define a statement of work for that service. AFP also provides a default implementation using gRPC servers/clients in Javascript.

A [farmer](#farmer) would extend the AFP Farmer class to define that farmer’s specifications for generating a quote for a task, validating a peer for a task, and signing and validating a contract for a task. The farmer could then use the default gRPC implementation to broadbast their availability to complete a task.

A [requester](#requester) would extend the AFP Requester class to define the requester's specifications for validating peers for a task, creating and validating contracts for a task, and for starting a task. A requester would also extend the AFP Matcher class to define the specifications for selecting and hiring a set of peers given their quotes for a task. The requester could then use the default gRPC implementation to connect to peers for discussing a task.

### Real World Examples

#### A Decentralized Content Distribution Service

In the case of content distribution, a content requester is looking for a set of peers that have a specific piece of content who are willing to transfer that content to the requester. The requester is willing to reward a certain amount per GB for the file transfer.

The content requester would first find a set of farmers that have the specific desired content. The requester would then pass those farmers to their implemenatation of AFP. AFP would then ask each peer their transfer cost per GB of data. If the cost is less than or equal the maximum amount the requester is willing to pay, then the requester would employ the farmer. The AFP implementation could then take subset of farmers who have contractually agreed to do work for the requester and start file transfer.

#### A Video Transcoding Service

In the case of video transcoding, a requester is looking for a set of peers that are able to transcode videos. The requester is willing to reward a certain amount per frame that is transcoded.

The requester would first find a set of farmers who have the correct software for transcoding a video. The requester would then pass those farmers to their AFP implementation. AFP would then ask each peer their transcode cost per frame. The matcher implementation could then find a set of peers whose total cost is less than a desired amount and then hire that set of farmers. The AFP implementation could then take subset of farmers who have contractually agreed to do work for the requester and start the video transcode.

## Status

This project is still in alpha development.

## Dependencies

* [node](https://nodejs.org)
* [grpc](https://www.npmjs.com/package/grpc)
* [grpc-tools](https://www.npmjs.com/package/grpc-tools)
* [google-protobuf](https://www.npmjs.com/package/google-protobuf)

## Installation

```
$ npm i
```

## Usage

The expected usage is for an application to implement some combinration of its own extensions to the following classes:

* Farmer
* Matcher
* Requester
  For an application that enables a user to request distributed work to be done on the network, that application would create an implementation of the Requester (which handles communicating with farmers) and the Matcher (which handles selecting a subset of farmers for a task).
  For an application that enables a user to participate in distributed work requests and receive rewards, that application would create an implementation of the Farmer (which handles communicating with requesters).

### Farming

For broadcasting the ability to farm.

```js
const { ExampleFarmer } = require('./farmer')
const { broadcastFarmer } = require('../../src/farmer-server')

// The application's custom classes
const farmer = new ExampleFarmer()

// Broadcast on a specific port
const port = `localhost:50051`
broadcastFarmer(farmer, port)
```

### Requesting

For requesting a farming job.

```js
const { ExampleRequester } = require('./requester')
const { connectToFarmer } = require('../../src/farmer-server')

// The statement of work for the request
const sow = new messages.SOW()

// The application's custom classes
const matcher = new ExampleMatcher()
const requester = new ExampleRequester(sow, matcher)

// Connect to a farmer (or set of farmers)
const connection = connectToFarmer(port)
requester.processFarmers([connection])
```

### Implementation

This section describes the classes that must be extended for AFP.

#### Requester

A requester would extend the AFP Requester class to define the requester's specifications for validating peers for a task, creating and validating contracts for a task, and for starting a task.

```js
  /**
   * This should returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.')
  }

  /**
   * This should generate and return a contract for a quote.
   * @param {messages.Quote} quote
   * @returns {messages.Contract}
   */
  generateContract(quote) {
    throw new Error('Extended classes must implement generateContract.')
  }

  /**
   * This should return whether a contract is valid.
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract.')
  }

  /**
   * This is called when a contract has been marked as valid and a farmer
   * is ready to start work
   * @param {messages.Contract} contract
   * @param {services.RFPClient} farmer
   */
  onHireConfirmed(contract) {
    throw new Error('Extended classes must implement onHireConfirmed')
  }
```

#### Farmer

A farmer would extend the AFP Farmer class to define that farmer’s specifications for generating a quote for a task, validating a peer for a task, and signing and validating a contract for a task.

```js
  /**
   * This should returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.')
  }

  /**
   * This should return a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  generateQuote(sow) {
    throw new Error('Extended classes must implement generateQuote.')
  }

  /**
   * This should returns whether or not a contract is valid.
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract.')
  }

  /**
   * This should sign and return a contract.
   * @param {messages.Contract} contract
   * @returns {messages.Contract}
   */
  signContract(contract) {
    throw new Error('Extended classes must implement signContract.')
  }
```

#### Matcher

Different service requesters may have different needs when selecting peers, such as selecting the cheapest set, the fastest set, the first set number of peers, etc. To allow for this, each service may implement their own matcher (or use one of a set of predefined matchers) that extends the Matcher class. This class describes an object that, given a set of options, selects a subset of peers using a matching strategy specific to the service.

```js
  /**
   * This is called to validate a quote. If a quote is considered
   * valid, then this should calls hireFarmerCallback to continue
   * contract award process.
   * @param {messages.Quote} quote
   * @param {function(messages.Contract)} hireFarmerCallback
   */
  validateQuote(quote, hireFarmerCallback) {
    throw new Error('Extended classes must implement validateQuote')
  }

  /**
   * This is called when a quote is no longer valid.
   * @param {messages.Quote} quote
   */
  invalidateQuote(quote) {
    throw new Error('Extended classes must implement invalidateQuote')
  }
```

## Examples

Note: as ara-farming-protocol is not yet on npm, you may need to run the following commands prior to running an example:

```
$ npm link
$ npm link ara-farming-protocol
```

### Multifarmer Simulation

This example generates and connects to 10 local farmers, then hires up to 5 farmers who charge <= 10 Ara per MB. The Requester Authenticator considers user 10057 as invalid requester. The Farmer Authenticator considers user 2 as an invalid farmer. In the case of an invalid farmer, the matcher finds a reserve farmer and hires that farmer instead.

```
$ node examples/multi-farmer-simulation/multi-farmer-simulation.js
```

### Multifarmer with Smart Contract Simulation

This example extends Multifarmer Simulation to work with an Ethereum smart contract. Upon the start of a job, the requester submits a budget to a simulated contract. When the job is finished, a report that documents the contribution of each farmer is generated. Based on this report, the requester will then distribute rewards through the contract and notify the farmers when the rewards have been sent.

```
$ node examples/multi-farmer-simulation-smart-contract/multi-farmer-simulation.js
```

### Remote Peers

The requester example finds peers on the discovery channel did:ara:desiredContent, then connects to each peer on an example port 50051 to determine costs. It uses the MaxCostMatcher to determine peers. The farmer example broadcasts on example port 19000 on discovery channel did:ara:desiredContent, and on the example farming port 50051.

On the farmer's computer/terminal:

```
$ node examples/remote-peers/remote-farmer.js
```

On the requester's computer/terminal:

```
$ node examples/remote-peers/remote-requester.js
```

## Local Development Setup

### Generating gRPC and Protobuf files

This repo uses statically generated gRPC and Protobuf files. Further documentation on static generation can be found [here](https://github.com/grpc/grpc/tree/v1.6.x/examples/node/static_codegen)

```bash
$ cd src/proto
$ npm install -g grpc-tools
$ grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=./ --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` messages.proto
$ grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=./ --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` route-guide.proto
```

Note: For Windows, you may need to replace `which grpc_tools_node_protoc_plugin` with the full path to grpc_node_plugin.exe (including the .exe extension)

### Tests

```
$ npm run test
```

### Linting

For viewing errors:

```
$ npm run lint
```

For auto-correcting errors:

```
$ npm run lint-fix
```

## Contributing

* [How to contribute](/.github/CONTRIBUTING.md)
* [Commit message format](/.github/COMMIT_FORMAT.md)
* [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)

## License

LGPL-3.0
