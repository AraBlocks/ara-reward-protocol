const Contract = require('./contract-abi')


async function testABI() {
  const contract = new Contract()
  // console.log(contract);
  hex = Buffer.from('test', 'hex')

  console.log(await contract.submitJob(hex, 100))
}

testABI()
