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
  User,
  Calendar,
  Wifi
} from "lucide-react";

// MOCK DATA: Contoh Data Siswa
const initialStudents = [
  {
    id: 1,
    nis: "20241001",
    name: "Ahmad Rizki",
    pob: "Jakarta", // Tempat Lahir
    dob: "12 Mei 2007", // Tanggal Lahir
    gender: "L", // L atau P
    classCode: "CLS-X-IPA1",
    className: "X MIPA 1",
    lastLogin: "Online", // Bisa 'Online' atau tanggal terakhir
  },
  {
    id: 2,
    nis: "20241002",
    name: "Bunga Citra",
    pob: "Bandung",
    dob: "03 Ags 2007",
    gender: "P",
    classCode: "CLS-X-IPA1",
    className: "X MIPA 1",
    lastLogin: "Kemarin, 14:00",
  },
  {
    id: 3,
    nis: "20241003",
    name: "Candra Wijaya",
    pob: "Surabaya",
    dob: "20 Jan 2006",
    gender: "L",
    classCode: "CLS-XI-IPS2",
    className: "XI IPS 2",
    lastLogin: "20 Jan 2024",
  },
  {
    id: 4,
    nis: "20241004",
    name: "Dinda Kirana",
    pob: "Medan",
    dob: "15 Feb 2007",
    gender: "P",
    classCode: "CLS-X-IPA2",
    className: "X MIPA 2",
    lastLogin: "Online",
  },
];

export default function SiswaPage() {
  const [data, setData] = useState(initialStudents);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- FUNGSI LOGIKA ---

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOpenDropdownId(null);
    }, 800);
  };

  const handleAdd = () => {
    const newId = Date.now();
    const newItem = {
      id: newId,
      nis: `2024${Math.floor(1000 + Math.random() * 9000)}`,
      name: "Siswa Baru (Draft)",
      pob: "Kota",
      dob: "01 Jan 2008",
      gender: Math.random() > 0.5 ? "L" : "P",
      classCode: "CLS-X-NEW",
      className: "X Baru",
      lastLogin: "Belum Login",
    };
    setData([newItem, ...data]);
  };

  const handleDelete = (id) => {
    if (confirm("Hapus data siswa ini?")) {
      setData(data.filter((item) => item.id !== id));
      setOpenDropdownId(null);
    }
  };

  // Filter Data (Pencarian + Filter Kelas)
  const filteredData = data.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                        item.nis.includes(search);
    const matchClass = filterClass ? item.className === filterClass : true;
    return matchSearch && matchClass;
  });

  // Unique Classes untuk Dropdown Filter
  const classOptions = [...new Set(data.map(item => item.className))];

  // Tutup dropdown jika klik di luar
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-500 text-sm">Kelola data siswa, akun login, dan pembagian kelas.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <Plus size={20} />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        
        {/* Filter Kelas */}
        <div className="w-full md:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
          >
            <option value="">Semua Kelas</option>
            {classOptions.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama siswa atau NIS..." 
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
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-center w-14">No</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">NIS</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Nama Siswa</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">TTL</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-center">L/P</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Kode Kelas</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Kelas</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Login</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-center w-20">Opsi</th>
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
                      <td className="py-4 px-6 text-sm text-center text-gray-500 font-medium">{index + 1}</td>
                      
                      <td className="py-4 px-6 text-sm">
                        <span className="font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{item.nis}</span>
                      </td>
                      
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">{item.name}</td>
                      
                      <td className="py-4 px-6 text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">{item.pob}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={10} /> {item.dob}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                          ${item.gender === 'L' 
                            ? 'bg-blue-100 text-blue-600' // Laki-laki Biru
                            : 'bg-pink-100 text-pink-600' // Perempuan Pink
                          }
                        `}>
                          {item.gender}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-500">{item.classCode}</td>
                      
                      <td className="py-4 px-6 text-sm font-medium text-gray-700">{item.className}</td>

                      <td className="py-4 px-6 text-sm">
                        {item.lastLogin === 'Online' ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full w-fit text-xs">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Online
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                            <Wifi size={12} />
                            {item.lastLogin}
                          </div>
                        )}
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
                                onClick={() => { alert(`Edit: ${item.name}`); setOpenDropdownId(null); }}
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
                    <td colSpan="9" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <User size={32} className="text-gray-300" />
                        <p>Data siswa tidak ditemukan</p>
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
            Menampilkan <span className="font-bold text-gray-900">{filteredData.length}</span> siswa
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