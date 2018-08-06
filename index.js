const messages = require('./src/proto/messages_pb')
const services = require('./src/proto/route-guide_grpc_pb')
const { Requester } = require('./src/requester')
const { Matcher } = require('./src/matcher')
const { Farmer } = require('./src/farmer')
const afpstream = require('./src/duplex/index')
const afpgrpc = require('./src/grpc/index')
const matchers = require('./src/matchers/index')

module.exports = {
  messages,
  services,
  afpstream,
  afpgrpc,
  matchers,
  Requester,
  Matcher,
  Farmer,
}
