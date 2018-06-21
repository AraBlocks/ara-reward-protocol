var PROTO_PATH = './messages.proto'

var grpc = require('grpc');
var routeguide = grpc.load(PROTO_PATH).routeguide;
var client = new routeguide.RFP('localhost:50051', grpc.credentials.createInsecure());

let sow = {
    id: 2,
    workUnit: "MB"
}

client.getQuote(sow, function(err, quote){
    if (err){

    } else {
        console.log("Received Quote: " + quote.cost + ' per ' + quote.sow.workUnit);
        client.finalizeProposal(quote.sow, function(err, farmer){
            console.log("Received Proposal from Farmer: " + farmer.id);
            let contract = {
                id: 103,
                requester: {
                    id: 3
                },
                farmer: farmer
            }

            client.awardContract(contract, function(err, contract){
                console.log("Contract " + contract.id + " signed by farmer " + contract.farmer.id);
            })
        })
    }
})
