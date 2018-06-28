module.exports = [
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "participants",
    outputs: [
      {
        name: "balance",
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
        type: "uint256"
      }
    ],
    name: "jobs",
    outputs: [
      {
        name: "requester",
        type: "address"
      },
      {
        name: "budget",
        type: "uint256"
      },
      {
        name: "workInProgress",
        type: "bool"
      },
      {
        name: "aborted",
        type: "bool"
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
        name: "jobId",
        type: "uint256"
      }
    ],
    name: "getRate",
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
    constant: false,
    inputs: [
      {
        name: "jobId",
        type: "uint256"
      }
    ],
    name: "acceptJob",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "jobId",
        type: "uint256"
      }
    ],
    name: "abortJob",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "jobId",
        type: "uint256"
      },
      {
        name: "rate",
        type: "uint256"
      },
      {
        name: "farmerAddress",
        type: "address"
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
    inputs: [
      {
        name: "jobId",
        type: "uint256"
      }
    ],
    name: "startJob",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "jobId",
        type: "uint256"
      }
    ],
    name: "createJob",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "jobId",
        type: "uint256"
      }
    ],
    name: "withdrawFromJob",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [],
    name: "RewardSent",
    type: "event"
  }
];
