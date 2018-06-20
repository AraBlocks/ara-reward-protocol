const messages = require('./messages');
const WebSocket = require('ws');


const wss = new WebSocket.Server({ port: 8080 });
 
wss.on('connection', function connection(ws) {
  ws.on('message', handleMessage);
  ws.send('Connection received.');
});

function handleMessage(message){
  console.log('received: %s', message);

  if('cost' === message){
    sendCost(this);
  }
}

function sendCost(ws){
  let c = messages.Cost.encode({
    cost: 15,
    workUnit: 'MB'
  })
  
  ws.send(c);
}