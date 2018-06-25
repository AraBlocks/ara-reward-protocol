class Quoter {
    // This should return a quote given an SOW
    generateQuote(sow){
        throw new Error('Abstract function called. Extended classes must implement.')
    }
}

module.exports = { Quoter };