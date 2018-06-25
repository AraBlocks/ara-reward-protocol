/*
    Class that handles the communication for requesting a specific SOW for a single task.
*/
class Requester {
    constructor(sow, matcher){
        this.sow = sow;
        this.matcher = matcher;
    }

    /* 
        Iterates through an array of Farmers and gets quotes from them for the defined SOW
    */
    processFarmers(farmers){
        farmers.forEach(farmer => {
            let responseHandler = function(err, quote) {
                this.handleQuoteResponse(err, quote, farmer);
            }
            farmer.getQuote(this.sow, responseHandler.bind(this))
        });
    }

    /*
        On receipt of a quote from a farmer, asks the defined Matcher to consider the quote. On the Matcher
        selecting the quote, initializes a contract, signs it for the specific SOW and Farmer, then sends 
        the contract to the farmer.
    */
    handleQuoteResponse(err, quote, farmer){
        if (err){
    
        } else {
            console.log("Requester: Received Quote " + quote.cost + ' per ' + quote.sow.workUnit + ' from farmer ' + quote.farmer.id);

            let optionCallback = function(){
                // TODO: generate contract
                let contract = {
                    id: 103,
                    quote: quote,
                };
            
                farmer.awardContract(contract, this.handleSignedContract.bind(this));            
            } 

            this.matcher.considerQuoteOption(quote, optionCallback.bind(this));                
        }
    }

    /*
        On receipt of a signed (and staked) contract from farmer, can begin distribution of work.
    */
    handleSignedContract(err, contract){
        if (err){
    
        } else {
            console.log("Requester: Contract " + contract.id + " signed by farmer " + contract.quote.farmer.id);
        }
    }
} 

module.exports = { Requester };