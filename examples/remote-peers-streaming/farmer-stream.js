const { StreamProtocol, MSG } = require('../../src/stream-protocol')
const pump = require('pump')
const { createSwarm } = require('ara-network/discovery')
const { messages } = require('ara-farming-protocol')
const ip = require('ip')
const through = require('through')
const { create } = require('ara-filesystem')
const fp = require('find-free-port')

const dids = [
  'ab5867eeaeacebda573ae252331f4b1b298fd9a8ca883f2b28bad5764f10f99c',
  '5a0ca463a488b4d3d85ea243087043e1b87b35eae8e15c86c99c4b4d9c14179b'
]

for (let i = 0; i < dids.length; i++){
  broadcast(dids[i])
}

async function broadcast(did) {
  console.log("Broadcasting: ", did)

  // Create a swarm for uploading the content
  const { afs } = await create({ did })

  // Join the discovery swarm for the requested content
  const opts = {
    stream,
  }
  const swarm = createSwarm(opts)
  swarm.on('connection', handleConnection)
  swarm.join(did)

  function stream(peer) {
    const us = idify(ip.address(), this.address().port)
    const them = idify(peer.host, peer.port)

    if (us === them) {
      return through()
    }

    const { stream } = new FarmerStream(afs, peer, { wait: 100, timeout: 10000 })
    stream.on('error', onerror)
    stream.on(MSG.SOW.str, onsow)
    stream.on(MSG.QUOTE.str, onquote)
    stream.on(MSG.AGREEMENT.str, onagreement)
    stream.on('end', onend)

    function onsow(sow, peer) {
      console.log('sow:', sow.getId(), peer.host, peer.port)
    }

    function onquote(quote, peer) {
      console.log('quote:', quote.getPerUnitCost(), peer.host, peer.port)
    }

    function onagreement(agreement, peer) {
      console.log('agreement:', agreement.getId(), peer.host, peer.port)
    }

    function onend() {
      console.log('end')
    }

    function onerror(err) {
      console.error('error:', err.message)
      console.error(err.stack)
    }

    return stream
  }

  function handleConnection(connection, info) {
    console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
  }
}

function idify(host, port) {
  return `${host}:${port}`.replace('::ffff:', '')
}

class FarmerStream extends StreamProtocol {
  constructor(afs, peer, opts) {
    super(peer, opts)
    this.afs = afs
    this.swarm = null
  }

  onsow(sow, done) {
    super.onsow(sow, done)
    const quote = new messages.Quote()
    quote.setId(5)
    quote.setPerUnitCost(10)
    quote.setSow(sow)
    this.sendquote(quote)
  }

  async onagreement(agreement, done) {
    super.onagreement(agreement, done)
    fp(Math.floor(30000 * Math.random()), ip.address()).then(([ port ]) => {
      console.log('Listening on port ', port)
      agreement.setId(port) // HACK
      this.sendagreement(agreement, false)
      this.startwork(port)
    })
  }

  async startwork(port) {
    const opts = {
      stream: stream.bind(this)
    }
    this.swarm = createSwarm(opts)
    this.swarm.on('connection', handleConnection)
    this.swarm.listen(port)

    function stream(peer) {
      const stream = this.afs.replicate({
        upload: true,
        download: false
      })
      stream.once('end', onend.bind(this))

      function onend() {
        console.log('Uploaded!')
        this.swarm.destroy()
      }

      return stream
    }

    function handleConnection(connection, info) {
      console.log(`Peer connected: ${info.host} on port: ${info.port}`)
    }
  }
}
