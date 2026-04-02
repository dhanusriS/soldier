import React, { useRef, useEffect } from 'react';

export default function MapCanvas({ nodes, selectedNodeId, onSelectNode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Setup resize
    const resizeObj = new ResizeObserver(() => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        render(); // render on resize
    });
    if (canvas.parentElement) resizeObj.observe(canvas.parentElement);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Draw Sectors
      ctx.strokeStyle = '#2b7042'; // Darker green for light theme
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y < h; y += 40) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
      ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
      ctx.stroke();

      ctx.globalAlpha = 1.0;

      if (Object.keys(nodes).length === 0) return;

      // Draw Edges (Static, no trails/animations)
      Object.values(nodes).forEach(node => {
         if (!node.connected || node.path.length <= 1) return;
         
         ctx.beginPath();
         for (let i = 0; i < node.path.length; i++) {
             const pathNodeId = node.path[i];
             const pnode = nodes[pathNodeId];
             if (!pnode) continue;
             if (i === 0) ctx.moveTo(pnode.x, pnode.y);
             else ctx.lineTo(pnode.x, pnode.y);
         }
         
         if (node.path.length === 2) ctx.strokeStyle = '#2b7042';
         else ctx.strokeStyle = '#fbc02d';
         
         ctx.setLineDash([4, 4]); // static dash
         ctx.lineWidth = 1.5;
         ctx.stroke();
         ctx.setLineDash([]);
      });

      // Draw Nodes
      Object.values(nodes).forEach(node => {
          const x = node.x;
          const y = node.y;
          
          let color = '#5c6a61';
          if (node.role === 'Base Camp') color = '#2b7042';
          else color = '#4287f5'; 
          
          if (!node.connected) color = '#d32f2f'; 

          // Selected Highlight
          if (selectedNodeId === node.id) {
              const sz = 24;
              ctx.strokeStyle = '#2b7042';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x - sz, y - sz + 8); ctx.lineTo(x - sz, y - sz); ctx.lineTo(x - sz + 8, y - sz);
              ctx.moveTo(x + sz, y - sz + 8); ctx.lineTo(x + sz, y - sz); ctx.lineTo(x + sz - 8, y - sz);
              ctx.moveTo(x - sz, y + sz - 8); ctx.lineTo(x - sz, y + sz); ctx.lineTo(x - sz + 8, y + sz);
              ctx.moveTo(x + sz, y + sz - 8); ctx.lineTo(x + sz, y + sz); ctx.lineTo(x + sz - 8, y + sz);
              ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(x, y, node.role === 'Base Camp' ? 10 : 8, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Label
          ctx.fillStyle = '#1a221d'; // dark text
          ctx.font = 'bold 11px monospace';
          ctx.fillText(node.id.toUpperCase(), x + 12, y + 4);
          
          if (node.lat && node.lng) {
              ctx.font = '9px monospace';
              ctx.fillStyle = '#666';
              ctx.fillText(`${node.lat.toFixed(4)}° N, ${node.lng.toFixed(4)}° E`, x + 12, y + 16);
          }
      });
    };

    // Delay initial render slightly to ensure CSS layouts calculate correctly
    setTimeout(render, 50);

    return () => {
        resizeObj.disconnect();
    }
  }, [nodes, selectedNodeId]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
