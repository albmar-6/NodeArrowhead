var WebSocket = require('ws');
var ws = new WebSocket('ws://192.168.0.103:3004');


const sensor = require('ds18b20-raspi');
var tempC = sensor.readSimpleC(1);

function sendTemp(){
  tempC = 0;
  tempC = sensor.readSimpleC(1);
  ws.send(tempC);
}



ws.on('open', function open(){
  setInterval(sendTemp,1000);
})


