const url = require('url')
const { provider } = require('../constants.js')

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
