const { HypercoreConnection, MSG } = require('./hypercore-connection')
const { RequesterConnection } = require('./requester-connection')
const { FarmerConnection } = require('./farmer-connection')

module.exports = {
  HypercoreConnection,
  RequesterConnection,
  FarmerConnection,
  MSG
}
