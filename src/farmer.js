const messages = require('../proto/messages_pb')
const services = require('../proto/route_guide_grpc_pb')

const grpc = require('grpc')

class Farmer {
  /**
   * Class defining the required working conditions demanded by (and RPC methods of) a Farmer
   * @param {Quoter} quoter
   * @param {int64} id
   * @param {Autheticator} autheticator
   */
  constructor(quoter, id, autheticator) {
    this.quoter = quoter
    this.id = id
    this.autheticator = autheticator
  }

  /**
   * Proto RPC method for getting a quote for an SOW
   * @param {*} call
   * @param {*} callback
   */
  getQuote(call, callback) {
    console.log(`Farmer [${this.id}]: Quote request received.`)
    const sow = call.request
    if (this.autheticator.validatePeer(sow.getRequester())) {
      const quote = this.quoter.generateQuote(sow)
      callback(null, quote)
    }
  }

  /**
   * Proto RPC method for being awarded a contract
   * @param {*} call
   * @param {*} callback
   */
  awardContract(call, callback) {
    console.log(`Farmer [${this.id}]: Contract received.`)
    // TODO Need to validate that sow quote matches Farmer's quote
    const contract = call.request
    if (this.autheticator.validateContract(contract)) {
      // TODO Need to stake for the contract
      callback(null, contract)
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
