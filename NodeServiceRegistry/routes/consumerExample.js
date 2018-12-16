var WebSocket = require('ws');

var wss = new WebSocket.Server({port: 3004});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
      console.log(message);
  });
});

