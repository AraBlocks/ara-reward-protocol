const Web3 = require('web3')
const { abi, address } = require('./ABI')

class FarmingContract {
  constructor(personalAddress) {
    if (typeof this.web3 !== 'undefined') {
      this.web3 = new Web3(this.web3.currentProvider)
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.128.232:7545'))
    }
    this.contract = new this.web3.eth.Contract(abi, address)
    this.web3.eth.defaultAccount = personalAddress
    this.personalAddress = personalAddress
  }

  getBalance() {
    this.contract.methods
      .getBalance()
      .call({ from: this.personalAddress }, (error, result) => {
        console.log('error: ', error, '\nresult: ', result)
      })
  }

  getRate(jobId) {
    this.contract.methods
      .getRate(jobId)
      .call({ from: this.personalAddress }, (error, result) => {
        console.log('error: ', error, '\nresult: ', result)
      })
  }

  getJob(jobId) {
    this.contract.methods
      .getJob(jobId)
      .call({ from: this.personalAddress }, (error, result) => {
        console.log('error: ', error, '\nresult: ', result)
      })
  }

  createJob(jobId, budget) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 3000)
    })
  }

  acceptJob(jobId) {
    this.contract.methods
      .acceptJob(jobId)
      .call({ from: this.personalAddress }, (error, result) => {
        console.log('error: ', error, '\nresult: ', result)
      })
  }

  startJob(jobId) {
    this.contract.methods
      .startJob(jobId)
      .call({ from: this.personalAddress }, (error, result) => {
        console.log('error: ', error, '\nresult: ', result)
      })
  }

  abortJob(jobId) {
    this.contract.methods
      .startJob(jobId)
      .call({ from: this.personalAddress }, (error, result) => {
        console.log('error: ', error, '\nresult: ', result)
      })
  }

  submitReward(farmerId, jobId, reward) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
  }

  withdrawReward(farmerId, jobId, reward) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
  }
}

module.exports = FarmingContract
