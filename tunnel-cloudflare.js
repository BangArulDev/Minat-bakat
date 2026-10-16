// tunnel-cloudflare.js - Cloudflare Quick Tunnel dengan auto-update .env
// Jalankan: node tunnel-cloudflare.js
//
// Script ini menjalankan `cloudflared tunnel --url http://localhost:3000`,
// mengambil URL publik (https://xxxx.trycloudflare.com), lalu otomatis
// memperbarui NEXT_PUBLIC_APP_URL dan AUTH_URL di file .env.
//
// PENTING: URL quick tunnel berubah setiap cloudflared dijalankan ulang.
// Setelah .env diperbarui, restart `npm run dev` agar nilai baru terbaca,
// dan perbarui Callback URL di dashboard Flip.

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || "3000";
const ENV_FILE = path.join(__dirname, ".env");

const CLOUDFLARED = [
  process.env.CLOUDFLARED_PATH,
  "C:\\Program Files (x86)\\cloudflared\\cloudflared.exe",
  "C:\\Program Files\\cloudflared\\cloudflared.exe",
  "cloudflared",
]
  .filter(Boolean)
  .find((p) => p === "cloudflared" || fs.existsSync(p));

if (!CLOUDFLARED) {
  console.error("cloudflared tidak ditemukan. Install dulu: winget install Cloudflare.cloudflared");
  process.exit(1);
}

let currentUrl = null;

function updateEnv(url) {
  if (!fs.existsSync(ENV_FILE)) {
    console.warn(".env tidak ditemukan, lewati update otomatis.");
    return;
  }
  let content = fs.readFileSync(ENV_FILE, "utf8");
  if (/^NEXT_PUBLIC_APP_URL=/m.test(content)) {
    content = content.replace(/^NEXT_PUBLIC_APP_URL=.*$/m, `NEXT_PUBLIC_APP_URL="${url}"`);
  } else {
    content += `\nNEXT_PUBLIC_APP_URL="${url}"\n`;
  }
  if (/^AUTH_URL=/m.test(content)) {
    content = content.replace(/^AUTH_URL=.*$/m, `AUTH_URL="${url}"`);
  } else {
    content += `AUTH_URL="${url}"\n`;
  }
  fs.writeFileSync(ENV_FILE, content);
}

function printBanner(url) {
  console.log("");
  console.log("====================================================");
  console.log("  Public URL    : " + url);
  console.log("  Flip Webhook  : " + url + "/api/payment/webhook");
  console.log("  .env diperbarui: NEXT_PUBLIC_APP_URL & AUTH_URL");
  console.log("  -> RESTART `npm run dev` agar .env terbaca");
  console.log("====================================================");
  console.log("");
}

function start() {
  console.log(`Menjalankan cloudflared: ${CLOUDFLARED}`);

  const proc = spawn(
    CLOUDFLARED,
    ["tunnel", "--url", `http://localhost:${PORT}`, "--no-autoupdate"],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  const onData = (data) => {
    const text = data.toString();
    process.stdout.write(text);
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && match[0] !== currentUrl) {
      currentUrl = match[0];
      updateEnv(currentUrl);
      printBanner(currentUrl);
    }
  };

  proc.stdout.on("data", onData);
  proc.stderr.on("data", onData);

  proc.on("close", (code) => {
    console.log(`cloudflared berhenti (code: ${code}). Restart dalam 3s...`);
    setTimeout(start, 3000);
  });

  proc.on("error", (err) => {
    console.error("Gagal menjalankan cloudflared:", err.message);
    setTimeout(start, 3000);
  });
}

start();

console.log("Cloudflare Tunnel. Tekan Ctrl+C untuk berhenti.");
