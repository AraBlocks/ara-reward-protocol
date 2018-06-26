var messages = require('./proto/messages_pb');

class Matcher {
    // Calls hireFarmerCallback if quote is acceptable
    considerQuoteOption(quote, hireFarmerCallback){
        throw new Error('Abstract function called. Extended classes must implement.')
        hireFarmerCallback();
    }
}

module.exports = { Matcher };