class Quoter {
    // Returns Quote for SOW
    generateQuote(sow){
        throw new Error('Abstract function called. Extended classes must implement.')
    }
}

module.exports = { Quoter };