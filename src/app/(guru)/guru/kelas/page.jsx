"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  RefreshCw, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Filter,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";

// MOCK DATA: Contoh Data Kelas
const initialClasses = [
  {
    id: 1,
    code: "CLS-X-IPA1",
    name: "X MIPA 1",
    status: "active", // active | inactive
    createdAt: "20 Jan 2024",
    studentCount: 32
  },
  {
    id: 2,
    code: "CLS-X-IPA2",
    name: "X MIPA 2",
    status: "active",
    createdAt: "21 Jan 2024",
    studentCount: 30
  },
  {
    id: 3,
    code: "CLS-XI-IPS1",
    name: "XI IPS 1",
    status: "inactive", // Kelas tahun lalu misalnya
    createdAt: "15 Jan 2023",
    studentCount: 28
  },
  {
    id: 4,
    code: "CLS-XII-BHS",
    name: "XII Bahasa",
    status: "active",
    createdAt: "10 Feb 2024",
    studentCount: 25
  },
];

export default function KelasPage() {
  const [data, setData] = useState(initialClasses);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- FUNGSI LOGIKA ---

  // 1. Simulasi Refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOpenDropdownId(null);
    }, 800);
  };

  // 2. Simulasi Tambah Data
  const handleAdd = () => {
    const newId = Date.now(); // ID unik sederhana
    const newItem = {
      id: newId,
      code: `CLS-NEW-${Math.floor(Math.random() * 100)}`,
      name: "Kelas Baru (Draft)",
      status: "active",
      createdAt: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
      studentCount: 0
    };
    setData([newItem, ...data]);
  };

  // 3. Simulasi Hapus
  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini? Data siswa di dalamnya mungkin akan terpengaruh.")) {
      setData(data.filter((item) => item.id !== id));
      setOpenDropdownId(null);
    }
  };

  // 4. Filter Data
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.code.toLowerCase().includes(search.toLowerCase())
  );

  // 5. Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-dropdown")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Kelas</h1>
          <p className="text-gray-500 text-sm">Kelola daftar kelas dan status keaktifannya.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <Plus size={20} />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        {/* Filter Status */}
        <div className="w-full md:w-56 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none">
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Non-Aktif</option>
          </select>
        </div>

        {/* Search */}
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama kelas atau kode..." 
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
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Kode Kelas</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Kelas</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-32 text-center">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Dibuat</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-24 text-center">Aksi</th>
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
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-center text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      
                      <td className="py-4 px-6 text-sm">
                        <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">
                          {item.code}
                        </span>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.studentCount} Siswa Terdaftar</p>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border
                          ${item.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-gray-100 text-gray-500 border-gray-200'}
                        `}>
                          {item.status === 'active' ? (
                            <><CheckCircle size={12} /> Aktif</>
                          ) : (
                            <><XCircle size={12} /> Non-Aktif</>
                          )}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {item.createdAt}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center relative action-dropdown">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${openDropdownId === item.id ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"}`}
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {openDropdownId === item.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-8 top-8 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left"
                            >
                              <button 
                                onClick={() => { alert(`Edit Kelas: ${item.name}`); setOpenDropdownId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                              <div className="border-t border-gray-50" />
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                                Hapus
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="text-gray-300" />
                        <p>Data kelas tidak ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-bold text-gray-900">{filteredData.length}</span> kelas
          </p>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-500 disabled:opacity-50" disabled>Sebelumnya</button>
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}