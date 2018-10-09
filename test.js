const Contract = require('./contract-abi')


async function testABI() {
  const contract = Contract()
  console.log(contract);
}

testABI()
