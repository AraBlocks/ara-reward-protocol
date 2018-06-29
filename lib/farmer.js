const messages = require('./proto/messages_pb')
const services = require('./proto/route-guide_grpc_pb')

const grpc = require('grpc')

class Farmer {
  /**
   * Class defining the required working conditions demanded by (and RPC methods of) a Farmer
   * @param {QuoteGenerator} quoteGenerator
   * @param {int64} id
   * @param {Autheticator} autheticator
   */
  constructor(id, quoteGenerator, autheticator) {
    this.quoteGenerator = quoteGenerator
    this.id = id
    this.autheticator = autheticator
  }

  /**
   * Proto RPC method for getting a quote for an SOW
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.Quote)} callback Response callback
   */
  getQuote(call, callback) {
    const sow = call.request
    if (this.autheticator.validatePeer(sow.getRequester())) {
      const quote = this.quoteGenerator.generateQuote(sow)
      callback(null, quote)
    } else {
      callback('Error: Invalid Auth', null)
    }
  }

  /**
   * Proto RPC method for being awarded a contract
   * @param {EventEmitter} call Call object for the handler to process
   * @param {function(Error, messages.Contract)} callback Response callback
   */
  awardContract(call, callback) {
    // TODO Need to validate that sow quote matches Farmer's quote
    const contract = call.request
    if (this.autheticator.validateContract(contract)) {
      // TODO Need to stake for the contract
      callback(null, contract)
    } else {
      callback('Error: Invalid Contract', null)
    }
  }
}

class FarmerServer {
  /**
   * Class containing a Farmer Server (using a gRPC server)
   * @param {Farmer} farmer
   * @param {string} port
   */
  constructor(farmer, port) {
    this.server = this.createServer(farmer)
    this.server.bind(port, grpc.ServerCredentials.createInsecure())
  }

  /**
   * Creates a server for a given farmer
   * @param {Farmer} farmer
   * @returns {grpc.Server}
   */
  createServer(farmer) {
    const server = new grpc.Server()
    server.addService(services.RFPService, {
      getQuote: farmer.getQuote.bind(farmer),
      awardContract: farmer.awardContract.bind(farmer)
    })
    return server
  }

  start() {
    this.server.start()
  }
}

/**
 * Creates a Farmer Server (using gRPC) and broadcasts its availablity to work
 * @param {Farmer} farmer
 * @param {string} port
 */
function broadcastFarmer(farmer, port) {
  const farmerServer = new FarmerServer(farmer, port)
  farmerServer.start()
}

/**
 * Connects to a Farmer Server and returns the client connection
 * @param {string} port
 */
function connectToFarmer(port) {
  return new services.RFPClient(port, grpc.credentials.createInsecure())
}

module.exports = { Farmer, broadcastFarmer, connectToFarmer }
