"use strict";
const _ = require("lodash");
const express = require("express");
const SocketServer = require("ws").Server;
const path = require("path");
const PORT = process.env.PORT || 3000;
const compression = require("compression");

const server = express()
  .use(compression())
  .use(express.static(path.join(__dirname, "client")))
  .get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new SocketServer({ server });

const rooms = {};

wss.on("connection", function connection(ws) {
  ws.room = "";

  ws.on("message", function(messageStr) {
    if (messageStr === "pong" && ws.readyState === 1) {
      setTimeout(() => {
        if (ws.readyState === 1) {
          ws.send("ping");
        }
      }, 29000);
    } else {
      const message = JSON.parse(messageStr);
      if (message.join && message.room) {
        ws.room = message.room;
        ws.name = message.name;
        ws.id = Math.round(Date.now() / Math.floor(Math.random() * 1000));
        if (message.host) {
          console.log("host connect");
          ws.host = true;
        } else {
          sendGetRequestToHost(Object.assign({}, ws));
          //const data = rooms[message.room];
          //data && ws.send(JSON.stringify(data) || '{"empty": true}');
        }
      }

      if (message.room && message.data && message.type === "update") {
        broadcastUpdate(message, ws);
      }

      if (message.room && message.data && message.type === "data_for_client") {
        clientUpdate(message, ws);
      }

      if (message.room && message.action && message.type === "action") {
        sendActionToAll(message, ws);
      }

      if (message.room && message.data && message.type === "delete") {
        broadcastDelete(message);
      }

      if (message.room && message.action && message.type === "get_data") {
        sendGetRequestToHost(message);
      }
    }
  });

  ws.on("error", function(er) {
    console.log(er);
  });

  ws.on("close", function() {
    console.log("Connection closed");
  });

  ws.send("ping");
});

function sendGetRequestToHost(ws) {
  console.log("send req get all");
  console.log(ws);
  var id = ws.id;
  var room = ws.room;
  wss.clients.forEach(function(client) {
    if (client.room === ws.room && client.host) {
      try {
        client.send(JSON.stringify({ getAll: true, wsId: id }));
      } catch (e) {
        console.log(e);
      }
    }
  });
}

function clientUpdate(message) {
  console.log("client update");
  const data = message.data || {};
  console.log(data);
  wss.clients.forEach(function(client) {
    if (client.id === message.wsId) {
      try {
        client.send(JSON.stringify(Object.assign({}, data, { update: true })));
      } catch (e) {
        console.log(e);
      }
    }
  });
}

function broadcastUpdate(message, ws) {
  const data = message.data || rooms[message.room] || {};
  //_.merge(data, message.data);
  rooms[message.room] = data;
  data.room = message.room;
  wss.clients.forEach(function each(client) {
    if (client.room === message.room && ws.id !== client.id) {
      try {
        client.send(JSON.stringify(data));
      } catch (e) {
        console.log(e);
      }
    }
  });
}

//old
function sendActionToHost(message) {
  console.log(message);
  const action = message.action;
  if (message.room) {
    wss.clients.forEach(function each(client) {
      if (client.room === message.room && client.host) {
        try {
          console.log({ remote: true, action: action.data });
          client.send(JSON.stringify({ remote: true, action: action.data }));
        } catch (e) {
          console.log(e);
        }
      }
    });
  }
}

function sendActionToAll(message, ws) {
  console.log("sendActionToAll");
  console.log(ws.id);
  console.log(message);
  if (message.room) {
    wss.clients.forEach(function each(client) {
      console.log(client.id);
      if (client.room === message.room && client.id !== ws.id) {
        try {
          console.log("send to:" + client.id);
          client.send(JSON.stringify({ remote: true, action: message.action }));
        } catch (e) {
          console.log(e);
        }
      }
    });
  }
}

function broadcastAction(message) {}

function broadcastDelete(message) {}
