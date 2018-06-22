const { grpc, routeguide } = require('./proto');

/*
    Class defining the required working conditions demanded by a Farmer
*/
class Farmer {
    constructor(price, id){
        this.price = price;
        this.id = id;
    }
    
    // Proto RPC method for getting a quote for an SOW
    getQuote(call, callback){
        console.log('Farmer [' + this.id + '] quote requested.');
        callback(null, this.checkQuote(call.request));
    } 

    checkQuote(sow){
        let quote = {
            cost: this.price,
            sow: sow
        };
        return quote;
    }
    
    // Proto RPC method for finalizing a proposal for work
    finalizeProposal(call, callback){
        console.log('Farmer [' + this.id + '] received finalized proposal.');
        callback(null, this.checkProposal(call.request));
    }

    checkProposal(sow){
        let sig = {
            id: this.id
        };
        return sig;
    }
    
    // Proto RPC method for being awarded a contract
    awardContract(call, callback){
        console.log('Farmer [' + this.id + '] received contract award.');
        callback(null, this.checkContract(call.request));
    }

    checkContract(contract){
        return contract;
    }
}

/*
    Class containing a Farmer Server (using a gRPC server)
*/
class FarmerServer {
    constructor(farmer, port){
        this.server = this.createServer(farmer);
        this.server.bind(port, grpc.ServerCredentials.createInsecure());
    }

    createServer(farmer) {
        let server = new grpc.Server();
        server.addService(routeguide.RFP.service, {
          getQuote: farmer.getQuote.bind(farmer),
          finalizeProposal: farmer.finalizeProposal.bind(farmer),
          awardContract: farmer.awardContract.bind(farmer)
        });
        return server;
      }

    start(){
        this.server.start();
    }
}

/*
    Creates a Farmer Server (using gRPC) and broadcasts its availablity to work
*/
function broadcastFarmer(port, price, id){
    let farmer = new Farmer(price, id);
    let farmerServer = new FarmerServer(farmer, port);
    
    farmerServer.start();
}

/*
    Connects to a Farmer Server and returns the client connection
*/
function connectToFarmer(port){
    return new routeguide.RFP(port, grpc.credentials.createInsecure());
}

module.exports = {broadcastFarmer, connectToFarmer};