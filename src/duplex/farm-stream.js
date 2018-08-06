const { StreamProtocol } = require('./stream-protocol')

class FarmStream extends StreamProtocol {
    constructor(peer, opts) {
      super(peer, opts)
    }

    onQuote(quote, done){
      super.onQuote(quote, done)
      console.log("Received Quote. Destroying Stream.")
      this.stream.destroy()
    }
  }

  exports = {
      FarmStream
  }