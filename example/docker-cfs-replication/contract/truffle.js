module.exports = {
  networks: {
    development: {
      host: 'ganachecli', // use 'localhost' to test locally, 'ganachecli' to test on docker
      port: 8545,
      network_id: '*' // Match any network id
    }
  }
}
