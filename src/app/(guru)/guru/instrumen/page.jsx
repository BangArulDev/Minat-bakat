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
  Filter
} from "lucide-react";

// MOCK DATA: Contoh Data Pertanyaan
const initialQuestions = [
  {
    id: 1,
    question: "Saya suka memperbaiki alat-alat listrik atau mesin kendaraan.",
    field: "Realistic",
  },
  {
    id: 2,
    question: "Saya senang membaca buku tentang sains dan teknologi.",
    field: "Investigative",
  },
  {
    id: 3,
    question: "Saya suka melukis, menggambar, atau bermain musik di waktu luang.",
    field: "Artistic",
  },
  {
    id: 4,
    question: "Saya merasa senang jika bisa membantu teman yang sedang kesulitan.",
    field: "Social",
  },
  {
    id: 5,
    question: "Saya suka memimpin diskusi kelompok atau menjadi ketua kelas.",
    field: "Enterprising",
  },
  {
    id: 6,
    question: "Saya suka menyusun jadwal kegiatan agar teratur dan rapi.",
    field: "Conventional",
  },
];

export default function InstrumenPage() {
  const [data, setData] = useState(initialQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // State untuk melacak dropdown mana yang sedang terbuka (berdasarkan ID)
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- FUNGSI LOGIKA ---

  // 1. Simulasi Refresh Data
  const handleRefresh = () => {
    setIsLoading(true);
    // Pura-pura loading selama 1 detik
    setTimeout(() => {
      setIsLoading(false);
      setOpenDropdownId(null); // Tutup semua dropdown
    }, 1000);
  };

  // 2. Simulasi Tambah Data (Sederhana)
  const handleAdd = () => {
    const newId = data.length + 1;
    const newItem = {
      id: newId,
      question: "Pertanyaan baru (Draft)...",
      field: "Uncategorized",
    };
    // Tambahkan ke paling atas
    setData([newItem, ...data]);
  };

  // 3. Simulasi Hapus Data
  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus pertanyaan ini?")) {
      setData(data.filter((item) => item.id !== id));
      setOpenDropdownId(null);
    }
  };

  // 4. Toggle Dropdown
  const toggleDropdown = (id) => {
    // Jika ID yang diklik sama dengan yang sedang buka, maka tutup (null). 
    // Jika beda, maka buka yang baru.
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Filter Pencarian
  const filteredData = data.filter(item =>
    item.question.toLowerCase().includes(search.toLowerCase()) ||
    item.field.toLowerCase().includes(search.toLowerCase())
  );

  // Tutup dropdown jika klik di luar area (Opsional UX)
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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Butir Instrumen</h1>
          <p className="text-gray-500 text-sm">Tambahkan, edit, atau hapus pertanyaan untuk tes minat bakat.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tombol Refresh */}
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>

          {/* Tombol Tambah */}
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <Plus size={20} />
            <span>Tambah Data</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
        {/* Dropdown Filter Jenis Instrumen (Opsional) */}
        <div className="w-full md:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer">
            <option>Semua Instrumen</option>
            <option>RIASEC (Minat)</option>
            <option>VAK (Gaya Belajar)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari pertanyaan atau bidang..." 
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
            
            {/* Header Tabel */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-16 text-center">No</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Pertanyaan</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-48">Bidang Pertanyaan</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-24 text-center">Aksi</th>
              </tr>
            </thead>

            {/* Body Tabel */}
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="py-4 px-6 text-sm text-center text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium leading-relaxed">
                        {item.question}
                      </td>
                      
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          {item.field}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center relative action-dropdown">
                        {/* Tombol Titik Tiga */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Mencegah event bubbling
                            toggleDropdown(item.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${openDropdownId === item.id ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"}`}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu (Muncul jika ID cocok) */}
                        <AnimatePresence>
                          {openDropdownId === item.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-8 top-8 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left"
                            >
                              <button 
                                onClick={() => {
                                  alert(`Edit ID: ${item.id}`);
                                  setOpenDropdownId(null);
                                }}
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
                    <td colSpan="4" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="text-gray-300" />
                        <p>Data tidak ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Footer Tabel / Pagination (Statis) */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-bold text-gray-900">{filteredData.length}</span> data
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