const messages = require('./proto/messages_pb')
const services = require('./proto/route_guide_grpc_pb')

const grpc = require('grpc')

/*
    Class defining the required working conditions demanded by (and RPC methods of) a Farmer
*/
class Farmer {
  constructor(quoter, id, autheticator) {
    this.quoter = quoter
    this.id = id
    this.autheticator = autheticator
  }

  // Proto RPC method for getting a quote for an SOW
  getQuote(call, callback) {
    console.log(`Farmer [${this.id}]: Quote request received.`)
    const quote = this.quoter.generateQuote(call.request)
    callback(null, quote)
  }

  // Proto RPC method for being awarded a contract
  awardContract(call, callback) {
    console.log(`Farmer [${this.id}]: Contract received.`)
    // TODO Need to validate that sow quote matches Farmer's quote
    let contract = call.request
    if (this.autheticator.validateContract(contract)) {
      // TODO Need to stake for the contract
    } else {
      contract = 'Invalid Authentication'
    }
    callback(null, contract)
  }
}

/*
    Class containing a Farmer Server (using a gRPC server)
*/
class FarmerServer {
  constructor(farmer, port) {
    this.server = this.createServer(farmer)
    this.server.bind(port, grpc.ServerCredentials.createInsecure())
  }

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

/*
    Creates a Farmer Server (using gRPC) and broadcasts its availablity to work
*/
function broadcastFarmer(farmer, port) {
  const farmerServer = new FarmerServer(farmer, port)
  farmerServer.start()
}

/*
    Connects to a Farmer Server and returns the client connection
*/
function connectToFarmer(port) {
  return new services.RFPClient(port, grpc.credentials.createInsecure())
}

module.exports = { Farmer, broadcastFarmer, connectToFarmer }
