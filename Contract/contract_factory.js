let Contract = require("./contract");

const contract = new Contract(
  "0xfd1966eb78390209c49767a05c6c799ba2e37fad",
  "0xa151a089fc8f9f04cc5cea3062c7f0bd10e9e703"
);

contract.createJob(100, 100);
contract.getJob(100);
contract.getBalance();
