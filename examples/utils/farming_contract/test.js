const Contract = require('./contract-abi')


async function testABI() {
  const contract = new Contract()
  // console.log(contract);

  hex = Buffer.from('test', 'hex') // hi huy

  console.log(await contract.submitJob(hex, 29171000000000))
}

testABI()
