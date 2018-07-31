const { StreamProtocol, MSG } = require('../../src/stream-protocol')
const pump = require('pump')
const { createSwarm } = require('ara-network/discovery')
const { messages } = require('ara-farming-protocol')
const ip = require('ip')
const through = require('through')
const { create } = require('ara-filesystem')


const did = 'did:ara:1debc451b5bfba29f46bcbbeb9d4957bed0140b6ba56f8d3826b656992f4cb2a' 
download(did)

async function download (did) {
      // Create a swarm for downloading the content
    const { afs } = await create({did})

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
              
        const { stream } = new RequesterStream(afs, peer, { wait: 100, timeout: 10000 })
        stream.on('error', onerror)
        stream.on(MSG.SOW.str, onsow)
        stream.on(MSG.QUOTE.str, onquote)
        stream.on(MSG.AGREEMENT.str, onagreement)
        stream.on('end', onend)

        return stream
      }

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

    function handleConnection(connection, info){
        console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
    }
}

function idify(host, port){
  return `${host}:${port}`.replace('::ffff:', '')
}

class RequesterStream extends StreamProtocol {
  constructor(afs, peer, opts){
    super(peer, opts)
      this.afs = afs

      process.nextTick((() => {
        const sow = new messages.SOW()
        sow.setId(2)
        sow.setWorkUnit('MB')
        this.sendsow(sow)
      }).bind(this))

  }

  onquote(quote, done){
    super.onquote(quote, done)
    const agreement = new messages.Agreement()
    agreement.setId(2)
    this.sendagreement(agreement, false)
  }

  onsow(sow, done){
    super.onsow(sow, done)
    console.log("Received SOW. Destroying Stream.")
    this.stream.destroy()
  }

  onagreement(agreement, done){
    super.onagreement(agreement, done)
    this.onstartwork(agreement.getId()).bind(this)
  }

  async onstartwork(port){
    console.log("Starting AFS Connection with ", this.peer.host, port)

    const opts = {
        stream: stream.bind(this),
    }
    this.swarm = createSwarm(opts)
    this.swarm.addPeer(this.peer.host, { host: this.peer.host, port: port })

    function stream(peer) {
      const stream = this.afs.replicate({
          upload: false,
          download: true
      })
      stream.once('end', onend.bind(this))

      async function onend(){
          console.log(`Downloaded!`)
          console.log(await this.afs.readdir('.'))
          this.afs.close()
          this.swarm.destroy()
          console.log("Swarm destroyed")
      } 
     return stream
    }
  }
}