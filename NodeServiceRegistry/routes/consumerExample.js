var serviceregistry = require('./serviceregistry');
var WebSocket = require('ws');

//Parse and port adress from db.

var ws = new WebSocket('ws://localhost:3004');

ws.on('open', function open(){
  ws.send('tempC')
})

console.log(serviceregistry.getProvider("getTemp-01"));
