const duplexify = require('duplexify')
const through2 = require('through2')
const varint = require('varint')
const messages = require('../proto/messages_pb')
require('events').EventEmitter.defaultMaxListeners = 15

const MSG = {
  SOW       : { head: 1 << 1, str: 'sow' },
  QUOTE     : { head: 2 << 1, str: 'quote'},
  AGREEMENT : { head: 3 << 1, str: 'agreement'},
  REWARD    : { head: 4 << 1, str: 'reward'},

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

    this.receiver = through2(this.onReceive.bind(this))
    this.sender = through2()
    this.stream = duplexify(this.receiver, this.sender)
    this.stream.once('end', this.onEnd)
    this.stream.once('close', this.onClose)

    this.timeout = null
    this.ended = false
  }

  async sendSow(sow) {
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.SOW.head, sow.serializeBinary()))
  }

  async sendQuote(quote) {
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.QUOTE.head, quote.serializeBinary()))
  }

  async sendAgreement(agreement) {
    this.timeout = setTimeout(this.onTimeout.bind(this), this.opts.timeout)
    this.stream.push(MSG.encode(MSG.AGREEMENT.head, agreement.serializeBinary()))
  }

  async sendReward(reward){
    this.stream.push(MSG.encode(MSG.REWARD.head, reward.serializeBinary()))
    // TODO: timer?
  }

  async onTimeout() {
    console.log("SO much timeout!", this.peer)
    if (this.stream) this.stream.destroy(new Error('Protocol stream did timeout.'))
  }

  async onClose() {
    clearTimeout(this.timeout)
    if (this.stream) this.stream.destroy()
  }

  async onEnd() {
    clearTimeout(this.timeout)
    if (this.stream) this.stream.destroy()
  }

  async onSow(sow, done) {
    done(null)
    console.log('sow:', sow.getId(), this.peer.host, this.peer.port)
    this.stream.emit(MSG.SOW.str, sow, this.peer)
  }

  async onQuote(quote, done) {
    done(null)
    console.log('quote:', quote.getId(), this.peer.host, this.peer.port)
    this.stream.emit(MSG.QUOTE.str, quote, this.peer)
  }

  async onAgreement(agreement, done) {
    done(null)
    console.log('agreement:', agreement.getId(), this.peer.host, this.peer.port)
    this.stream.emit(MSG.AGREEMENT.str, agreement, this.peer)
  }

  async onReward(reward, done) {
    done(null)
    console.log('reward:', reward.getId(), this.peer.host, this.peer.port)
    this.stream.emit(MSG.REWARD.str, reward, this.peer)
  }

  onReceive(chunk, enc, done) {
    try {
      const { head, data } = MSG.decode(chunk)
      clearTimeout(this.timeout)
      switch (head) {
        case MSG.SOW.head: this.onSow(messages.SOW.deserializeBinary(data), done); break
        case MSG.QUOTE.head: this.onQuote(messages.Quote.deserializeBinary(data), done); break
        case MSG.AGREEMENT.head: this.onAgreement(messages.Agreement.deserializeBinary(data), done); break
        case MSG.REWARD.head: this.onReward(messages.Reward.deserializeBinary(data), done); break
        default: throw new TypeError('Unknown message type: '+ head)
      }
    }
    catch (e) {
      console.log("Error: on receive")
    }
  }

  close(){
    if (this.stream) this.stream.emit('close')
  }
}



module.exports = {
  StreamProtocol,
  MSG
}