const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { SimulationEngine } = require('./simulation');

const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Rakshak Simulation Server running on port ${PORT}`);
});
