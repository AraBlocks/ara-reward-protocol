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

#### SOW (Statement-of-Work)

The scope of a distributable task, i.e. units-of-work, minimum resources, delivery date, etc.

#### Quote

A farmer's response to a `SOW`, include cost per unit-of-work for the given `SOW`.

#### Agreement

An agreed upon `SOW` and quote between a farmer and a requester. This may reference a specific smart contract, or some other verifiable source, which can validate the details of an agreement.

#### Reward

A reward for a specific agreement, sent by a verifiable peer.

#### Receipt

A receipt for a reward, sent by a verifiable peer.

### Introduction

AFP defines a set of extensible Javascript classes to enable peers of a distributed service to communicate about and define `SOW`s for a specific service. Peers exchange messages in the form of [farming-protocol-buffers](https://github.com/AraBlocks/farming-protocol-buffers) via AFP's `PeerConnection` interface.

The default interaction between a requester and a farmer is the following:
1. Requester sends `SOW` to farmer
2. Farmer validates `SOW` and replies with quote for work
3. Requester validates quote and selects set of peers to complete work based on quotes
4. Requester sends agreement to selected farmers
5. Farmer validates agreement and countersigns agreement
6. Requester validates agreement and distributes work
7. If rewardable, when work is finished, requester sends reward to farmer
8. Farmer validates reward and returns a receipt to requester

## Status

This project is **Stable**.

## Dependencies

* [node](https://nodejs.org)
* [farming-protocol-buffers](https://github.com/AraBlocks/farming-protocol-buffers)

## Installation

```
$ npm i ara-farming-protocol
```

## Usage

Extend the following classes:

* [PeerConnection](#peerconnection)
* [FarmerBase](#farmerbase)
* [MatcherBase](#matcherbase)
* [RequesterBase](#requesterbase)

Communication: Extend the `PeerConnection` interface to enable your own method of communication, or use AFP's `DuplexConnection` class to communicate via [duplex streams](https://nodejs.org/api/stream.html#stream_class_stream_duplex).

Farming: Extend AFP's `FarmerBase` class to define the specifications to generate a quote for a task, validate a peer/`SOW` for a task, and to sign and validate an agreement for a task.

Requesting: Extend AFP's `RequesterBase` class to define the specifications to validate peers/quotes for a task, create and validate agreements for a task, and to start work for a task. Also extend AFP's `MatcherBase` class to define the specifications to select and hire a set of peers given their quotes for a task.

**Note**: AFP requires applications implement their own peer discovery method, such as a [discovery-swarm](https://github.com/mafintosh/discovery-swarm).

### API

* [PeerConnection](#peerconnection)
* [FarmerBase](#farmerbase)
* [MatcherBase](#matcherbase)
* [RequesterBase](#requesterbase)

#### PeerConnection

The PeerConnection interface is an abstract class that can be extended to wrap streams, RPCs, sockets, etc. The [`/src/duplex`](/src/duplex/README.md) folder contains an implementation of duplex streams that extends the PeerConnection interface.

```js
/**
 * Send sow to peer.
 * @param {messages.SOW} sow
 */
async sendSow(sow) {
  throw new Error('Extended classes must implement sendSow.')
}

/**
 * Send quote to peer.
 * @param {messages.Quote} quote
 */
async sendQuote(quote) {
  throw new Error('Extended classes must implement sendQuote.')
}

/**
 * Send agreement to peer.
 * @param {messages.Agreement} agreement
 */
async sendAgreement(agreement) {
  throw new Error('Extended classes must implement sendAgreement.')
}

/**
 * Send reward to peer.
 * @param {messages.Reward} reward
 */
async sendReward(reward) {
  throw new Error('Extended classes must implement sendReward.')
}

/**
 * Send receipt to peer.
 * @param {messages.Receipt} receipt
 */
async sendReceipt(receipt) {
  throw new Error('Extended classes must implement sendReceipt.')
}
```

#### RequesterBase

A requester must extend the RequesterBase class to define the requester's specifications for validating quotes for a task, creating and validating agreements for a task, and for starting a task.

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

#### FarmerBase

A farmer must extend the FarmerBase class to define that farmer’s specifications for generating a quote for a task, validating a SOW for a task, and signing and validating an agreement for a task. If rewards are expected, then a farmer would also handle validating the reward and generating a receipt.

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

/**
 * Called when an agreement has been marked as valid and a requester
 * is ready to start work.
 * @param {messages.Agreement} agreement
 * @param {PeerConnection} connection
 */
async onHireConfirmed(agreement, connection) {
  throw new Error('Extended classes must implement onHireConfirmed')
}
```

#### MatcherBase

Different service requesters may have different needs when selecting peers, such as selecting the cheapest set, the fastest set, the first set number of peers, etc. To allow for this, each service may implement their own matcher (or use one of a set of predefined matchers) that extends the MatcherBase class. This class describes an object that, given a set of options, selects a subset of peers using a matching strategy specific to the service.

```js
/**
 * Add a quote for consideration. If a quote is considered
 * valid, then call callback() to continue the agreement process.
 * @param {messages.Quote} quote
 * @param {function(messages.Agreement)} callback
 * @returns {boolean} Returns whether quote was added
 */
async addQuote(quote, callback) {
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

## Contributing

* [How to contribute](/.github/CONTRIBUTING.md)
* [Commit message format](/.github/COMMIT_FORMAT.md)
* [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)
- [Release versioning guidelines](https://semver.org/)

## See Also
* [RFC](https://github.com/AraBlocks/RFCs/blob/0000-AFP/text/0000-afp.md)
* [ara-identity](https://github.com/AraBlocks/ara-identity)
* [ara-filesystem](https://github.com/AraBlocks/ara-filesystem)
* [ara-network](https://github.com/AraBlocks/ara-network)
* [discovery-swarm](https://github.com/mafintosh/discovery-swarm)
* [duplex streams](https://nodejs.org/api/stream.html#stream_class_stream_duplex)

## License

[LGPL-3.0](/LICENSE)
