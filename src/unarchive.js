const { create } = require('ara-filesystem')
const unixify = require('unixify')
const mirror = require('mirror-folder')

const did = '5a0ca463a488b4d3d85ea243087043e1b87b35eae8e15c86c99c4b4d9c14179b'
const path = '/Users/brandon/Development/testfolder'

unarchive(did, path)

async function unarchive (did, path) {
    const { afs } = await create({did})

    path = unixify(path)
	const progress = mirror({name: '/home', fs: afs}, {name: path}, {}, (error) => {
		if (error) console.log("Mirror", error)
	})
	progress.on('put', (src) => console.log('Mirrored', src.name))
	progress.on('skip', (src) => console.log('Skipped', src.name))
	progress.on('end', onend)

	function onend(){
		console.log("Mirror Complete")
		afs.close()
	}
}
