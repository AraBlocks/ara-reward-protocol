const { createCFS } = require('cfsnet/create')
const debug = require('debug')('afp:create')
const mirror = require('mirror-folder')
const { join, basename, resolve } = require('path')
const fs = require('fs')

const path = ('./robot.jpg')
const afsPath = ('./.ara/cfs/farmerAFS')
const afsId = "farming-docker"

async function create() {
  const afs = await createCFS({
  id: afsId,
  path: afsPath
  })

  await mirrorPath(path, afs)
  await fs.writeFile(`./constants.json`, `{"id": "${afsId}", "key": "${afs.key.toString('hex')}"}`, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("constant.json was saved in the same folder");
  })
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
