const { createCFS } = require('cfsnet/create')
const debug = require('debug')('afp:create')
const { info } = require('ara-console')
const mirror = require('mirror-folder')
const { join, basename, resolve } = require('path')
const fs = require('fs')

const cfsId = 'farming-docker'

async function createFarmerCFS(filePath, cfsPath, jsonPath) {
  const cfs = await createCFS({
    id: cfsId,
    path: cfsPath
  })

  await mirrorPath(filePath, cfs)
  await fs.writeFileSync(
    jsonPath,
    `{"id": "${cfsId}", "key": "${cfs.key.toString('hex')}"}`,
    function(err) {
      if (err) {
        return debug(err)
      }
      info('json was saved in the same folder')
    }
  )
  const cfsJson = { id: cfsId, key: cfs.key.toString('hex') }

  return { cfs, cfsJson }
}

async function mirrorPath(filePath, cfs) {
  debug(`copy start: ${filePath}`)
  const name = join(cfs.HOME, basename(filePath))

  // Mirror and log
  const progress = mirror(
    { name: filePath },
    { name, fs: cfs },
    { keepExisting: true }
  )
  progress.on('put', (src, dst) => {
    debug(`adding path ${dst.name}`)
  })
  progress.on('skip', (src, dst) => {
    debug(`skipping path ${dst.name}`)
  })
  progress.on('del', dst => {
    debug(`deleting path ${dst.name}`)
  })

  // Await end or error
  const error = await new Promise((accept, reject) =>
    progress.once('end', accept).once('error', reject)
  )

  if (error) {
    debug(`copy error: ${filePath}: ${error}`)
  } else {
    debug(`copy complete: ${filePath}`)
  }
}

module.exports = { createFarmerCFS }
