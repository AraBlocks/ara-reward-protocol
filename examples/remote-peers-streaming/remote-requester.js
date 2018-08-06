const { createSwarm } = require('ara-network/discovery')
const { messages, matchers, afpstream } = require('ara-farming-protocol')
const ip = require('ip')
const through = require('through')
const { create } = require('ara-filesystem')
const { ExampleRequester } = require('./requester')
const utils = require('../utils')


const did = 'did:ara:1debc451b5bfba29f46bcbbeb9d4957bed0140b6ba56f8d3826b656992f4cb2a' 
download(did)

async function download (did) {
    // A default matcher which will match for a max cost of 10 to a max of 5 farmers
    const matcher = new matchers.MaxCostMatcher(10, 5)

    // The ARAid of the Requester
    const requesterID = new messages.ARAid()
    const requesterDID = 'did:ara:1'
    requesterID.setDid(requesterDID)

    // A signature that a farmer can use to verify that the requester has signed an agreement
    const requesterSig = new messages.Signature()
    requesterSig.setAraId(requesterID)
    requesterSig.setData('avalidsignature')

    // Create the statement of work
    const sow = new messages.SOW()
    sow.setId(2)
    sow.setWorkUnit('MB')
    sow.setRequester(requesterID)

    const requester = new ExampleRequester(sow, matcher, requesterSig, startWork)

      // Create a swarm for downloading the content
    const { afs } = await create({did})

    // Join the discovery swarm for the requested content
    const opts = {
        stream,
    }
    const swarm = createSwarm(opts)
    swarm.on('connection', handleConnection)
    swarm.join(did)

    function stream(peer) {
        const us = utils.idify(ip.address(), this.address().port)
        const them = utils.idify(peer.host, peer.port)
      
        if (us === them) {
          return through()
        }
              
        const connection = new afpstream.RequestStream(peer, { wait: 100, timeout: 10000 })
        requester.processFarmer(connection)

        return connection.stream
    }

    function handleConnection(connection, info){
        console.log(`SWARM: New peer: ${info.host} on port: ${info.port}`)
    }

    function startWork(peer){
      console.log("Starting AFS Connection with ", peer.host, peer.port)
    
      const opts = {
          stream,
      }
      const swarm = createSwarm(opts)
      swarm.addPeer(peer.host, peer)
    
      function stream(peer) {
        const stream = afs.replicate({
            upload: false,
            download: true
        })
        stream.once('end', onend.bind(this))
    
        async function onend(){
            console.log(`Downloaded!`)
            console.log(await afs.readdir('.'))
            afs.close()
            swarm.destroy()
            console.log("Swarm destroyed")
        } 
       return stream
      }
    }
}


