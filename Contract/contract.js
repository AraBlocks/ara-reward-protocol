let Web3 = require("web3");

if (typeof web3 !== "undefined") {
  web3 = new Web3(Web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(
    new Web3.providers.HttpProvider("http://192.168.128.232:7545")
  );
}

let Auction = new web3.eth.Contract(
  [
    {
      constant: false,
      inputs: [
        {
          name: "rate",
          type: "uint256"
        }
      ],
      name: "acceptWork",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "farmerAddress",
          type: "address"
        },
        {
          name: "farmerRate",
          type: "uint256"
        }
      ],
      name: "addFarmer",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "sendReward",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [
        {
          name: "_stake",
          type: "uint256"
        }
      ],
      payable: true,
      stateMutability: "payable",
      type: "constructor"
    },
    {
      constant: true,
      inputs: [],
      name: "budget",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address"
        }
      ],
      name: "farmers",
      outputs: [
        {
          name: "rate",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "hiredFarmer",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "hiredRate",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "requester",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "stake",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    }
  ],
  "0xa9f287c0a8cc26bc10e6e9bae0013c3d547c0da0"
);
//Contract address

web3.eth.defaultAccount = "0xa151a089fc8f9f04cc5cea3062c7f0bd10e9e703"; //Requester address

exports.Auction = Auction;
