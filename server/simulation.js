const MAX_RANGE = 0.02; // Roughly 2km in lat/lng degrees

class SimulationEngine {
  constructor(io) {
    this.io = io;
    this.tickRate = 10000; // 10 seconds for faster map/position updates
    this.speed = 1.0;
    
    this.state = {
      nodes: {
        s01: { id: "s01", role: "Base Camp", lat: 34.1526, lng: 77.5770, targetLat: 34.1526, targetLng: 77.5770, hr: 80, temp: 36.5, spo2: 98, bat: 100, movement: "Static", failed: false, connected: true, path: ['s01'] },
        s02: { id: "s02", role: "Soldier", lat: 34.1610, lng: 77.5850, targetLat: 34.1610, targetLng: 77.5850, hr: 85, temp: 36.6, spo2: 97, bat: 95, movement: "Active", failed: false, connected: false, path: [] },
        s03: { id: "s03", role: "Soldier", lat: 34.1550, lng: 77.5800, targetLat: 34.1550, targetLng: 77.5800, hr: 75, temp: 36.4, spo2: 99, bat: 92, movement: "Active", failed: false, connected: false, path: [] },
        s04: { id: "s04", role: "Soldier", lat: 34.1480, lng: 77.5700, targetLat: 34.1480, targetLng: 77.5700, hr: 88, temp: 36.8, spo2: 96, bat: 85, movement: "Active", failed: false, connected: false, path: [] },
        s05: { id: "s05", role: "Soldier", lat: 34.1625, lng: 77.5680, targetLat: 34.1625, targetLng: 77.5680, hr: 92, temp: 37.1, spo2: 95, bat: 80, movement: "Active", failed: false, connected: false, path: [] },
        s06: { id: "s06", role: "Soldier", lat: 34.1450, lng: 77.5820, targetLat: 34.1450, targetLng: 77.5820, hr: 78, temp: 36.2, spo2: 98, bat: 88, movement: "Active", failed: false, connected: false, path: [] }
      },
      events: []
    };
    
    this.batteryTicks = 0;
  }

  getDistance(n1, n2) {
    return Math.sqrt(Math.pow(n1.lat - n2.lat, 2) + Math.pow(n1.lng - n2.lng, 2));
  }

  logEvent(msg) {
    this.state.events.push({ time: Date.now(), msg });
    if (this.state.events.length > 50) this.state.events.shift();
  }

  removeNode(id) {
    if (this.state.nodes[id]) {
      delete this.state.nodes[id];
      this.logEvent(`Soldier ${id.toUpperCase()} removed`);
      this.io.emit('tick', this.state);
    }
  }

  setSpeed(mult) {
    this.speed = mult;
  }

