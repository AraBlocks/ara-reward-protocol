<img src="https://github.com/arablocks/ara-farming-protocol/blob/master/ara.png" width="30" height="30" /> ara-farming-protocol examples
========

## Requirements

- [ara-identity](https://github.com/AraBlocks/ara-identity)
- [ara-filesystem](https://github.com/AraBlocks/ara-filesystem)
- [ara-network](https://github.com/AraBlocks/ara-network)
- [truffle](https://truffleframework.com/)
- An accessible blockchain, such as [Ganache](https://truffleframework.com/ganache)

## Setup

1. Run an archiver/resolver

2. maybe also speak to having the blockchain running?

2.
```sh
$ cd examples/setup
$ ./SETUP.sh
```

This script will do the following:
1. Migrate the example farming contract
2. Create AIDs for the farmer and the requester
3. Create an AFS with sample content
4. Create an ANK for encryption
4. Populate the `/examples/constants.js` with the corresponding information

**Important**: After running `./SETUP.sh`, replace the wallet addresses in `examples/constants-template.js` with those in your blockchain.

## Examples

### AFS Replication with Duplex Streams

Should say this example requires two machines to run


This example shows AFS replication with AFP via communication over duplex streams. This example can optionally use a sub-network with encryption via [Ara Network Keys](https://github.com/AraBlocks/ara-network).

The farmer example broadcasts the ability to replicate an AFS for a certain price per GB. The requester example finds these farmers that have the specific AFS and communicates via duplex stream to determine the cost of replication. It uses the `MaxCostMatcher` to select a subset of peers.

#### Usage

On the farmer's computer/terminal:
```
$ node examples/afs-replication/remote-farmer.js
```

On the requester's computer/terminal:
```
$ node examples/afs-replication/remote-requester.js
```

To enable subnet encryption, add the argument `--subnet` to the above commands.


Can we show the print out of what happens when one runs these commands?  I know my setup is not correct, but the remote-requester.js fails silently.  More print statements please.