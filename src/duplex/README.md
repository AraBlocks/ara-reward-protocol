<img src="https://github.com/arablocks/ara-farming-protocol/blob/master/ara.png" width="30" height="30" /> ara-farming-protocol duplex streams
========

## Implementation

To use AFP with duplex streams, you can wrap a duplex stream with the classes `FarmerConnection` in `src/duplex/farmer-connection` and `RequesterConnection` in `src/duplex/requester-connection`.

### Farming

A simple example for farming via a discovery swarm:

```js
const { ExampleFarmer } = require('./farmer')
const { createSwarm } = require('ara-network/discovery')
const { duplex } = require('ara-farming-protocol')

const did = "617e5e325147ee167b710eb75a6b09181ea103157422c0567a18b001757025a6"

// The application's custom class
const farmer = new ExampleFarmer()

const swarm = createSwarm()
swarm.on('connection', handleConnection)
swarm.join(did)

function handleConnection(connection, info) {
  const requesterConnection = new duplex.RequesterConnection(info, connection, { timeout: 6000 })
  farmer.addRequester(requesterConnection)
}
```

### Requesting

A simple example for requesting via a discovery swarm:

```js
const { ExampleRequester } = require('./requester')
const { createSwarm } = require('ara-network/discovery')
const { duplex } = require('ara-farming-protocol')

const did = "617e5e325147ee167b710eb75a6b09181ea103157422c0567a18b001757025a6"

// The application's custom class
const farmer = new ExampleRequester()

const swarm = createSwarm()
swarm.on('connection', handleConnection)
swarm.join(did)

function handleConnection(connection, info) {
  const farmerConnection = new duplex.FarmerConnection(info, connection, { timeout: 6000 })
  process.nextTick(() => requester.addFarmer(farmerConnection))
}
```