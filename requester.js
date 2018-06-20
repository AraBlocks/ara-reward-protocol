const messages = require('./messages');

const WebSocket = require('ws');
 
const ws = new WebSocket('ws://127.0.0.1:8080');

ws.on('open', getCost);
ws.on('message', handleMessage);


function getCost(){
    console.log('Connection opened.');
    ws.send('cost');
}

function handleMessage(data){
    try {
        let message = messages.Cost.decode(data);
        console.log('Message: Cost: ' + message.cost + " per " + message.workUnit);
    }
    catch (e) {
        console.log('Message: ' + data);
    }
}

