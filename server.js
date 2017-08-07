'use strict';
const  _ = require('lodash');
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const PORT = process.env.PORT || 3000;
const jsonfile = require('jsonfile');

var file = 'data.json'
var data = jsonfile.readFileSync(file);

const server = express()
  .use(express.static(path.join(__dirname, 'client')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

const rooms = {};

wss.on('connection', function connection(ws) {
    ws.room = '';
    ws.send("User Joined");

    ws.on('message', function(messageStr) {
      const message = JSON.parse(messageStr);

        if (message.join && message.room) {
            ws.room = message.room;
            if (ws.host) {
              ws.host = true;
            } else {
              const room = rooms[room];
              const data = room.data;
              data && ws.send(JSON.stringify(data) || '"empty": true')
            }
        }

        if (message.room && message.data) {
            broadcastUpdate(message);
        }

        if (message.room && message.delete) {
            broadcastDelete(message);
        }

        if (message.data) {
            console.log("Server got: " + message.data);
        }
    });

    ws.on('error', function(er) {
        console.log(er);
    })


    ws.on('close', function() {
        console.log('Connection closed')
    })
});

//рассылаем стейт
function broadcastUpdate(message) {
  const room = rooms[message.room];
  let data = room.data;
  _.merge(data, message.data)
    wss.clients.forEach(function each(client) {
        if (client.room === message.room) {
            client.send(data);
        }
    });
}

function broadcastDelete(message) {

}
