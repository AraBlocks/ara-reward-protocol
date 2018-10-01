const { createCFS } = require('cfsnet/create')
const debug = require('debug')('afp:create')
const mirror = require('mirror-folder')
const { join, basename, resolve } = require('path')

async function create() {
  const afs = await createCFS({
  id: "test",
  path: '/Users/huydao/.ara/afs/testAFS'
  })

  await mirrorPath('robot.jpg', afs)
  // console.log(afs);
  console.log(afs.key.toString('hex'));
  // f615a9bcba0d8953cd2fc56add30f0ba85fed751278cfd10330f6ca290f0e02a

  // console.log(discoveryKey.toString('hex'))
  // const afs2 = await createCFS({
  // id: "test",
  // key: afs.key,
  //
  // path: '/Users/huydao/.ara/afs/testAFS67'
  // })
  // console.log(afs2);
  // Buffer.from(afs.key, )
  // console.log(afs.discoveryKey, afs.key);
  // console.log(afs2.discoveryKey, afs2.key);

}

async function mirrorPath(path, afs) {
  debug(`copy start: ${path}`)
  const name = join(afs.HOME, basename(path))

  // Mirror and log
  const progress = mirror({ name: path }, { name, fs: afs }, { keepExisting: true })
  progress.on('put', (src, dst) => {
    debug(`adding path ${dst.name}`)
  })
  progress.on('skip', (src, dst) => {
    debug(`skipping path ${dst.name}`)
  })
  progress.on('del', (dst) => {
    debug(`deleting path ${dst.name}`)
  })

  // Await end or error
  const error = await new Promise((accept, reject) => progress.once('end', accept).once('error', reject))

  if (error) {
    debug(`copy error: ${path}: ${error}`)
  } else {
    debug(`copy complete: ${path}`)
  }
}

create()
