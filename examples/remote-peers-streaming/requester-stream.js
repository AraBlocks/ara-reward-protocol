const { StreamProtocol, MSG } = require('../../src/stream-protocol')
const pump = require('pump')
const { createSwarm } = require('ara-network/discovery')
const { messages } = require('ara-farming-protocol')
const ip = require('ip')
const through = require('through')
const { create } = require('ara-filesystem')


const did = 'did:ara:3abc0eedd6f9b7f44c06a182b70c2c65b9faf89ddfdbbe1221b2395d0a7c4a08' 
download(did)

async function download (did) {
    // Create a swarm for downloading the content
    const { afs } = await create({did})
    const peerMap = new Map()

    // Join the discovery swarm for the requested content
    const opts = {
        stream: requesterstream,
        connect: connect
    }
    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)
    swarm.join(did)

    function connect(connection, wire){
        connection.on(MSG.AGREEMENT.str, () => {
            console.log("Agreement reached. Starting AFS pipe.")
            pump(wire, afsstream(), wire)
        })
        pump(wire, connection, wire)
    }

    function requesterstream(peer) {
        const us = idify(ip.address(), this.address().port)
        const them = idify(peer.host, peer.port)
      
        if (us === them || peerMap.has(them)) {
          return through()
        }
      
        peerMap.set(them, true)
        
        const { stream } = new RequesterStream(peer, { wait: 100, timeout: 10000 })
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

   function afsstream() {
       const stream = afs.replicate({
            upload: false,
            download: true
       })
       stream.once('end', onend)

       async function onend(){
            console.log(await afs.readdir('.'))
            console.log(`Downloaded!`)
            afs.close()
            swarm.destroy()
            console.log("Swarm destroyed")
        }

       return stream
   }

    async function handleConnection(connection, info){
        console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
        try {
            await afs.download('.')
        }
        catch (err) {
            console.log(`Error: ${err}`)
        }
    }
}

function idify(host, port){
  return `${host}`.replace('::ffff:', '')
}

class RequesterStream extends StreamProtocol {
  constructor(peer, opts){
    super(peer, opts)

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
    this.sendagreement(agreement)
  }

  onsow(sow, done){
    super.onsow(sow, done)
    console.log("Received SOW. Destroying Stream.")
    this.stream.destroy()
  }
}