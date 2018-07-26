const { randomBytes } = require('crypto')
const duplexify = require('duplexify')
const through2 = require('through2')
const through = require('through')
const varint = require('varint')
const pump = require('pump')
const messages = require('./proto/messages_pb')

const MSG = {
  SOW       : { head: 1 << 1, str: 'sow' },
  QUOTE     : { head: 2 << 1, str: 'quote'},
  AGREEMENT : { head: 3 << 1, str: 'agreement'},

  encode : function (head, data) {
    head = Buffer.from(varint.encode(head))
    return Buffer.concat([ head, data ])
  },

  decode : function (chunk) {
    const head = varint.decode(chunk, 0)
    const data = chunk.slice(varint.decode.bytes)
    return { head, data }
  }
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
    console.log(`Sending to ${this.peer.host}`)
    this.timeout = setTimeout(this.ontimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.SOW.head, sow.serializeBinary()))
  }

  sendquote(quote) {
    this.timeout = setTimeout(this.ontimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.QUOTE.head, quote.serializeBinary()))
  }

  sendagreement(agreement) {
    this.timeout = setTimeout(this.ontimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.AGREEMENT.head, agreement.serializeBinary()))
  }

  ontimeout() {
    console.log("timeout!")
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
    console.log("On receive")
    const { head, data } = MSG.decode(chunk)
    clearTimeout(this.timeout)
    switch (head) {
      case MSG.SOW.head: this.onsow(messages.SOW.deserializeBinary(data), done); break
      case MSG.QUOTE.head: this.onquote(messages.Quote.deserializeBinary(data), done); break
      case MSG.AGREEMENT.head: this.onagreement(messages.Agreement.deserializeBinary(data), done); break
      default: throw new TypeError('Unknown message type: '+ head)
    }
  }
}

module.exports = {
  StreamProtocol,
  MSG
}