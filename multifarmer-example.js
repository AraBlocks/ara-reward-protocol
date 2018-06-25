const { broadcastFarmer, connectToFarmer } = require('./farmer');
const { Requester } = require('./requester');
const { Matcher } = require('./matcher');

class ExampleMatcher extends Matcher {
    constructor(maxCost, maxWorkers){
        super();
        this.maxCost = maxCost;
        this.maxWorkers = maxWorkers;
        this.workers = 0;
    }

    considerQuoteOption(quote, hireFarmerCallback){
        if (quote.cost < this.maxCost && this.workers < this.maxWorkers) {
            hireFarmerCallback();
            this.workers++;
        }
    }
}

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
let matcher = new ExampleMatcher(10, 7);
let requester = new Requester(sow, matcher);
requester.processFarmers(farmers);
