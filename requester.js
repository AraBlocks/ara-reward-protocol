const messages = require('./messages');

const WebSocket = require('ws');
 
const ws = new WebSocket('ws://127.0.0.1:8080');

ws.on('open', getCost);
ws.on('message', handleMessage);


function getCost(){
    console.log('Connection opened.');
    let c = {cost: 2, workUnit:'none'};
    let m = messages.IMessage.encode({
        mCost: c
      });

    ws.send(m); // Replace with cost query
}

function handleMessage(data){
    try {
        let message = messages.IMessage.decode(data);
        if(defined(message.mCost)) handleCost(this, message.mCost);
        else if (defined(message.mContract)) handleContract(message.mContract);
    }
    catch (e) {
        console.log('Error: ' + e);
        console.log('Non IMessage: ' + data);
    }
}

function handleCost(ws, cost){
    console.log('Message: Cost: ' + cost.cost + " per " + cost.workUnit);
    sendContract(ws);
}

function handleContract(contract){
    console.log('Message: Contract: ' + contract.id + " between farmer: " + contract.farmer.id 
                + " and requester: " + contract.requester.id);
}

function sendContract(ws){
    let r = {
        id: 15
    };

    let c = {
        id: 5,
        requester: r
    };

    let m = messages.IMessage.encode({
        mContract: c
      });

    ws.send(m);
}

function defined (val) {
    return 'undefined' != typeof(val);
  }