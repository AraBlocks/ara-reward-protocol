const messages = require('./messages');
const WebSocket = require('ws');


const wss = new WebSocket.Server({ port: 8080 });
 
wss.on('connection', function connection(ws) {
  ws.on('message', handleMessage);
  ws.send('Connection received.');
});

function handleMessage(data){
  try {
      let message = messages.IMessage.decode(data);
      switch(message.opcode){
        case "None":
          break;
        case "GetCost":
          break;
        case ""
      }

      if(defined(message.mCost)) sendCost(this);
      else if (defined(message.mContract)) signContract(this, message.mContract);
  }
  catch (e) {
      console.log('Error: ' + e + 'with data: ' + data);
  }
}

function sendCost(ws){
  console.log('Message: sendCost');
  let c = {
    cost: 15,
    workUnit: 'MB'
  };

  let m = messages.IMessage.encode({
    mCost: c
  });
  
  ws.send(m);
}

function signContract(ws, contract){
  console.log('Message: signContract');
  contract.farmer = {
    id: 105
  };

  let m = messages.IMessage.encode({
    mContract: contract
  });
  
  ws.send(m);
}

function defined (val) {
  return 'undefined' != typeof(val);
}