const ContractABI = require('./contract-abi.js')
const { walletAddresses } = require('../constants')


async function testABI() {
  const wallet = new ContractABI(walletAddresses[2])
  hex = Buffer.from('test', 'hex')
  hex2 = Buffer.from('test', 'hex')
  wallet.submitReward(hex, hex2, 50).then((x) => {
    console.log(x);
  })
  .catch((err) => {
    console.log(err);
  })
}

testABI()
