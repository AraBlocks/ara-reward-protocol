const { Farmer, broadcastFarmer, connectToFarmer } = require('./farmer');
const { Requester } = require('./requester');
const { Matcher } = require('./matcher');
const { Authenticator } = require('./authenticator');
const { Quoter } = require('./quoter')

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

class ExampleAuthenticator extends Authenticator {
    constructor(requesterID){
        super();
        this.requesterID = requesterID;
    }

    validateContract(contract){
        if (contract.requester.id == this.requesterID){
            return true;
        }
        else {
            console.log("Invalid contract: " + contract.id + ' from requester: ' + contract.requester.id);
            return false;
        }
    }
}

class ExampleQuoter extends Quoter {
    constructor(price){
        super();
        this.price = price;
    }

    generateQuote(sow){
        let quote = {
            cost: this.price,
            sow: sow
        };
        return quote;
    }
}

/*
    Generates and connects to a number of Farmer Servers
*/
function generateFarmerConnections(count, authenticator){
    let sPort = 50051;

    let farmers = [];
    for (i = 0; i < count; i++){
        let port = 'localhost:' + (sPort + i).toString();
        let price = 5 + Math.floor(Math.random() * 10) + 1;
        let quoter = new ExampleQuoter(price);

        // Generate Servers
        let farmer = new Farmer(quoter, i, authenticator);
        broadcastFarmer(farmer, port);

        // Generate Client Connections
        let connection = connectToFarmer(port);
        farmers.push(connection);
    }
    return farmers;
}

/* 
    Example: generate and connect to 50 farmers, then hire up to 
    7 farmers who charge <= 10 Ara per MB. Authenticator only considers 
    user 10056 as valid requester.
*/
let sow = {
    id: 2,
    workUnit: "MB"
}

// Farmers
let authenticator = new ExampleAuthenticator(10056);
let farmers = generateFarmerConnections(50, authenticator);

// Requester
let matcher = new ExampleMatcher(10, 7);
let requester = new Requester(10056, sow, matcher);
requester.processFarmers(farmers);
