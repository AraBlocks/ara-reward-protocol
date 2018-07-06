const services = require('./proto/route-guide_grpc_pb');
const grpc = require('grpc');
const { Farmer } = require('./farmer');

class FarmerServer {
  /**
   * Class containing a Farmer Server (using a gRPC server)
   * @param {Farmer} farmer
   * @param {string} port
   */
  constructor(farmer, port) {
    this.server = this.createServer(farmer);
    this.server.bind(port, grpc.ServerCredentials.createInsecure());
  }

  /**
   * Creates a server for a given farmer
   * @param {Farmer} farmer
   * @returns {grpc.Server}
   */
  createServer(farmer) {
    const server = new grpc.Server();
    server.addService(services.RFPService, {
      getQuote: farmer.handleQuoteRequest.bind(farmer),
      awardContract: farmer.handleContractAward.bind(farmer),
      deliverReward: farmer.handleRewardDelivery.bind(farmer)
    });
    return server;
  }

  start() {
    this.server.start();
  }
}

/**
 * Creates a Farmer Server (using gRPC) and broadcasts its availablity to work
 * @param {Farmer} farmer
 * @param {string} port
 */
function broadcastFarmer(farmer, port) {
  const farmerServer = new FarmerServer(farmer, port);
  farmerServer.start();
}

/**
 * Connects to a Farmer Server and returns the client connection
 * @param {string} port
 * @returns {services.RFPClient}
 */
function connectToFarmer(port) {
  return new services.RFPClient(port, grpc.credentials.createInsecure());
}

module.exports = {
  FarmerServer,
  broadcastFarmer,
  connectToFarmer
};
