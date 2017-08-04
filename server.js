'use strict';

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

wss.on('connection', function connection(ws) {
    ws.room = '';
    ws.send("User Joined");

    ws.on('message', function(message) {
      //  message = JSON.parse(message);
        if (message.join) {
            ws.room = message.join;
        }

        if (message.room) {
            broadcast(message);
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

function broadcast(message) {
    wss.clients.forEach(function each(client) {
        if (client.room === message.room) {
            client.send(message.data);
        }
    });
}
