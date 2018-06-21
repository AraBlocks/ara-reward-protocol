var PROTO_PATH = './messages.proto'
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
var routeguide = protoDescriptor.routeguide;

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
    var server = new grpc.Server();
    server.addService(routeguide.RFP.service, {
      getQuote: getQuote,
      finalizeProposal: finalizeProposal,
      awardContract: awardContract
    });
    return server;
  }
  var routeServer = getServer();
  routeServer.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  routeServer.start();


