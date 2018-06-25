class Authenticator {
    /*
        Returns whether contract is valid.
    */
    validateContract(contract){
        throw new Error('Abstract function called. Extended classes must implement.')
        return true;
    }
}

module.exports = { Authenticator };