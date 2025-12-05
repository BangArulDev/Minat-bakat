"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  BellRing, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  XCircle,
  MoreVertical,
  Eye
} from "lucide-react";

// --- MOCK DATA ---
const initialData = [
  {
    id: 1,
    nis: "20241001",
    name: "Ahmad Rizki",
    className: "X MIPA 1",
    status: "Selesai", // Selesai | Proses | Belum
    progress: 100, // Persentase
    lastActivity: "12 Okt 2024, 10:30",
    testType: "RIASEC"
  },
  {
    id: 2,
    nis: "20241002",
    name: "Bunga Citra",
    className: "X MIPA 1",
    status: "Proses",
    progress: 45, // Baru 45%
    lastActivity: "Hari ini, 09:15",
    testType: "RIASEC"
  },
  {
    id: 3,
    nis: "20241003",
    name: "Candra Wijaya",
    className: "XI IPS 2",
    status: "Belum",
    progress: 0,
    lastActivity: "-",
    testType: "-"
  },
  {
    id: 4,
    nis: "20241004",
    name: "Dinda Kirana",
    className: "X MIPA 2",
    status: "Selesai",
    progress: 100,
    lastActivity: "Kemarin, 14:20",
    testType: "VAK"
  },
  {
    id: 5,
    nis: "20241005",
    name: "Eko Prasetyo",
    className: "X MIPA 1",
    status: "Proses",
    progress: 80,
    lastActivity: "10 mnt lalu",
    testType: "RIASEC"
  },
];

export default function AnalisisDataSiswaPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("Semua Kelas");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- LOGIC ---
  
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOpenDropdownId(null);
    }, 800);
  };

  const handleRemind = (name) => {
    alert(`Mengirim notifikasi pengingat kepada ${name}...`);
    setOpenDropdownId(null);
  };

  const handleReset = (name) => {
    if(confirm(`Apakah Anda yakin ingin mereset progres tes siswa ${name}? Data jawaban akan hilang.`)) {
      alert("Progres berhasil direset.");
    }
    setOpenDropdownId(null);
  };

  // Filter Logic
  const filteredData = data.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.nis.includes(search);
    const matchClass = filterClass === "Semua Kelas" ? true : item.className === filterClass;
    const matchStatus = filterStatus === "Semua Status" ? true : item.status === filterStatus;
    
    return matchSearch && matchClass && matchStatus;
  });

  // Unique Classes
  const classList = [...new Set(data.map(item => item.className))];

  // Statistik Cepat
  const stats = {
    total: data.length,
    selesai: data.filter(i => i.status === "Selesai").length,
    proses: data.filter(i => i.status === "Proses").length,
    belum: data.filter(i => i.status === "Belum").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring Pengerjaan</h1>
          <p className="text-gray-500 text-sm">Pantau progres pengerjaan tes siswa secara real-time.</p>
        </div>

        <div className="flex gap-3">
          <button 
             onClick={handleRefresh}
             className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => alert("Mengirim pengingat massal...")}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-100 text-orange-700 font-bold rounded-xl hover:bg-orange-200 transition-all"
          >
            <BellRing size={18} />
            <span className="hidden sm:inline">Ingatkan Semua</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS (Ringkasan Cepat) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Siswa" value={stats.total} color="bg-white border-gray-200 text-gray-900" />
        <StatCard label="Selesai" value={stats.selesai} color="bg-green-50 border-green-200 text-green-700" />
        <StatCard label="Sedang Proses" value={stats.proses} color="bg-yellow-50 border-yellow-200 text-yellow-700" />
        <StatCard label="Belum Mulai" value={stats.belum} color="bg-gray-100 border-gray-200 text-gray-500" />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        
        {/* Filter Kelas */}
        <div className="w-full md:w-48 relative">
           <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
          >
            <option>Semua Kelas</option>
            {classList.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <Filter size={16} />
          </div>
        </div>

        {/* Filter Status */}
        <div className="w-full md:w-48 relative">
           <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
          >
            <option>Semua Status</option>
            <option>Selesai</option>
            <option>Proses</option>
            <option>Belum</option>
          </select>
        </div>

        {/* Search */}
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau NIS..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-16 text-center">No</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Siswa</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Kelas</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-48">Progres</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Aktivitas Terakhir</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-center text-gray-500 font-medium">{index + 1}</td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{item.nis}</p>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">{item.className}</td>

                      {/* Progress Bar Column */}
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.status === "Selesai" ? "bg-green-500" : 
                                item.status === "Proses" ? "bg-yellow-400" : "bg-gray-300"
                              }`} 
                              style={{ width: `${item.progress}%` }} 
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-500 w-8">{item.progress}%</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                          ${item.status === "Selesai" ? "bg-green-50 text-green-700 border-green-200" : 
                            item.status === "Proses" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
                            "bg-gray-100 text-gray-500 border-gray-200"}
                        `}>
                          {item.status === "Selesai" && <CheckCircle size={12} />}
                          {item.status === "Proses" && <Clock size={12} />}
                          {item.status === "Belum" && <XCircle size={12} />}
                          {item.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-500">
                        {item.lastActivity}
                      </td>

                      {/* Action Dropdown */}
                      <td className="py-4 px-6 text-center relative">
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {openDropdownId === item.id && (
                            <div className="absolute right-8 top-10 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left origin-top-right">
                              {/* Opsi beda tergantung status */}
                              {item.status === "Selesai" ? (
                                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                  <Eye size={16} /> Lihat Hasil
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleRemind(item.name)}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                  <BellRing size={16} /> Ingatkan
                                </button>
                              )}
                              
                              <div className="border-t border-gray-50" />
                              
                              <button 
                                onClick={() => handleReset(item.name)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <RotateCcw size={16} /> Reset Tes
                              </button>
                            </div>
                          )}
                        </AnimatePresence>
                      </td>

                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500">Data tidak ditemukan</td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
           <p className="text-xs text-gray-500">Menampilkan <span className="font-bold">{filteredData.length}</span> data</p>
           <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border rounded text-xs text-gray-400" disabled>Previous</button>
              <button className="px-3 py-1 bg-white border rounded text-xs hover:bg-gray-50">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component untuk Kartu Statistik Kecil
function StatCard({ label, value, color }) {
  return (
    <div className={`p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center ${color}`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs opacity-80 font-medium uppercase tracking-wider">{label}</span>
    </div>
  )
}