class Matcher {
    constructor(){
        this.workers = 0;
    }

    considerQuoteOption(quote, hireFarmerCallback){
        if (quote.cost < 10 && this.workers < 7) {
            hireFarmerCallback();
            this.workers++;
        }
    }
}

module.exports = { Matcher };