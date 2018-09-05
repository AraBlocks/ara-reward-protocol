<img src="https://github.com/arablocks/ara-farming-protocol/blob/master/ara.png" width="30" height="30" /> ara-farming-protocol
========
[![Build Status](https://travis-ci.com/AraBlocks/ara-farming-protocol.svg?token=6WjTyCg41y8MBmCzro5x&branch=master)](https://travis-ci.com/AraBlocks/ara-farming-protocol)


ARA Farming Protocol (AFP) provides methods for distributed decentralized services, or decents, in the ARA Network to request work from its peers and determine the specifications of work contracts (i.e. rewards and other service-specific details).

### Terminology

#### Farming

Performing a service for another peer in the network, potentially for a reward.

#### Farmer

A peer in the network who can provide a service.

#### Requester

A peer in the network who desires to distribute work amongst peers.

#### SOW (Statement-of-Work)

The scope of a distributable task, i.e. units-of-work, minimum resources, delivery date, etc.

#### Quote

A farmer's response to a SOW, include cost per unit-of-work for the given SOW. 

#### Agreement

An agreed upon statement of work and quote between a farmer and a requester. This may reference a specific smart contract, or some other verifiable source, which can validate the details of an agreement.

### Introduction

AFP defines a set of extensible classes in Javascript which enable peers of a distributed service to communicate about and define a statement of work for that service. Peers exchange messages in the form of [farming-protocol-buffers](https://github.com/AraBlocks/farming-protocol-buffers). 

AFP also provides a default implementation for communicating over duplex streams.

A [farmer](#farmer) would extend the AFP Farmer class to define that farmer’s specifications for generating a quote for a task, validating a peer/SOW for a task, and signing and validating an agreement for a task. The farmer could then use a discovery-swarm (or some other peer discovery method) to broadcast their ability to complete a task, and then communicate via a duplex stream their capabilities and costs. 

A [requester](#requester) would extend the AFP Requester class to define the requester's specifications for validating peers/quotes for a task, creating and validating agreements for a task, and for starting a task. A requester would also extend the AFP Matcher class to define the specifications for selecting and hiring a set of peers given their quotes for a task. The requester could then use a discovery-swarm to connect to peers and use AFP to discuss the task.

The default interaction between a requester and a farmer resembles the following:
- Requester sends statement-of-work to farmer
- Farmer validates sow and replies with quote for work
- Requester validates quote and selects set of peers to complete work based on quotes
- Requester sends agreement to selected farmers
- Farmer validates agreement and countersigns agreement
- Requester validates agreement and distributes work
- When work is finished, requester sends reward to farmer
- Farmer validates reward and returns a receipt to requester

### Real World Examples

#### A Decentralized Content Distribution Service

In the case of content distribution, a content requester is looking for a set of peers that have a specific piece of content who are willing to transfer that content to the requester. The requester is willing to reward a certain amount per GB for the file transfer.

The content requester would first find a set of farmers that have the specific desired content. The requester would then pass those farmers to their implementation of AFP. AFP would then ask each peer their transfer cost per GB of data. If the cost is less than or equal the maximum amount the requester is willing to pay, then the requester would employ the farmer. The AFP implementation could then take subset of farmers who have contractually agreed to do work for the requester and start file transfer.

#### A Video Transcoding Service

In the case of video transcoding, a requester is looking for a set of peers that are able to transcode videos. The requester is willing to reward a certain amount per frame that is transcoded.

The requester would first find a set of farmers who have the correct software for transcoding a video. The requester would then pass those farmers to their AFP implementation. AFP would then ask each peer their transcode cost per frame. The matcher implementation could then find a set of peers whose total cost is less than a desired amount and then hire that set of farmers. The AFP implementation could then take subset of farmers who have contractually agreed to do work for the requester and start the video transcode.

## Status

This project is still in alpha development.

## Dependencies

* [node](https://nodejs.org)
* [farming-protocol-buffers](https://github.com/AraBlocks/farming-protocol-buffers)

## Installation

```
$ npm i
```

## Usage

The expected usage is for an application to extend the following classes:

* FarmerBase
* MatcherBase
* RequesterBase

For an application that enables a user to request distributed work to be done on the network, that application would extend the RequesterBase class (which handles interacting with farmers) and the MatcherBase (which handles selecting a subset of farmers for a task).

For an application that enables a user to participate in distributed work requests and receive rewards, that application would extend the FarmerBase class (which handles interaction with requesters).

The FarmerBase and RequesterBase classes communicate via the PeerConnection interface. 

### Connections

The PeerConnection interface is effectively an abstract class that can be extended to wrap streams, RPCs, sockets, etc. The [`/src/duplex`](/src/duplex/README.md) folder contains an implementation of duplex streams wrapped with the PeerConnection interface.

### Implementation

This section describes the classes that must be extended for AFP.

#### Requester

A requester must extend the Requester class to define the requester's specifications for validating quotes for a task, creating and validating agreements for a task, and for starting a task.

```js
/**
 * Returns whether a quote is valid.
 * @param {messages.Quote} quote
 * @returns {boolean}
 */
async validateQuote(quote) {
  throw new Error('Extended classes must implement validateQuote.')
}

/**
 * Generate and return an agreement for a quote.
 * @param {messages.Quote} quote
 * @returns {messages.Agreement}
 */
async generateAgreement(quote) {
  throw new Error('Extended classes must implement generateAgreement.')
}

/**
 * Return whether an agreement is valid.
 * @param {messages.Agreement} agreement
 * @returns {boolean}
 */
async validateAgreement(agreement) {
  throw new Error('Extended classes must implement validateAgreement.')
}

/**
 * Called when an agreement has been marked as valid and a farmer
 * is ready to start work.
 * @param {messages.Agreement} agreement
 * @param {PeerConnection} connection
 */
async onHireConfirmed(agreement, connection) {
  throw new Error('Extended classes must implement onHireConfirmed')
}

/**
 * On receipt of a reward receipt from a farmer.
 * @param {messages.Receipt} receipt
 * @param {PeerConnection} connection
 */
async onReceipt(receipt, connection) {
  throw new Error('Extended classes must implement onReceipt')
}
```

#### Farmer

A farmer must extend the Farmer class to define that farmer’s specifications for generating a quote for a task, validating a SOW for a task, and signing and validating an agreement for a task. If rewards are expected, then a farmer would also handle validating the reward and generating a receipt.

```js
/**
 * Return whether a sow is valid.
 * @param {messages.SOW} sow
 * @returns {boolean}
 */
async validateSow(sow) {
  throw new Error('Extended classes must implement validateSow.')
}

/**
 * Return whether a reward is valid.
 * @param {messages.Reward} reward
 * @returns {boolean}
 */
async validateReward(reward) {
  throw new Error('Extended classes must implement validateReward.')
}

/**
 * Return whether an agreement is valid.
 * @param {messages.Agreement} agreement
 * @returns {boolean}
 */
async validateAgreement(agreement) {
  throw new Error('Extended classes must implement validateAgreement.')
}

/**
 * Return a receipt given a reward.
 * @param {messages.Reward} reward
 * @returns {messages.Receipt}
 */
async generateReceipt(reward) {
  throw new Error('Extended classes must implement generateQuote.')
}

/**
 * Return a quote given a sow.
 * @param {messages.SOW} sow
 * @returns {messages.Quote}
 */
async generateQuote(sow) {
  throw new Error('Extended classes must implement generateQuote.')
}

/**
 * Sign and return an agreement.
 * @param {messages.Agreement} agreement
 * @returns {messages.Agreement}
 */
async signAgreement(agreement) {
  throw new Error('Extended classes must implement signAgreement.')
}
```

#### Matcher

Different service requesters may have different needs when selecting peers, such as selecting the cheapest set, the fastest set, the first set number of peers, etc. To allow for this, each service may implement their own matcher (or use one of a set of predefined matchers) that extends the Matcher class. This class describes an object that, given a set of options, selects a subset of peers using a matching strategy specific to the service.

```js
/**
 * Add a quote for consideration. If a quote is considered
 * valid, then call hireFarmerCallback to continue
 * agreement process.
 * @param {messages.Quote} quote
 * @param {function(messages.Agreement)} hireFarmerCallback
 */
async addQuote(quote, hireFarmerCallback) {
  throw new Error('Extended classes must implement addQuote')
}

/**
 * Remove quote from consideration.
 * @param {messages.Quote} quote
 */
async removeQuote(quote) {
  throw new Error('Extended classes must implement removeQuote')
}
```

## [Examples](/examples/README.md)

## Local Development Setup

## Contributing

* [How to contribute](/.github/CONTRIBUTING.md)
* [Commit message format](/.github/COMMIT_FORMAT.md)
* [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)

## See Also
* [AID](https://github.com/AraBlocks/ara-identity)
* [AFS](https://github.com/AraBlocks/ara-filesystem)
* [ANN](https://github.com/AraBlocks/ara-network)

## License

LGPL-3.0
