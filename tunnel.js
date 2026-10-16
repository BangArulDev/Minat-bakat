// tunnel.js - Auto-restart localtunnel jika mati
// Jalankan: node tunnel.js

const { exec } = require('child_process');

let tunnelProcess = null;

function startTunnel() {
  console.log(`[${new Date().toLocaleTimeString()}] Starting localtunnel...`);
  
  tunnelProcess = exec('lt --port 3000 --subdomain minat-bakat-app', (error, stdout, stderr) => {
    if (error) {
      console.log(`[${new Date().toLocaleTimeString()}] Tunnel error: ${error.message}`);
    }
  });

  tunnelProcess.stdout.on('data', (data) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${data.trim()}`);
  });

  tunnelProcess.stderr.on('data', (data) => {
    console.error(`[${new Date().toLocaleTimeString()}] STDERR: ${data.trim()}`);
  });

  tunnelProcess.on('close', (code) => {
    console.log(`[${new Date().toLocaleTimeString()}] Tunnel closed (code: ${code}). Restarting in 3s...`);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();

console.log('');
console.log('====================================================');
console.log('  Webhook URL: https://minat-bakat-app.loca.lt');
console.log('  Callback Flip: .../api/payment/webhook');
console.log('====================================================');
console.log('Press Ctrl+C to stop');
console.log('');
