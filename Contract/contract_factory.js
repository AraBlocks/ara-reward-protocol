var Web3 = require("web3");
var Auction = require("./contract");

//Create new Contract
Auction.methods
  .addFarmer("0xa34e9c6D2B1fF5b1a136DE7B09BAFCB808831E73", 10000)
  .send(
    {
      from: web3.eth.defaultAccount,
      gas: 1000000
    },
    function(error, result) {
      console.log(error, result);
      // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
    }
  );
