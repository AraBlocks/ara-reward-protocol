const PROTO_PATH = './messages.proto'
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide;

function checkQuote(sow){
    let quote = {
        cost: 10,
        sow: sow
    };
    return quote;
}

function getQuote(call, callback){
    console.log('Quote requested.');
    callback(null, checkQuote(call.request));
} 

function checkProposal(sow){
    let farmer = {
        id: 15
    };
    return farmer;
}

function finalizeProposal(call, callback){
    console.log('Received finalized proposal.');
    callback(null, checkProposal(call.request));
}

function checkContract(contract){
    return contract;
}

function awardContract(call, callback){
    console.log('Received contract award.');
    callback(null, checkContract(call.request));
}

function getServer() {
    let server = new grpc.Server();
    server.addService(routeguide.RFP.service, {
      getQuote: getQuote,
      finalizeProposal: finalizeProposal,
      awardContract: awardContract
    });
    return server;
  }
  
  const routeServer = getServer();
  routeServer.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  routeServer.start();


