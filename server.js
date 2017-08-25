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

    ws.on('message', function(messageStr) {
      if (messageStr === 'pong') {
        setTimeout(() => ws.send('ping'), 29000 )
      } else {
        const message = JSON.parse(messageStr);
        if (message.join && message.room) {
            ws.room = message.room;
            if (message.host) {
              rooms[message.room] = {};
              ws.host = true;
            } else {
              const data = rooms[message.room];
              data && ws.send(JSON.stringify(data) || '{"empty": true}')
            }
        }

        if (message.room && message.data && message.type === 'update') {
            broadcastUpdate(message);
        }

        if (message.room && message.data && message.type === 'delete') {
            broadcastDelete(message);
        }
      }



    });

    ws.on('error', function(er) {
        console.log(er);
    })


    ws.on('close', function() {
        console.log('Connection closed')
    })

    ws.send('ping');

});

//рассылаем стейт
function broadcastUpdate(message) {
  const data = rooms[message.room] || {};

  _.merge(data, message.data);
  rooms[message.room] = data;
  data.room = message.room;
    wss.clients.forEach(function each(client) {
      console.log(client)
        if (client.room === message.room && !client.host ) {
            client.send(JSON.stringify(data));
        }
    });
}

function broadcastAction(message) {
    wss.clients.forEach(function each(client) {
        if (client.room === message.room && !client.host) {
            client.send(JSON.stringify(data));
        }
    });
}

function broadcastDelete(message) {

}
