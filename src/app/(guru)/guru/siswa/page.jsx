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
  Key,
  X,
  Save,
  AlertTriangle,
  Hash,
  School,
  MapPin
} from "lucide-react";

// MOCK DATA: Contoh Data Siswa
const initialStudents = [
  {
    id: 1,
    nis: "20241001",
    username: "20241001", // Username default sama dengan NIS
    name: "Ahmad Rizki",
    pob: "Jakarta",
    dob: "12 Mei 2007",
    gender: "L",
    classCode: "CLS-X-IPA1",
    className: "X MIPA 1",
  },
  {
    id: 2,
    nis: "20241002",
    username: "20241002",
    name: "Bunga Citra",
    pob: "Bandung",
    dob: "03 Ags 2007",
    gender: "P",
    classCode: "CLS-X-IPA1",
    className: "X MIPA 1",
  },
  {
    id: 3,
    nis: "20241003",
    username: "20241003",
    name: "Candra Wijaya",
    pob: "Surabaya",
    dob: "20 Jan 2006",
    gender: "L",
    classCode: "CLS-XI-IPS2",
    className: "XI IPS 2",
  },
  {
    id: 4,
    nis: "20241004",
    username: "20241004",
    name: "Dinda Kirana",
    pob: "Medan",
    dob: "15 Feb 2007",
    gender: "P",
    classCode: "CLS-X-IPA2",
    className: "X MIPA 2",
  },
];

// Opsi Kelas (Bisa diambil dari API nantinya)
const classOptions = ["X MIPA 1", "X MIPA 2", "XI IPS 1", "XI IPS 2", "XII Bahasa"];

export default function SiswaPage() {
  const [data, setData] = useState(initialStudents);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- STATE MODAL FORM (ADD/EDIT) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nis: "",
    name: "",
    pob: "",
    dob: "",
    gender: "L",
    className: "X MIPA 1"
  });

  // --- STATE MODAL DELETE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- FUNGSI LOGIKA ---

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOpenDropdownId(null);
    }, 800);
  };

  // 1. Handle Tambah Data
  const handleAddClick = () => {
    setIsEditMode(false);
    // Generate NIS Baru (Simulasi)
    const newNIS = `2024${Math.floor(1000 + Math.random() * 9000)}`;
    
    setFormData({
      id: Date.now(),
      nis: newNIS,
      name: "",
      pob: "",
      dob: "",
      gender: "L",
      className: "X MIPA 1"
    });
    setIsModalOpen(true);
  };

  // 2. Handle Edit Data
  const handleEditClick = (item) => {
    setIsEditMode(true);
    setFormData(item);
    setOpenDropdownId(null);
    setIsModalOpen(true);
  };

  // 3. Simpan Data (Add/Edit)
  const handleSaveData = () => {
    if (!formData.name || !formData.pob || !formData.dob) {
      alert("Harap lengkapi semua data siswa!");
      return;
    }

    if (isEditMode) {
      // Update Data
      setData(data.map(item => item.id === formData.id ? { 
        ...formData, 
        username: formData.nis // Username selalu sync dengan NIS
      } : item));
    } else {
      // Create Data Baru
      const newItem = {
        ...formData,
        username: formData.nis, // Username otomatis NIS
        classCode: `CLS-${formData.className.replace(/\s/g, '-')}` // Generate kode kelas dummy
      };
      setData([newItem, ...data]);
    }
    setIsModalOpen(false);
  };

  // 4. Handle Delete
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setOpenDropdownId(null);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setData(data.filter((item) => item.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Filter Data
  const filteredData = data.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                        item.nis.includes(search);
    const matchClass = filterClass ? item.className === filterClass : true;
    return matchSearch && matchClass;
  });

  // Unique Classes untuk Dropdown Filter
  const uniqueClasses = [...new Set(data.map(item => item.className))];

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
            onClick={handleAddClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <Plus size={20} />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
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
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

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
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Kelas</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Login (Username)</th>
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
                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm text-center text-gray-500 font-medium">{index + 1}</td>
                      
                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm">
                        <span className="font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{item.nis}</span>
                      </td>
                      
                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm font-bold text-gray-900">{item.name}</td>
                      
                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">{item.pob}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={10} /> {item.dob}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap w-auto py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                          ${item.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}
                        `}>
                          {item.gender}
                        </span>
                      </td>

                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm font-medium text-gray-700">{item.className}</td>

                      {/* Kolom Login (Username) */}
                      <td className="whitespace-nowrap w-auto py-4 px-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-fit">
                          <Key size={14} className="text-gray-400" />
                          <span className="font-mono font-bold">{item.username}</span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap w-auto py-4 px-6 text-center relative action-dropdown">
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
                                onClick={() => handleEditClick(item)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                              >
                                <Edit size={16} /> Edit
                              </button>
                              <div className="border-t border-gray-50" />
                              <button 
                                onClick={() => handleDeleteClick(item)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} /> Hapus
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500">
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
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">Menampilkan <span className="font-bold text-gray-900">{filteredData.length}</span> siswa</p>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-500" disabled>Sebelumnya</button>
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50">Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* --- MODAL FORM (ADD/EDIT) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-g60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {isEditMode ? <Edit size={20} className="text-orange-600" /> : <Plus size={20} className="text-blue-600" />}
                  {isEditMode ? "Edit Data Siswa" : "Tambah Siswa Baru"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NIS (Auto/Manual) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Hash size={14} /> NIS</label>
                    <input type="text" value={formData.nis} onChange={(e) => setFormData({...formData, nis: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
                  </div>

                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><User size={14} /> Nama Lengkap</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>

                  {/* Tempat Lahir */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><MapPin size={14} /> Tempat Lahir</label>
                    <input type="text" value={formData.pob} onChange={(e) => setFormData({...formData, pob: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Calendar size={14} /> Tanggal Lahir</label>
                    <input type="text" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} placeholder="Contoh: 12 Mei 2007" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Jenis Kelamin</label>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" checked={formData.gender === 'L'} onChange={() => setFormData({...formData, gender: 'L'})} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Laki-laki</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" checked={formData.gender === 'P'} onChange={() => setFormData({...formData, gender: 'P'})} className="w-4 h-4 text-pink-600" />
                        <span className="text-sm font-medium text-gray-700">Perempuan</span>
                      </label>
                    </div>
                  </div>

                  {/* Kelas */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><School size={14} /> Kelas</label>
                    <select value={formData.className} onChange={(e) => setFormData({...formData, className: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
                      {classOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-white">Batal</button>
                <button onClick={handleSaveData} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"><Save size={18} /> Simpan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DELETE --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Siswa?</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Apakah Anda yakin ingin menghapus data <span className="font-bold text-gray-800">{itemToDelete?.name}</span>? Data hasil tes siswa ini juga akan terhapus.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Batal</button>
                <button onClick={confirmDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200">Ya, Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}