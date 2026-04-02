const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { SimulationEngine } = require('./simulation');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const engine = new SimulationEngine(io);
engine.start();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial state
  socket.emit('tick', engine.getState());

  socket.on('command:remove_node', (nodeId) => {
    engine.removeNode(nodeId);
  });

  socket.on('outgoing_voice', (msg) => {
    engine.logEvent(`BASE CAMP BROADCAST: "${msg}"`);
    io.emit('tick', engine.getState());
  });

  socket.on('command:set_speed', (speedMult) => {
    engine.setSpeed(speedMult);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Rakshak Simulation Server running on port ${PORT}`);
});
