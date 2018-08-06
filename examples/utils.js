    
    
    function idify(host, port){
      return `${host}:${port}`.replace('::ffff:', '')
    }

    module.exports = {
      idify
    }