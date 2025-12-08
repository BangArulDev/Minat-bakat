"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Table, 
  Download, 
  Filter, 
  Search, 
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

// --- KONFIGURASI KOLOM TES ---
const testConfigs = {
  "RIASEC": {
    columns: ["R", "I", "A", "S", "E", "C"], // Kode Header
    fullNames: ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"],
    maxScore: 40 // Asumsi skor maksimal per kategori
  },
  "VAK": {
    columns: ["V", "A", "K"],
    fullNames: ["Visual", "Auditory", "Kinesthetic"],
    maxScore: 100
  }
};

// --- MOCK DATA ---
const initialData = [
  { id: 1, nis: "20241001", name: "Ahmad Rizki", class: "X MIPA 1", scores: { R: 35, I: 20, A: 10, S: 15, E: 5, C: 25 }, dominant: "Realistic" },
  { id: 2, nis: "20241002", name: "Bunga Citra", class: "X MIPA 1", scores: { R: 10, I: 15, A: 38, S: 20, E: 10, C: 5 }, dominant: "Artistic" },
  { id: 3, nis: "20241003", name: "Candra Wijaya", class: "X MIPA 1", scores: { R: 15, I: 15, A: 10, S: 10, E: 32, C: 10 }, dominant: "Enterprising" },
  { id: 4, nis: "20241004", name: "Dinda Kirana", class: "X MIPA 1", scores: { R: 20, I: 35, A: 15, S: 10, E: 10, C: 15 }, dominant: "Investigative" },
  { id: 5, nis: "20241005", name: "Eko Prasetyo", class: "X MIPA 1", scores: { R: 30, I: 30, A: 10, S: 25, E: 20, C: 35 }, dominant: "Conventional" },
];

export default function TabulasiPage() {
  const [selectedClass, setSelectedClass] = useState("X MIPA 1");
  const [selectedTest, setSelectedTest] = useState("RIASEC");
  const [search, setSearch] = useState("");

  // Konfigurasi kolom berdasarkan tes yang dipilih
  const currentConfig = testConfigs[selectedTest];

  // Filter Data
  const filteredData = initialData.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.nis.includes(search)
  );

  // Helper: Cek apakah ini skor tertinggi di baris tersebut
  const isHighest = (scores, key) => {
    const values = Object.values(scores);
    const max = Math.max(...values);
    return scores[key] === max;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tabulasi Data</h1>
          <p className="text-gray-500 text-sm">Tabel matriks skor perolehan siswa per kategori.</p>
        </div>

        <button 
          onClick={() => alert("Exporting to CSV...")}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-200"
        >
          <FileSpreadsheet size={20} />
          <span>Export Excel</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        
        {/* Filter Kelas */}
        <div className="w-full md:w-48 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
          >
            <option>X MIPA 1</option>
            <option>X MIPA 2</option>
            <option>XI IPS 1</option>
          </select>
        </div>

        {/* Filter Jenis Tes */}
        <div className="w-full md:w-48 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Table size={18} className="text-gray-400" />
          </div>
          <select 
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
          >
            <option value="RIASEC">RIASEC</option>
            <option value="VAK">Gaya Belajar (VAK)</option>
          </select>
        </div>

        {/* Search */}
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama siswa..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Info Legend */}
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center gap-2 text-sm text-blue-800">
          <AlertCircle size={16} />
          <span>Angka yang <strong>di-bold</strong> dan berlatar biru adalah skor tertinggi siswa tersebut.</span>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-4 font-semibold text-sm text-gray-500 w-12 text-center sticky left-0 bg-gray-50 z-10 border-r border-gray-200">No</th>
                <th className="py-4 pl-4 pr-10 font-semibold text-sm text-gray-500 sticky left-12 bg-gray-50 z-10 border-r border-gray-200 min-w-auto">Identitas Siswa</th>
                
                {/* Dynamic Columns Header */}
                {currentConfig.columns.map((col, idx) => (
                  <th key={col} className="py-4 px-4 font-bold text-sm text-gray-700 text-center w-20 bg-gray-50" title={currentConfig.fullNames[idx]}>
                    {col}
                  </th>
                ))}
                
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 border-l border-gray-200">Kesimpulan Dominan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-center text-gray-500 font-medium sticky left-0 bg-white z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {index + 1}
                    </td>
                    
                    <td className="py-3 px-4 sticky left-12 bg-white z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.nis}</p>
                    </td>

                    {/* Dynamic Scores Cells */}
                    {currentConfig.columns.map(col => {
                      const score = item.scores[col] || 0;
                      const active = isHighest(item.scores, col);
                      return (
                        <td key={col} className={`py-3 px-4 text-center border-r border-gray-50 last:border-0 ${active ? "bg-blue-50" : ""}`}>
                          <span className={`inline-block py-1 px-2 rounded-lg text-sm
                            ${active ? "font-bold text-blue-700" : "text-gray-500"}
                          `}>
                            {score}
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-3 px-6 border-l border-gray-100">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {item.dominant}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={currentConfig.columns.length + 3} className="py-12 text-center text-gray-500">
                    Data tidak ditemukan untuk kelas ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}