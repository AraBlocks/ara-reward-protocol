function idify(host, port) {
  return `${host}:${port}`.replace('::ffff:', '')
}

function nonceString(protobuf){
  return `${Buffer.from(protobuf.getNonce()).toString('hex')}` 
}

module.exports = {
  idify,
  nonceString
}
