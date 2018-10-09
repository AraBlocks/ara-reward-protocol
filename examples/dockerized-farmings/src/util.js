function idify(host, port) {
  return `${host}:${port}`.replace('::ffff:', '')
}

function nonceString(protobuf) {
  return `${Buffer.from(protobuf.getNonce()).toString('hex')}`
}

function bytesToGBs(bytes) {
  return bytes / 1000000000
}

function gbsToBytes(gbs) {
  return Math.ceil(gbs * 1000000000)
}

function etherToWei(ether) {
  return Math.ceil(ether * 1000000000000000000)
}

function weiToEther(wei) {
  return wei / 1000000000000000000
}

module.exports = {
  idify,
  nonceString,
  bytesToGBs,
  gbsToBytes,
  etherToWei,
  weiToEther
}
