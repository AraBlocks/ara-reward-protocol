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
AFP defines a set of methods in Javascript and objects in Proto which enable peers of a distributed service to communicate about and define a statement of work for that service. AFP also provides a default implementation using gRPC servers/clients in Javascript.

For a [farmer](#farmer), AFP would be used to define that farmer’s minimum accepted rewards for providing a service, as well as other parameters more specific to the service. If a requester wishes to hire a farmer, AFP would handle signing a contract of work and sending a start signal for beginning the work.

For a [requester](#requester), AFP would be used to define the maximum reward the requester is willing to give for a service, the number of farmers required, and other parameters specific to the service. AFP would also take in a matcher used to determine the peers. Once a set of peers is determined through the matcher, AFP would handle initiating and signing a contract of work, and sending a start signal to begin the distribution of work.

### Real World Examples

#### A Decentralized Content Distribution Service

In the case of content distribution, the content requester would first find a set of farmers that have the specific desired content. The requester would then pass those farmers to AFP. AFP would then ask each peer their cost per unit-of-work (for example, the cost the farmer requires to deliver a GB of data). If the cost is less than or equal to the requester’s maximum amount they are willing to pay, then the requester will employ the farmer. AFP would then pass a subset of farmers back to the service who have contractually agreed to do work for the requester.

#### A Video Transcoding Service

In the case of video transcoding, the requester would first find a set of farmers who have the correct software for transcoding a video. The requester would then pass those farmers to AFP. AFP would then ask each peer their cost per unit-of-work (for example, the cost the farmer requires to transcode a single frame). 

## Status
This project is still in alpha development.

## Dependencies
- [node](https://nodejs.org)
- [grpc](https://www.npmjs.com/package/grpc)
- [grpc-tools](https://www.npmjs.com/package/grpc-tools)
- [google-protobuf](https://www.npmjs.com/package/google-protobuf)

## Installation
```
$ npm i
```

## Usage
The expected usage is for an application to implement some combinration of its own extensions to the following classes:
- Farmer
- Matcher
- Requester
For an application that enables a user to request distributed work to be done on the network, that application would create an implementation of the Requester (which handles communicating with farmers) and the Matcher (which handles selecting a subset of farmers for a task).
For an application that enables a user to participate in distributed work requests and receive rewards, that application would create an implementation of the Farmer (which handles communicating with requesters). 

### Farming
For broadcasting the ability to farm.
```js
// The application's custom classes
const farmer = new ExampleFarmer()

// Broadcast on a specific port
const port = `localhost:50051` 
broadcastFarmer(farmer, port)
```

### Requesting
For requesting a farming job.
```js
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
```js
  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.')
  }

  /**
   * Generates a contract for quote
   * @param {messages.Quote} quote
   * @returns {messages.Contract}
   */
  generateContract(quote) {
    throw new Error('Extended classes must implement generateContract.')
  }

  /**
   * Returns whether a contract is valid.
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract.')
  }

  /**
   * Called when a contract has been marked as valid and ready to start work
   * @param {messages.Contract} contract
   */
  onHireConfirmed(contract) {
    throw new Error('Extended classes must implement onHireConfirmed')
  }
```
#### Farmer
```js
/**
   * Returns a quote given an SOW.
   * @param {messages.SOW} sow
   * @returns {messages.Quote}
   */
  generateQuote(sow) {
    throw new Error('Extended classes must implement generateQuote.')
  }

  /**
   * Returns whether a contract is valid
   * @param {messages.Contract} contract
   * @returns {boolean}
   */
  validateContract(contract) {
    throw new Error('Extended classes must implement validateContract.')
  }

  /**
   * Sign and return a contract
   * @param {messages.Contract} contract
   * @returns {messages.Contract}
   */
  signContract(contract) {
    throw new Error('Extended classes must implement signContract.')
  }

  /**
   * Returns whether a user is valid.
   * @param {messages.ARAid} peer
   * @returns {boolean}
   */
  validatePeer(peer) {
    throw new Error('Extended classes must implement validatePeer.')
  }
```

#### Matcher
Different service requesters may have different needs when selecting peers, such as selecting the cheapest set, the fastest set, the first set number of peers, etc. To allow for this, each service may implement their own matcher (or use one of a set of predefined matchers) that extends the Matcher class. This class describes an object that, given a set of options, selects a subset of peers using a matching strategy specific to the service.
```js
  /**
   * Calls hireFarmerCallback if quote is acceptable
   * @param {messages.Quote} quote
   * @param {function(messages.Contract)} hireFarmerCallback
   */
  //
  validateQuote(quote, hireFarmerCallback) {
    throw new Error('Extended classes must implement validateQuote')
  }

  /**
   * Removes quote from pool of options
   * @param {messages.Quote} quote
   */
  invalidateQuote(quote) {
    throw new Error('Extended classes must implement invalidateQuote')
  }
```

## Examples

### Multifarmer Simulation
This example generates and connects to 10 local farmers, then hires up to 5 farmers who charge <= 10 Ara per MB. The Requester Authenticator considers user 10057 as invalid requester. The Farmer Authenticator considers user 2 as an invalid farmer. In the case of an invalid farmer, the matcher finds a reserve farmer and hires that farmer instead.

```
$ node examples/multi-farmer-simulation/multi-farmer-simulation.js
```

## Local Development Setup
### Generating gRPC and Protobuf files 
This repo uses statically generated gRPC and Protobuf files. Further documentation on static generation can be found [here](https://github.com/grpc/grpc/tree/v1.6.x/examples/node/static_codegen) 

```bash
$ cd proto

$ grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=./ --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` messages.proto
$ grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=./ --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` route_guide.proto
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
- [How to contribute](/.github/CONTRIBUTING.md)
- [Commit message format](/.github/COMMIT_FORMAT.md)
- [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)

## License
LGPL-3.0
