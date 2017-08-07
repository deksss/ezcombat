# ezcombat
Light Combat Tracker for custom bg

client API:

var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);

ws.onmessage = function(msg) {
  console.log(msg.data);
};

ws.send(JSON.stringify({"join": "my"}))
ws.send(JSON.stringify({"room": "my", "data": "wow2"}))


ws.onmessage = function(msg) {
  console.log("MSG: " + msg);
};
