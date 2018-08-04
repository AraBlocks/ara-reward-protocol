const { StreamProtocol, MSG } = require('../../src/stream-protocol')
const pump = require('pump')
const { createSwarm } = require('ara-network/discovery')
const { messages } = require('ara-farming-protocol')
const ip = require('ip')
const through = require('through')
const { create } = require('ara-filesystem')
const pify = require('pify')
const cliProgress = require('cli-progress')

const did = 'ab5867eeaeacebda573ae252331f4b1b298fd9a8ca883f2b28bad5764f10f99c'
//const did = '5a0ca463a488b4d3d85ea243087043e1b87b35eae8e15c86c99c4b4d9c14179b' 
download(did)

async function download (did) {
    const { afs } = await create({did})

    let downloaded = false
    afs.on('content', onupdate)
    //afs.on('update', onupdate) // TODO: test this

    const contentSwarm = createContentSwarm(afs)
    contentSwarm.on('close', onend)

    const farmerSwarm = createFarmerSwarm(did, contentSwarm)

    async function onupdate(){
      const feed = afs.partitions.resolve(afs.HOME).content
      if (feed){
        const pBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic)
        let pStarted = false

        feed.on('download', () => {
          if (!feed.length) return
          if (!pStarted) {
            pStarted = true
            pBar.start(feed.length, 0)
          }
          pBar.update(feed.downloaded())

          // const downloaded = feed.downloaded()
          // const perc = 100 * downloaded / total

        })
        feed.once('sync', () => {
          pBar.stop()
        })
        feed.once('sync', onend)
      }
    }
    
    async function onend(){
      if (!downloaded) {
        downloaded = true
        console.log(await afs.readdir('.'))
        console.log(`Downloaded!`)
        afs.close()
          
        if (contentSwarm) contentSwarm.destroy()
        if (farmerSwarm) farmerSwarm.destroy()

        console.log("Swarm destroyed")
      }
    }  
}

function idify(host, port){
  return `${host}:${port}`.replace('::ffff:', '')
}


// Creates a swarm of farmers who are broadcasting a piece of content
function createFarmerSwarm(did, contentSwarm){
  const streamMap = new Map()

  const opts = {
      stream,
  }
  const swarm = createSwarm(opts)
  swarm.on('connection', handleConnection)

  swarm.join(did)


  function stream(peer) {
    const us = idify(ip.address(), this.address().port)
    const them = idify(peer.host, peer.port)
  
    if (us === them || 'utp' === peer.type) {
      return through()
    }
    
    const rStream = new RequesterStream(peer, { 
      wait: 100, 
      timeout: 10000, 
      swarm: contentSwarm
    })

    streamMap.set(them, rStream)

    rStream.stream.on('close', () => {
      streamMap.delete(them)
    })

    rStream.stream.once('end', () => {
      streamMap.delete(them)
    })

    return rStream.stream
  }

  function onerror(err) {
    console.error('error:', err.message)
    console.error(err.stack)
  }

  function handleConnection(connection, info){
    console.log(`Farmer Swarm: Peer connected: ${idify(info.host, info.port)}`)
  }

  return swarm
}

// Creates a private swarm for downloading a piece of content
function createContentSwarm(afs){
  const opts = {
      stream,
  }

  swarm = createSwarm(opts)
  swarm.on('connection', handleConnection)

  function stream(peer) {
    const stream = afs.replicate({
        upload: false,
        download: true,
        live: false
    })

    stream.once('end', () => {
      console.log("Replicate stream ended")
      swarm.destroy()
    })

    return stream
  } 

  async function handleConnection(connection, info){
    console.log(`Content Swarm: Peer connected: ${idify(info.host, info.port)}`)
  }

  return swarm
}

class RequesterStream extends StreamProtocol {
  constructor(peer, opts){
    super(peer, opts)
      this.swarm = opts.swarm

      process.nextTick((() => {
        const sow = new messages.SOW()
        sow.setId(2)
        sow.setWorkUnit('MB')
        this.sendsow(sow)
      }).bind(this))
  }

  onquote(quote, done){
    super.onquote(quote, done)
    console.log('quote:', quote.getPerUnitCost(), idify(this.peer.host, this.peer.port))
    const agreement = new messages.Agreement()
    agreement.setId(2)
    this.sendagreement(agreement, false)
  }

  onsow(sow, done){
    super.onsow(sow, done)
    console.log("Received SOW. Destroying Stream.")
    if (this.stream) this.stream.destroy()
  }

  onagreement(agreement, done){
    super.onagreement(agreement, done)
    console.log('agreement:', agreement.getId(), idify(this.peer.host, this.peer.port))
    this.onstartwork(agreement.getId())
  }

  onstartwork(port){
    console.log("Starting AFS Connection with ", idify(this.peer.host, port))
    this.swarm.addPeer(this.peer.host, { host: this.peer.host, port: port })
  }
}