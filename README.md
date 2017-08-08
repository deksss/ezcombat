# ezcombat
Light Combat Tracker for custom bg

client API:

var data = {};
var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
ws.onmessage = function(msg) {
  console.log(msg.data);
  try {
    data = JSON.parse(msg.data);
  } catch(e){
    console.log(msg.data)
  }  
};

first client:
ws.send(JSON.stringify({"join": true, "host": true, "room": "my"}))

ws.send(JSON.stringify({"room": "my", "data": {name: "lol"}, type: "update"}))

second client:
ws.send(JSON.stringify({"join": true, "room": "my"}))

first client:
ws.send(JSON.stringify({"room": "my", "data": {name: "lol2", num: 2}, type: "update"}))
