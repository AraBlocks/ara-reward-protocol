const url = require('url')
const { provider } = (require('ara-identity/rc')()).web3
const providerURL = url.parse(provider)

module.exports = {
  networks: {
    development: {
      host: `${providerURL.hostname}`,
      port: `${providerURL.port}`,
      network_id: '*'
    }
  }
}