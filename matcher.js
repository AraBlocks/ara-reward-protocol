class Matcher {
    considerQuoteOption(quote, hireFarmerCallback){
        throw new Error('Abstract function called. Extended classes must implement.')
    }
}

module.exports = { Matcher };