"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, RefreshCw, Search, MoreVertical, Edit, Trash2, Filter, 
  X, Save, Hash, List, Type, AlertTriangle 
} from "lucide-react";

// MOCK DATA
const initialQuestions = [
  { id: 1, question: "Saya suka memperbaiki alat-alat listrik atau mesin kendaraan.", field: "Realistic" },
  { id: 2, question: "Saya senang membaca buku tentang sains dan teknologi.", field: "Investigative" },
  { id: 3, question: "Saya suka melukis, menggambar, atau bermain musik di waktu luang.", field: "Artistic" },
  { id: 4, question: "Saya merasa senang jika bisa membantu teman yang sedang kesulitan.", field: "Social" },
  { id: 5, question: "Saya suka memimpin diskusi kelompok atau menjadi ketua kelas.", field: "Enterprising" },
  { id: 6, question: "Saya suka menyusun jadwal kegiatan agar teratur dan rapi.", field: "Conventional" },
];

const fieldOptions = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"];

export default function InstrumenPage() {
  // Mengurutkan data awal berdasarkan ID
  const [data, setData] = useState(initialQuestions.sort((a, b) => a.id - b.id));
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- STATE MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State untuk menyimpan ID asli sebelum diedit (PENTING untuk validasi)
  const [originalId, setOriginalId] = useState(null); 
  
  const [formData, setFormData] = useState({ id: "", field: "Realistic", question: "" });

  // --- STATE DELETE MODAL ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- FUNGSI LOGIKA ---

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Reset ke data awal dan acak sedikit urutannya sebagai simulasi fetch
      setData([...initialQuestions].sort((a, b) => a.id - b.id));
      setIsLoading(false);
      setOpenDropdownId(null);
    }, 1000);
  };

  // 1. Buka Modal untuk TAMBAH
  const handleAddClick = () => {
    // Cari ID terbesar + 1 untuk auto number, tapi user BISA ubah
    const nextId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
    
    setIsEditMode(false);
    setOriginalId(null); // Tidak ada ID asli karena data baru
    setFormData({ id: nextId, field: "Realistic", question: "" });
    setIsModalOpen(true);
  };

  // 2. Buka Modal untuk EDIT
  const handleEditClick = (item) => {
    setIsEditMode(true);
    setOriginalId(item.id); // Simpan ID asli untuk referensi update
    setFormData(item);
    setOpenDropdownId(null);
    setIsModalOpen(true);
  };

  // 3. Simpan Data (Dengan Validasi ID Unik)
  const handleSaveData = () => {
    // A. Validasi Input Kosong
    if (!formData.question.trim()) {
      alert("Harap isi teks pertanyaan!");
      return;
    }
    if (!formData.id) {
      alert("Harap isi nomor pertanyaan!");
      return;
    }

    const newId = parseInt(formData.id);

    // B. Validasi Duplikat ID
    // Cek apakah ID baru sudah ada di data lain (kecuali data yang sedang diedit itu sendiri)
    const isDuplicate = data.some(item => item.id === newId && item.id !== originalId);

    if (isDuplicate) {
      alert(`Nomor pertanyaan ${newId} sudah digunakan. Harap gunakan nomor lain.`);
      return;
    }

    let updatedData;

    if (isEditMode) {
      // LOGIKA UPDATE:
      // Ganti item yang punya ID == originalId dengan data baru (termasuk jika ID-nya berubah)
      updatedData = data.map(item => item.id === originalId ? { ...formData, id: newId } : item);
      alert("Data berhasil diperbarui!");
    } else {
      // LOGIKA CREATE:
      updatedData = [...data, { ...formData, id: newId }];
      alert("Data berhasil ditambahkan!");
    }

    // Sortir ulang data berdasarkan ID agar tabel rapi
    updatedData.sort((a, b) => a.id - b.id);
    
    setData(updatedData);
    setIsModalOpen(false);
  };

  // 4. Trigger Modal Hapus
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setOpenDropdownId(null);
    setIsDeleteModalOpen(true);
  };

  // 5. Konfirmasi Hapus
  const confirmDelete = () => {
    if (itemToDelete) {
      setData(data.filter((item) => item.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const filteredData = data.filter(item =>
    item.question.toLowerCase().includes(search.toLowerCase()) ||
    item.field.toLowerCase().includes(search.toLowerCase())
  );

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
            <span>Tambah Data</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer">
            <option>Semua Instrumen</option>
            <option>RIASEC (Minat)</option>
          </select>
        </div>

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
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-20 text-center">No</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Pertanyaan</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-48">Bidang Pertanyaan</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      {/* Tampilkan ID sebagai Nomor */}
                      <td className="py-4 px-6 text-sm text-center text-gray-900 font-bold font-mono">
                        {item.id}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium leading-relaxed">{item.question}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          {item.field}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center relative action-dropdown">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(item.id);
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
                              <button onClick={() => handleEditClick(item)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                <Edit size={16} /> Edit
                              </button>
                              <div className="border-t border-gray-50" />
                              <button onClick={() => handleDeleteClick(item)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
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
                    <td colSpan="4" className="py-12 text-center text-gray-500">
                      Data tidak ditemukan
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM (ADD / EDIT) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {isEditMode ? <Edit size={20} className="text-orange-600" /> : <Plus size={20} className="text-blue-600" />}
                  {isEditMode ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                
                {/* 1. Nomor Pertanyaan (EDITABLE) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Hash size={14} /> Nomor Pertanyaan
                  </label>
                  <input 
                    type="number" 
                    value={formData.id} 
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan nomor urut..."
                  />
                  <p className="text-[10px] text-gray-400">
                    *Nomor terisi otomatis, namun Anda dapat mengubahnya. Pastikan tidak ganda.
                  </p>
                </div>

                {/* 2. Bidang Pertanyaan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <List size={14} /> Bidang Pertanyaan
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.field}
                      onChange={(e) => setFormData({...formData, field: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      {fieldOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Filter size={16} />
                    </div>
                  </div>
                </div>

                {/* 3. Input Pertanyaan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Type size={14} /> Teks Pertanyaan
                  </label>
                  <textarea 
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    placeholder="Tuliskan butir pertanyaan di sini..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors">
                  Batal
                </button>
                <button onClick={handleSaveData} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2">
                  <Save size={18} /> Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL KONFIRMASI DELETE --- */}
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Pertanyaan?</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Apakah Anda yakin ingin menghapus pertanyaan nomor <span className="font-bold text-gray-800">#{itemToDelete?.id}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}