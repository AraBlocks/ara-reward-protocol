<img src="https://github.com/AraBlocks/ara-module-template/blob/master/ara.png" width="30" height="30" /> ara-reward-protocol hypercore
========

## Implementation

To use ARP with hypercore-protocol, you can wrap a hypercore feed & stream with the classes `FarmerConnection` in `src/hypercore/farmer-connection` and `RequesterConnection` in `src/hypercore/requester-connection`.

### Farming

A simple example for farming via a hyperswarm:

```js
const { hypercore: { RequesterConnection } } = require('ara-reward-protocol')
const { ExampleFarmer } = require('./farmer')
const createSwarm = require('@hyperswarm/network')
const hypercore = require('hypercore')

const did = Buffer.from("617e5e325147ee167b710eb75a6b09181ea103157422c0567a18b001757025a6", 'hex')

// The application's custom class
const farmer = new ExampleFarmer()
const core = hypercore()

const swarm = createSwarm()
swarm.on('connection', handleConnection)
swarm.join(did, { announce: true })

function handleConnection(connection, details) {
    const stream = core.replicate({ download: false, upload: true })
    const feed = stream.feed(core.discoveryKey)

    stream.once('handshake', () => {
      const requesterConnection = new RequesterConnection(details, stream, feed, { timeout: 6000 })
      farmer.addRequester(requesterConnection)
    })

    connection.pipe(stream).pipe(connection)
}
```

### Requesting

A simple example for requesting via a hyperswarm:

```js
const { hypercore: { FarmerConnection } } = require('ara-reward-protocol')
const { ExampleRequester } = require('./requester')
const createSwarm = require('@hyperswarm/network')
const hypercore = require('hypercore')

const did = Buffer.from("617e5e325147ee167b710eb75a6b09181ea103157422c0567a18b001757025a6", 'hex')

// The application's custom class
const farmer = new ExampleRequester()
const core = hypercore()

const swarm = createSwarm()
swarm.on('connection', handleConnection)
swarm.join(did, { lookup: true })

function handleConnection(connection, details) {
    const stream = core.replicate({ download: true, upload: false })
    const feed = stream.feed(core.discoveryKey)

    stream.once('handshake', () => {
      const farmerConnection = new FarmerConnection(details, stream, feed, { timeout: 6000 })
      process.nextTick(() => requester.addFarmer(farmerConnection))
    })

    connection.pipe(stream).pipe(connection)
}
```