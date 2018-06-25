const { grpc, routeguide } = require('./proto');

/*
    Class defining the required working conditions demanded by (and RPC methods of) a Farmer
*/
class Farmer {
    constructor(price, id, autheticator){
        this.price = price;
        this.id = id;
        this.autheticator = autheticator;
    }
    
    // Proto RPC method for getting a quote for an SOW
    getQuote(call, callback){
        console.log('Farmer [' + this.id + ']: Quote request received.');
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
        console.log('Farmer [' + this.id + ']: Final proposal received.');
        callback(null, this.checkProposal(call.request));
    }

    checkProposal(sow){
        // TODO Need to validate that sow quote matches Farmer's quote
        let sig = {
            id: this.id
        };
        return sig;
    }
    
    // Proto RPC method for being awarded a contract
    awardContract(call, callback){
        console.log('Farmer [' + this.id + ']: Final contract received.');
        callback(null, this.checkContract(call.request));
    }

    checkContract(contract){
        // TODO Need to validate that sow quote matches Farmer's quote
        if (this.autheticator.validateContract(contract))
        {
            // TODO Need to stake for the contract
            return contract;
        }
        else {
            return "Invalid Authentication";
        } 
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
function broadcastFarmer(farmer, port){
    let farmerServer = new FarmerServer(farmer, port);    
    farmerServer.start();
}

/*
    Connects to a Farmer Server and returns the client connection
*/
function connectToFarmer(port){
    return new routeguide.RFP(port, grpc.credentials.createInsecure());
}

module.exports = {Farmer, broadcastFarmer, connectToFarmer};