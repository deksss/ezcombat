'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const PORT = process.env.PORT || 3000;
const jsonfile = require('jsonfile');

var file = 'data.json'
var data = jsonfile.readFileSync(file);
console.log(data);

//data.rooms.test.units.push({"name": "p2", "value": "zero"});

//jsonfile.writeFile(file, data, function (err) {
//  console.error(err);
//})

var clients = {};
var rooms = {};

const server = express()
  .use(express.static(path.join(__dirname, 'client')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  var id = Math.random();
  clients[id] = ws;

  ws.on('message', function(message) {
      console.log('получено сообщение ' + message);
      if (message.room) {
        for (var key in clients) {
          if (clients[key] &&
            clients[key].room &&
            clients[key].room === message.room) {
              clients[key].send(room);
          }
        }
      }
  });

  ws.on('joinRoom', function(message) {
      console.log('получено сообщение ' + message);
      rooms[message.room].clients.push(id);
  });

  ws.on('close', () => delete clients[id]);
});





//client.on('data', function(data) {
//	console.log('Received: ' + data);
//	client.destroy(); // kill client after server's response
//});
