const { create } = require('ara-filesystem')
const { createSwarm } = require('ara-network/discovery')
const pify = require('pify')

/** 
* Example download:
*	const did = 'did:ara:1debc451b5bfba29f46bcbbeb9d4957bed0140b6ba56f8d3826b656992f4cb2a' 
*	download(did)
**/

/**
* Example broadcast:
*	const did = 'did:ara:1debc451b5bfba29f46bcbbeb9d4957bed0140b6ba56f8d3826b656992f4cb2a' 
*	broadcast(did)
**/

const did = '5a0ca463a488b4d3d85ea243087043e1b87b35eae8e15c86c99c4b4d9c14179b' 
download(did)

async function broadcast (did) {
    // Create a swarm for uploading the content
    const { afs } = await create({did})

    // Join the discovery swarm for the requested content
    const opts = {
        stream: stream,
    }
    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)
    swarm.join(did)

   function stream(peer) {
       const stream = afs.replicate({
            upload: true,
            download: false
       })
       stream.once('end', onend)
       return stream
   }
   
   async function onend(){
        console.log(`Uploaded!`)
   }

    async function handleConnection(connection, info){
        console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
    }
}

async function download (did) {
    // Create a swarm for downloading the content
    const { afs } = await create({did})

    afs.on('content', async () => {
      console.log("on content")
      const feed = afs.partitions.resolve(afs.HOME).content
      feed.on('download', () => {
        const total = feed.length
        if (total) {
          const downloaded = feed.downloaded()
          const perc = 100 * downloaded / total
          console.log("Perc complete:", perc)
        }
      })
      feed.on('sync', onend)
    })

    // Join the discovery swarm for the requested content
    const opts = {
        stream: stream,
    }
    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)
    swarm.join(did)

   function stream(peer) {
       const stream = afs.replicate({
            upload: false,
            download: true
       })
       stream.once('end', onend)
       return stream
   }
   
   async function onend(){
      console.log("Size:", afs.partitions.resolve(afs.HOME).content.byteLength)

	    console.log(await afs.readdir('.'))
      console.log(`Downloaded!`)
      afs.close()
      swarm.destroy()
      console.log("Swarm destroyed")
   }

    async function handleConnection(connection, info){
        console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
        try {
            await afs.download('.')
        }
        catch (err) {
            console.log(`Error: ${err}`)
        }
    }
}

module.exports = { 
    broadcast,
    download
 }
