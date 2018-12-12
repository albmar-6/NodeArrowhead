var serviceregistry = require('./serviceregistry');
var WebSocket = require('ws');

var ws = new WebSocket('ws://localhost:3004');

ws.on('open', function open(){
  ws.send('tempC')
})

console.log(serviceregistry.getProvider("getTemp-01"));
