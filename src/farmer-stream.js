const { randomBytes } = require('crypto')
const duplexify = require('duplexify')
const through2 = require('through2')
const through = require('through')
const varint = require('varint')
const pump = require('pump')
const { createSwarm } = require('ara-network/discovery')
const messages = require('./proto/messages_pb')

const swarm = createSwarm({ id: "farmer", stream: farmerStream })
swarm.join('sow-quote')

const swarm2 = createSwarm({ id: "requester", stream: requesterStream })
swarm2.join('sow-quote')

function farmerStream(peer) {
  // make sure this wasn't with ourselves (:
  console.log("NEW PEER: ",peer)
  if (!Boolean(peer.id) || Boolean(Buffer.compare(peer.id, swarm.id))) {
    return through()
  }

  const { stream } = new FarmerStream(peer, { wait: 100, timeout: 10000 })
  stream.on('error', onerror)
  stream.on(MSG.SOW.str, onsow)
  stream.on(MSG.QUOTE.str, onquote)
  stream.on(MSG.AGREEMENT.str, onagreement)
  stream.on('end', onend)
  return stream
}

function requesterStream(peer) {
  // make sure this wasn't with ourselves (:
  if (peer.id) console.log("NEW PEER: ",peer.id, swarm.id, Buffer.compare(peer.id, swarm.id))
  if (!Boolean(peer.id) || Boolean(Buffer.compare(peer.id, swarm.id))) {
    return through()
  }

  const { stream } = new FarmerStream(peer, { wait: 100, timeout: 10000 })
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


const MSG = {
  SOW       : { head: 1 << 1, str: 'sow' },
  QUOTE     : { head: 2 << 1, str: 'quote'},
  AGREEMENT : { head: 3 << 1, str: 'agreement'}
}

class StreamProtocol {

  constructor (peer, opts) {
    this.peer = peer
    this.opts = opts

    const receiver = through2(this.onreceive.bind(this))
    const sender = through2()
    this.stream = duplexify(receiver, sender)
    this.stream.once('end', this.onend)
    this.stream.once('close', this.onclose)

    this.timeout = null
    this.ended = false
  }

  sendsow(sow) {
    this.timeout = setTimeout(this.ontimeout, this.opts.timeout)
    this.stream.write(this.encode(MSG.SOW.head, sow.serializeBinary()))
  }

  sendquote(quote) {
    this.timeout = setTimeout(this.ontimeout, this.opts.timeout)
    this.stream.write(this.encode(MSG.QUOTE.head, quote.serializeBinary()))
  }

  sendagreement(agreement) {
    this.timeout = setTimeout(this.ontimeout, this.opts.timeout)
    this.stream.write(this.encode(MSG.AGREEMENT.head, agreement.serializeBinary()))
  }

  encode(type, data) {
    const head = Buffer.from(varint.encode(type))
    return Buffer.concat([ head, data ])
  }

  ontimeout() {
    this.stream.destroy(new Error('Protocol stream did timeout.'))
  }

  onclose() {
    clearTimeout(this.timeout)
  }

  onend() {
    clearTimeout(this.timeout)
  }

  onsow(sow, done) {
    done(null)
    this.stream.emit(MSG.SOW.str, sow, this.peer)
  }

  onquote(quote, done) {
    done(null)
    this.stream.emit(MSG.QUOTE.str, quote, this.peer)
  }

  onagreement(agreement, done) {
    done(null)
    this.stream.emit(MSG.AGREEMENT.str, agreement, this.peer)
  }

  onreceive(chunk, enc, done) {
    const head = varint.decode(chunk, 0)
    const data = chunk.slice(varint.decode.bytes)
    clearTimeout(this.timeout)
    switch (head) {
      case MSG.SOW.head: this.onsow(messages.SOW.deserializeBinary(data), done); break
      case MSG.QUOTE.head: this.onquote(messages.Quote.deserializeBinary(data), done); break
      case MSG.AGREEMENT.head: this.onagreement(messages.Agreement.deserializeBinary(data), done); break
      default: throw new TypeError('Unknown message type: '+ head)
    }
  }
}

class RequesterStream extends StreamProtocol {
  constructor(peer, opts){
    super(peer, opts)

    if (peer.initiator) {
      process.nextTick(() => {
        const sow = new messages.SOW()
        sow.setId(2)
        sow.setWorkUnit('MB')
        this.sendsow(sow)
      })
    }
  }
}

class FarmerStream extends StreamProtocol {
  constructor(peer, opts){
    super(peer, opts)
  }

  onsow(sow, done){
    super.onsow(sow, done)
    const quote = new messages.Quote()
    quote.setId(5)
    quote.setPerUnitCost(10)
    quote.setSow(sow)
    this.sendquote(quote)
  }
}
