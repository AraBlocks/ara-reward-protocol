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
const client = new routeguide.RFP('localhost:50051', grpc.credentials.createInsecure());

function handleQuote(err, quote){
    if (err){

    } else {
        console.log("Received Quote: " + quote.cost + ' per ' + quote.sow.workUnit);
        client.finalizeProposal(quote.sow, handleFinalProposal);
    }
}

function handleFinalProposal(err, farmer){
    if (err){

    } else {
        console.log("Received Proposal from Farmer: " + farmer.id);
        let contract = {
            id: 103,
            requester: {
                id: 3
            },
            farmer: farmer
        };
    
        client.awardContract(contract, handleSignedContract);
    }
}

function handleSignedContract(err, contract){
    if (err){

    } else {
        console.log("Contract " + contract.id + " signed by farmer " + contract.farmer.id);
    }
}

let sow = {
    id: 2,
    workUnit: "MB"
}

client.getQuote(sow, handleQuote);
