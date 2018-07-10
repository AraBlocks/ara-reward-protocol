const Contract = require('./contract')

const contract = new Contract(
  '0xa151a089fc8f9f04cc5cea3062c7f0bd10e9e703',
  '0185fd42264c197154af8f54bf74f8aeea2f777f83f23daa5313772aa7628aff'
)

contract.createJob(123, 100)
