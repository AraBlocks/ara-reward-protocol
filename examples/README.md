<img src="https://github.com/arablocks/ara-module-template/blob/master/ara.png" width="30" height="30" /> ara-farming-protocol examples
========

This folder contains a set of examples intended to demonstrate usage of the farming protocol.

## Requirements

The examples require you to have:
- [AID](https://github.com/AraBlocks/ara-identity)
- [AFS](https://github.com/AraBlocks/ara-filesystem)
- [ANN](https://github.com/AraBlocks/ara-network)
- [truffle](https://truffleframework.com/)
- An accessible blockchain, such as [Ganache](https://truffleframework.com/ganache)

## Setup

Note: as ara-farming-protocol is not yet on npm, you may need to run the following commands prior to running an example:

```
$ npm link
$ npm link ara-farming-protocol
```

 Prior to running any examples, run the setup bash script:

```
$ cd examples/setup
$ ./setup.sh
```

This script will do the following:
1. Migrate the example farming contract
2. Create AIDs for the farmer and the requester
3. Create an AFS with sample content
4. Create an ANK for encryption
4. Populate the `/examples/constants.js` with the corresponding information

You will need to replace the wallet addresses in `examples/constants.js` with those in your blockchain.

## Examples

### AFS Replication with Streams

This example shows afs replication with AFP via communication over duplex streams. This example can optionally using sub-networks with encryption via [Ara Network Keys](https://github.com/AraBlocks/ara-network).

The farmer example broadcasts the ability to replicate a set of AFSes for a certain price per GB. The requester example finds these farmers that have a specific AFS and communicates via duplex stream to determine the cost of replication. It uses the MaxCostMatcher to select a subset of peers. 

#### Enabling Encryption / Farmer sub-networks

To enable sub-network encryption, the requester should distribute the `examples/keys.pub` file to the farmer's computer. Then, uncomment the line in `remote-farmer.js`:
```
const keypath = networkPublicKeypath
```
and uncomment the line in `remote-requester.js`:
```
const keypath = networkSecretKeypath
```

#### Running the example

On the farmer's computer/terminal:
```
$ node examples/afs-replication/duplex/remote-farmer.js
```

On the requester's computer/terminal:
```
$ node examples/afs-replication/duplex/remote-requester.js
```

### AFS Replication with gRPC

The requester example finds peers on the discovery channel did:ara:desiredContent, then connects to each peer on an example port 50051 to determine costs. It uses the MaxCostMatcher to determine peers. The farmer example broadcasts on example port 19000 on discovery channel did:ara:desiredContent, and on the example farming port 50051.

On the farmer's computer/terminal:

```
$ node examples/afs-replication/grpc/remote-farmer.js
```

On the requester's computer/terminal:

```
$ node examples/afs-replication/grpc/remote-requester.js
```