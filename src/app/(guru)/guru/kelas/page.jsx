"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  Calendar,
  X,
  Save,
  AlertTriangle,
  Eye,
  Hash,
  BookOpen,
  Users,
  Download
} from "lucide-react";

// MOCK DATA: Contoh Data Kelas
const initialClasses = [
  { id: 1, code: "CLS-X-IPA1", name: "X MIPA 1", status: "active", createdAt: "20 Jan 2024", studentCount: 32 },
  { id: 2, code: "CLS-X-IPA2", name: "X MIPA 2", status: "active", createdAt: "21 Jan 2024", studentCount: 30 },
  { id: 3, code: "CLS-XI-IPS1", name: "XI IPS 1", status: "inactive", createdAt: "15 Jan 2023", studentCount: 28 },
  { id: 4, code: "CLS-XII-BHS", name: "XII Bahasa", status: "active", createdAt: "10 Feb 2024", studentCount: 25 },
];

export default function KelasPage() {
  const [data, setData] = useState(initialClasses);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- STATE MODAL FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: "", code: "", name: "", status: "active", studentCount: 0 });

  // --- STATE MODAL DETAIL ---
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentList, setStudentList] = useState([]); 

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

  const handleAddClick = () => {
    setIsEditMode(false);
    setFormData({ id: Date.now(), code: "", name: "", status: "active", studentCount: 0 });
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setIsEditMode(true);
    setFormData(item);
    setOpenDropdownId(null);
    setIsModalOpen(true);
  };

  const handleSaveData = () => {
    if (!formData.code || !formData.name) {
      alert("Harap lengkapi Kode dan Nama Kelas!");
      return;
    }

    if (isEditMode) {
      setData(data.map(item => item.id === formData.id ? { ...formData } : item));
    } else {
      const newItem = {
        ...formData,
        createdAt: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      setData([newItem, ...data]);
    }
    setIsModalOpen(false);
  };

  const handleDetailClick = (item) => {
    if (!item) return; // Safety check
    setOpenDropdownId(null);
    setSelectedClass(item);
    
    // Generate data siswa dummy
    const mockStudents = Array.from({ length: item.studentCount }, (_, i) => ({
      nis: `2024${item.id}${String(i + 1).padStart(3, '0')}`,
      name: `Siswa ${item.name} ${i + 1}`,
      gender: Math.random() > 0.5 ? 'L' : 'P'
    }));
    
    setStudentList(mockStudents);
    setIsDetailOpen(true);
  };

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

  // --- PERBAIKAN: FUNGSI PDF LEBIH AMAN ---
  const handleDownloadPDF = () => {
    // 1. Cek apakah selectedClass ada. Jika null, hentikan fungsi.
    if (!selectedClass) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Daftar Siswa", 14, 15);
    doc.setFontSize(12);
    // Menggunakan optional chaining (?.) untuk mencegah error jika code/name null
    doc.text(`Kelas: ${selectedClass?.name || '-'} (${selectedClass?.code || '-'})`, 14, 22);
    doc.text(`Total Siswa: ${studentList.length}`, 14, 28);

    const tableColumn = ["No", "NIS", "Nama Lengkap", "Jenis Kelamin"];
    const tableRows = studentList.map((siswa, index) => [
      index + 1,
      siswa.nis,
      siswa.name,
      siswa.gender === 'L' ? 'Laki-laki' : 'Perempuan'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`Data_Siswa_${selectedClass?.code || 'Export'}.pdf`);
  };

  // --- PERBAIKAN: FILTER LEBIH AMAN ---
  const filteredData = data.filter(item => {
    // Pastikan item tidak null
    if (!item) return false;
    
    const searchLower = search.toLowerCase();
    // Pastikan properti code dan name ada sebelum di-lowercase
    const codeMatch = item.code ? item.code.toLowerCase().includes(searchLower) : false;
    const nameMatch = item.name ? item.name.toLowerCase().includes(searchLower) : false;

    return codeMatch || nameMatch;
  });

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
          <button onClick={handleRefresh} disabled={isLoading} className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-50">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleAddClick} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
            <Plus size={20} />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
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

      {/* TABEL DATA KELAS */}
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
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm text-center text-gray-500 font-medium">{index + 1}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{item.code}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.studentCount} Siswa Terdaftar</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${item.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {item.status === 'active' ? <><CheckCircle size={12} /> Aktif</> : <><XCircle size={12} /> Non-Aktif</>}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" />{item.createdAt}</div>
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
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-8 top-8 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left">
                              <button onClick={() => handleDetailClick(item)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                                <Eye size={16} /> Detail
                              </button>
                              <div className="border-t border-gray-50" />
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
                  <tr><td colSpan="6" className="py-12 text-center text-gray-500">Data kelas tidak ditemukan</td></tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">Menampilkan <span className="font-bold text-gray-900">{filteredData.length}</span> kelas</p>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-500" disabled>Sebelumnya</button>
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50">Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* --- MODAL FORM (ADD/EDIT) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {isEditMode ? <Edit size={20} className="text-orange-600" /> : <Plus size={20} className="text-blue-600" />}
                  {isEditMode ? "Edit Kelas" : "Tambah Kelas Baru"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Hash size={14} /> Kode Kelas</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="Contoh: CLS-X-IPA1" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><BookOpen size={14} /> Nama Kelas</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Contoh: X MIPA 1" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-Aktif</option>
                  </select>
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

      {/* --- MODAL DETAIL SISWA --- */}
      <AnimatePresence>
        {isDetailOpen && selectedClass && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users size={20} className="text-purple-600" />
                    Daftar Siswa
                  </h3>
                  <p className="text-xs text-gray-500">Kelas: <span className="font-bold text-gray-800">{selectedClass.name}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleDownloadPDF} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors flex items-center gap-1.5 pr-3">
                    <Download size={18} />
                    <span className="text-xs font-bold">PDF</span>
                  </button>
                  <button onClick={() => setIsDetailOpen(false)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500"><X size={20} /></button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-0">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                    <tr>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 w-16 text-center">No</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500">NIS</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500">Nama Lengkap</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 text-center">L/P</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {studentList.length > 0 ? (
                      studentList.map((siswa, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-3 px-6 text-sm text-center text-gray-500">{idx + 1}</td>
                          <td className="py-3 px-6 text-sm font-mono text-gray-600">{siswa.nis}</td>
                          <td className="py-3 px-6 text-sm font-bold text-gray-800">{siswa.name}</td>
                          <td className="py-3 px-6 text-center">
                            <span className={`inline-block w-6 h-6 rounded-full text-xs font-bold leading-6 ${siswa.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>{siswa.gender}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="py-8 text-center text-gray-400">Belum ada siswa di kelas ini.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                 <p className="text-sm text-gray-600">Total Siswa:</p>
                 <span className="text-lg font-bold text-gray-900 bg-white border px-3 py-1 rounded-lg shadow-sm">{studentList.length}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DELETE --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-red-600" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Kelas?</h3>
              <p className="text-gray-500 mb-6 text-sm">Apakah Anda yakin ingin menghapus kelas <span className="font-bold text-gray-800">{itemToDelete?.name}</span>? Data siswa di dalamnya mungkin akan ikut terhapus.</p>
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