const ContractABI = require('./farming_contract/contract-abi.js')
const contractAddress = '0x868dbf21375ff855bb1122877a1f7f7442516f25'
const walletAddresses = [
  '0xa151a089FC8f9F04cC5cea3062C7F0BD10E9e703',
  '0xa34e9c6D2B1fF5b1a136DE7B09BAFCB808831E73',
  '0x11370459eC9563ad81a7F9Fcf630C234fdA6054d',
  '0xa9dA8DB97B6B546449795e1f9Ff182E79738795F',
  '0xC09F5F1Ad984b2e5EE0E65735E60f78239Af6290'
]

module.exports = [
  new ContractABI(contractAddress, walletAddresses[0]),
  new ContractABI(contractAddress, walletAddresses[1]),
  new ContractABI(contractAddress, walletAddresses[2]),
  new ContractABI(contractAddress, walletAddresses[3]),
  new ContractABI(contractAddress, walletAddresses[4])
]
