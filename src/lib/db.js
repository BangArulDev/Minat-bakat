import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data.json");

// Inisialisasi struktur database default jika belum ada
function initDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({
      users: [],
      classrooms: [
        { id: "1", classCode: "X-IPA-1", name: "X IPA 1", teacherId: "T-1" },
        { id: "2", classCode: "X-IPS-1", name: "X IPS 1", teacherId: "T-1" }
      ],
      results: [],
      transactions: []
    }, null, 2));
  }
}

export function getDB() {
  initDB();
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { users: [], classrooms: [], results: [], transactions: [] };
  }
}

export function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Generate unique ID
export function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