  tick() {
    this.batteryTicks++;
    const nodesArr = Object.values(this.state.nodes);

    // Store old critical/warning states to dispatch alerts correctly
    const oldIssues = {};
    nodesArr.forEach(n => {
       oldIssues[n.id] = n.hr > 120 || n.hr < 50 || n.spo2 < 90 || n.movement === "No Movement" || n.temp > 40 || n.temp < 30;
    });

    // 1. Realistic Vitals and Movement
    nodesArr.forEach(n => {
      // Small static/slow movement realistic to terrain bounds
      if (n.id !== 's01' && Math.random() < 0.5) {
        n.targetLat = Math.max(34.13, Math.min(34.18, n.lat + (Math.random() * 0.0006 - 0.0003)));
        n.targetLng = Math.max(77.55, Math.min(77.60, n.lng + (Math.random() * 0.0006 - 0.0003)));
      }
      if (n.targetLat && n.targetLng) {
          n.lat += (n.targetLat - n.lat) * 0.5;
          n.lng += (n.targetLng - n.lng) * 0.5;
      }

      // Realistic Vitals Generation
      if (n.id !== 's01') {
        const now = Date.now();
        if (!n.lastVitalsUpdate || now - n.lastVitalsUpdate > 30000) {
             n.hr = Math.floor(70 + Math.random() * 30); // 70-100 BPM normal
             n.temp = 36.5 + (Math.random() * 1.5); // 36.5 - 38.0 normal
             n.spo2 = 95 + Math.floor(Math.random() * 5); // 95-100% normal
             n.movement = "Active";
             n.lastVitalsUpdate = now;
         }

         // Trigger critical spikes (10% chance)
         if (Math.random() < 0.1) {
             const spikeType = Math.floor(Math.random() * 5);
             if (spikeType === 0) n.hr = Math.floor(121 + Math.random() * 19); // High HR (121-140)
             else if (spikeType === 1) n.temp = 40.1 + Math.random() * 1.5; // High Temp (>40)
             else if (spikeType === 2) n.hr = Math.floor(30 + Math.random() * 19); // Low HR (<50)
             else if (spikeType === 3) n.temp = 28 + Math.random() * 1.5; // Low Temp (<30)
             // 15% chance overall for no movement inside the 10% critical bucket
             if (Math.random() < 0.15) {
                 n.movement = "No Movement";
                 n.hr = 60; // Usually lower if knocked out
                 n.spo2 = 88 + Math.floor(Math.random() * 3);
             }
         }
      }

      // Battery depletion
      if (this.batteryTicks % 5 === 0) {
        n.bat = Math.max(0, n.bat - 1);
      }
    });

    // Log newly critical soldiers
    nodesArr.forEach(n => {
       const isCritical = n.hr > 120 || n.hr < 50 || n.spo2 < 90 || n.movement === "No Movement" || n.temp > 40 || n.temp < 30;
       if (!oldIssues[n.id] && isCritical) {
           let issueStr = [];
           if (n.hr > 120) issueStr.push("High HR");
           if (n.hr < 50) issueStr.push("Low HR");
           if (n.temp > 40) issueStr.push("High Temp");
           if (n.temp < 30) issueStr.push("Low Temp");
           if (n.movement === "No Movement") issueStr.push("No Movement");
           this.logEvent(`CRITICAL ALERT: ${n.id.toUpperCase()} - ${issueStr.join(', ')}`);
       }
    });

    // 2. TRUE MESH ROUTING LOGIC (DYNAMIC BFS GRAPHS)
    const oldConn = {};
    nodesArr.forEach(n => oldConn[n.id] = n.connected);

    nodesArr.forEach(n => { n.connected = false; n.path = []; });

    const baseCamp = this.state.nodes.s01;
    if (baseCamp && !baseCamp.failed) {
        baseCamp.connected = true;
        baseCamp.path = ['s01'];
        
        let queue = ['s01'];
        while(queue.length > 0) {
            let currentId = queue.shift();
            let current = this.state.nodes[currentId];
            
            nodesArr.forEach(neighbor => {
                if (neighbor.id === currentId || neighbor.connected) return;
                
                let dist = this.getDistance(current, neighbor);
                if (dist <= MAX_RANGE) {
                    neighbor.connected = true;
                    neighbor.path = [...current.path, neighbor.id];
                    queue.push(neighbor.id);
                }
            });
        }
    }

    nodesArr.forEach(n => {
       if (n.id === 's01') return;
       if (oldConn[n.id] && !n.connected) {
           this.logEvent(`CONNECTION LOSS: ${n.id.toUpperCase()}`);
       }
    });

    this.io.emit('tick', this.state);
  }

  getState() {
    return this.state;
  }

  start() {
    setInterval(() => this.tick(), this.tickRate);
    
    // Simulate incoming radio transmissions periodically
    setInterval(() => {
        const nodesArr = Object.values(this.state.nodes).filter(n => n.id !== 's01' && n.connected && !n.failed);
        if (nodesArr.length > 0) {
            const sender = nodesArr[Math.floor(Math.random() * nodesArr.length)];
            const msgs = [
                "Base, this is Alpha actual, requesting supplies over.",
                "Contact front, taking cover.",
                "Grid clear, maintaining position.",
                "Signal strength is dropping, relocating.",
                "Visual on objective, awaiting orders."
            ];
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            this.io.emit('incoming_voice', { id: sender.id, msg, time: Date.now() });
            this.logEvent(`VOICE RECVD - ${sender.id.toUpperCase()}`);
        }
    }, 60000); // Every 60 seconds
  }
}

module.exports = { SimulationEngine };
