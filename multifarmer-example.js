const { broadcastFarmer, connectToFarmer } = require('./farmer');
const { RequestArbiter } = require('./requester');
const { Matcher } = require('./matcher');

/*
    Generates and connects to a number of Farmer Servers
*/
function generateFarmerConnections(count){
    let sPort = 50051;

    let farmers = [];
    for (i = 0; i < count; i++){
        let port = 'localhost:' + (sPort + i).toString();
        let price = 5 + Math.floor(Math.random() * 10) + 1;
        
        // Generate Servers
        broadcastFarmer(port, price, i);

        // Generate Client Connections
        let connection = connectToFarmer(port);
        farmers.push(connection);
    }
    return farmers;
}

/* 
    Example: generate and connect to 50 farmers, then hire up to 
    7 farmers who charge <= 10 Ara per MB
*/
let sow = {
    id: 2,
    workUnit: "MB"
}
let farmers = generateFarmerConnections(50);
let matcher = new Matcher();
let arbiter = new RequestArbiter(sow, matcher);
arbiter.processFarmers(farmers);
