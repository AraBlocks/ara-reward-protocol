class Requester {
    constructor(sow, matcher){
        this.sow = sow;
        this.matcher = matcher;
    }

    processFarmers(farmers){
        farmers.forEach(farmer => {
            let responseHandler = function(err, quote) {
                this.handleQuoteResponse(err, quote, farmer);
            }
            farmer.getQuote(this.sow, responseHandler.bind(this))
        });
    }

    handleQuoteResponse(err, quote, farmer){
        if (err){
    
        } else {
            console.log("Requester: Received Quote " + quote.cost + ' per ' + quote.sow.workUnit);
            let responseHandler = function(err, farmerSig) {
                this.handleFinalProposal(err, farmerSig, farmer);
            }

            let optionCallback = function(){
                farmer.finalizeProposal(quote.sow, responseHandler.bind(this));
            } 

            this.matcher.considerQuoteOption(quote, optionCallback.bind(this));                
        }
    }

    handleFinalProposal(err, farmerSig, farmer){
        if (err){
    
        } else {
            console.log("Requester: Received confirmation from farmer: " + farmerSig.id);
            let contract = {
                id: 103,
                requester: {
                    id: 3
                },
                farmer: farmerSig
            };
        
            farmer.awardContract(contract, this.handleSignedContract.bind(this));
        }
    }

    handleSignedContract(err, contract){
        if (err){
    
        } else {
            console.log("Requester: Contract " + contract.id + " signed by farmer " + contract.farmer.id);
        }
    }
} 

module.exports = { Requester };