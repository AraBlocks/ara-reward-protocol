// Allows us to use ES6 in our migrations and tests.
module.exports = {
  networks: {
    development: {
      host: 'ganachecli',
      port: 8545,
      network_id: '*' // Match any network id
    }
  }
}
