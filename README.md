<img src="https://github.com/AraBlocks/ara-module-template/blob/master/ara.png" width="30" height="30" /> ara-farming-protocol
========
[![Build Status](https://travis-ci.com/AraBlocks/ara-farming-protocol.svg?token=6WjTyCg41y8MBmCzro5x&branch=master)](https://travis-ci.com/AraBlocks/ara-farming-protocol)


Ara Farming Protocol (AFP) provides methods for distributed decentralized services in the Ara Network to request work from its peers and determine the specifications of work contracts (i.e. rewards and other service-specific details).

### Terminology

#### Farming

Performing a service for another peer in the network, potentially for a reward.

#### Farmer

A peer in the network who can provide a service.

#### Requester

A peer in the network who desires to distribute work amongst peers.

#### SOW (Statement-of-Work) // all `Statement-of-Work` or `Statement of Work` or just all `SOW`

The scope of a distributable task, i.e. units-of-work, minimum resources, delivery date, etc.

#### Quote

A farmer's response to a SOW, include cost per unit-of-work for the given SOW.

#### Agreement

An agreed upon statement of work and quote between a farmer and a requester. This may reference a specific smart contract, or some other verifiable source, which can validate the details of an agreement.

### Introduction

AFP defines a set of extensible Javascript classes to enable peers of a distributed service to communicate about and define `SOW`s for a specific service. Peers exchange messages in the form of [farming-protocol-buffers](https://github.com/AraBlocks/farming-protocol-buffers).

To Farm: Extend the AFP Farmer class to define specifications to generate a quote for a task, validate a peer/SOW for a task, and sign and validate an agreement for a task. A discovery-swarm (or another peer discovery method) is used to broadcast ability to complete a task, and then communicate capabilities and costs via a duplex stream.

To Make a Request: Extend the AFP Requester class to define specifications to validate peers/quotes for a task, create and validate agreements for a task, and to start a task. Also extend the AFP Matcher class to define the specifications to select and hire a set of peers given their quotes for a task. Use a discovery-swarm to connect to peers and use AFP to discuss the task.

The default interaction between a requester and a farmer resembles the following:
- Requester sends `SOW` to farmer
- Farmer validates `SOW` and replies with Quote for work
- Requester validates quote and selects set of peers to complete work based on quotes
- Requester sends agreement to selected farmers
- Farmer validates agreement and countersigns agreement
- Requester validates agreement and distributes work
- When work is finished, requester sends reward to farmer
- Farmer validates reward and returns a receipt to requester

AFP provides a [default implementation](link to example files here) for communicating over duplex streams.

## Status

This project is still in alpha development. // make this **Stable** when tagged/released

## Dependencies

* [node](https://nodejs.org)
* [farming-protocol-buffers](https://github.com/AraBlocks/farming-protocol-buffers)

## Installation

```
$ git clone git@github.com:ara-farming-protocol/farming-protocol.git
$ npm install
```

## Usage

Extend the following classes:

* FarmerBase
* MatcherBase
* RequesterBase

Applications that enable users to request work to be done on the network would extend the RequesterBase class (which handles interacting with farmers) and the MatcherBase (which handles selecting a subset of farmers for a task).

Applications that enable a user to participate in distributed work requests and receive rewards would extend the FarmerBase class (which handles interaction with requesters).

All applications must extend and wrap communication with the PeerConnection interface.

### Connections

The PeerConnection interface is an abstract class that can be extended to wrap streams, RPCs, sockets, etc. The [`/src/duplex`](/src/duplex/README.md) folder contains an implementation of duplex streams wrapped with the PeerConnection interface.

### Implementation

#### Requester - I would move all these signatures into the API section / format

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
  throw new Error('Extended classes must implement generateReceipt.')
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

Make a `## API` section here ala
https://github.com/AraBlocks/ara-module-template#anotherThing
Maddie may know a script to auto gen markup from the JS comments (which are awesome)

## [Examples](/examples/README.md)

## Contributing

* [How to contribute](/.github/CONTRIBUTING.md)
* [Commit message format](/.github/COMMIT_FORMAT.md)
* [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)

## See Also
* [RFC](https://github.com/AraBlocks/RFCs/blob/0000-AFP/text/0000-afp.md)
* [ara-identity](https://github.com/AraBlocks/ara-identity)
* [ara-filesystem](https://github.com/AraBlocks/ara-filesystem)
* [ara-network](https://github.com/AraBlocks/ara-network)
* [duplex streams](https://nodejs.org/api/stream.html#stream_class_stream_duplex)

## License

[LGPL-3.0](/LICENSE)
