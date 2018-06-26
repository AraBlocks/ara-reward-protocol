const { Farmer, broadcastFarmer, connectToFarmer } = require('./farmer');
const { Requester } = require('./requester');
const { Matcher } = require('./matcher');
const { Authenticator } = require('./authenticator');
const { Quoter } = require('./quoter')
const messages = require('./proto/messages_pb');

class ExampleMatcher extends Matcher {
    constructor(maxCost, maxWorkers){
        super();
        this.maxCost = maxCost;
        this.maxWorkers = maxWorkers;
        this.workers = 0;
    }

    considerQuoteOption(quote, hireFarmerCallback){
        if (quote.getPerUnitCost() < this.maxCost && this.workers < this.maxWorkers) {
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
        let contractRequester = contract.getQuote().getSow().getRequester().getId();
        if (contractRequester == this.requesterID){
            return true;
        }
        else {
            console.log("Invalid contract: " + contract.getId() + ' from requester: ' + contractRequester);
            return false;
        }
    }
}

class ExampleQuoter extends Quoter {
    constructor(price, farmerSig){
        super();
        this.price = price;
        this.farmerSig = farmerSig;
    }

    generateQuote(sow){
        let quote = new messages.Quote();
        quote.setId(1);
        quote.setFarmer(this.farmerSig);
        quote.setPerUnitCost(this.price);
        quote.setSow(sow);

        return quote;
    }
}

/*
    Simulates and connects to a number of Farmer Servers
*/
function simulateFarmerConnections(count, authenticator){
    let sPort = 50051;

    let farmers = [];
    for (i = 0; i < count; i++){
        let port = 'localhost:' + (sPort + i).toString();
        let price = 5 + Math.floor(Math.random() * 10) + 1;

        let farmerSig = new messages.ARAid();
        farmerSig.setId(i);
        farmerSig.setSignature(Math.floor(1000 + 1000*Math.random()));

        let quoter = new ExampleQuoter(price, farmerSig);

        // Generate Server
        let farmer = new Farmer(quoter, i, authenticator);
        broadcastFarmer(farmer, port);

        // Generate Client Connection
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

// Farmers
let authenticator = new ExampleAuthenticator(10056);
let farmers = simulateFarmerConnections(50, authenticator);

// Requester
let matcher = new ExampleMatcher(10, 7);

let requesterSig = new messages.ARAid();
requesterSig.setId(10056);
requesterSig.setSignature(11111);

let sow = new messages.SOW();
sow.setId(2);
sow.setWorkUnit('MB');
sow.setRequester(requesterSig);

let requester = new Requester(sow, matcher);
requester.processFarmers(farmers);