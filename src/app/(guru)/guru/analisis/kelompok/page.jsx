"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  BarChart2, 
  Filter, 
  Download, 
  ChevronRight, 
  PieChart,
  Target
} from "lucide-react";

// --- MOCK DATA ---
const classesList = ["X MIPA 1", "X MIPA 2", "XI IPS 1", "XII BAHASA"];

// Data Dummy: Distribusi Minat per Kelas
const mockClassData = {
  "X MIPA 1": {
    totalStudents: 32,
    dominantType: "Investigative",
    description: "Kelas ini didominasi oleh siswa dengan tipe pemikir dan analitis. Cocok dengan metode pembelajaran berbasis riset atau problem solving.",
    distribution: [
      { 
        type: "Realistic", 
        count: 4, 
        percentage: 12.5, 
        color: "bg-red-500", 
        textColor: "text-red-600",
        bgLight: "bg-red-50",
        students: ["Budi Santoso", "Rahmat Hidayat", "Doni Kurniawan", "Eko Prasetyo"]
      },
      { 
        type: "Investigative", 
        count: 12, 
        percentage: 37.5, 
        color: "bg-blue-500", 
        textColor: "text-blue-600",
        bgLight: "bg-blue-50",
        students: ["Siti Aminah", "Dewi Sartika", "Ahmad Rizki", "Fajar Nugraha", "Gilang Ramadhan", "Hana Pertiwi", "Indra Lesmana", "Joko Susilo", "Kiki Amalia", "Lina Marlina", "Miko Wijaya", "Nina Zatulini"]
      },
      { 
        type: "Artistic", 
        count: 8, 
        percentage: 25, 
        color: "bg-orange-500", 
        textColor: "text-orange-600",
        bgLight: "bg-orange-50",
        students: ["Bunga Citra", "Cantika", "Diana Pungky", "Elsa Syarief", "Farah Quinn", "Gita Gutawa", "Hesti Purwadinata", "Isyana Sarasvati"]
      },
      { 
        type: "Social", 
        count: 5, 
        percentage: 15.6, 
        color: "bg-pink-500", 
        textColor: "text-pink-600",
        bgLight: "bg-pink-50",
        students: ["Rina Nose", "Sule", "Andre Taulany", "Wendy Cagur", "Denny Cagur"]
      },
      { 
        type: "Enterprising", 
        count: 2, 
        percentage: 6.2, 
        color: "bg-purple-500", 
        textColor: "text-purple-600",
        bgLight: "bg-purple-50",
        students: ["Raffi Ahmad", "Ruben Onsu"]
      },
      { 
        type: "Conventional", 
        count: 1, 
        percentage: 3.2, 
        color: "bg-green-500", 
        textColor: "text-green-600",
        bgLight: "bg-green-50",
        students: ["Sri Mulyani"]
      },
    ]
  }
};

export default function AnalisisKelompokPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [activeCategory, setActiveCategory] = useState(null); // Kategori yang sedang diklik

  // Ambil data berdasarkan kelas yang dipilih
  const currentData = mockClassData[selectedClass];

  const handleSelectClass = (e) => {
    setSelectedClass(e.target.value);
    setActiveCategory(null); // Reset pilihan kategori saat ganti kelas
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Minat Kelas</h1>
          <p className="text-gray-500 text-sm">Analisis kecenderungan minat bakat secara klasikal (satu kelas).</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dropdown Pilih Kelas */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select 
              value={selectedClass}
              onChange={handleSelectClass}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium cursor-pointer shadow-sm appearance-none min-w-[180px]"
            >
              <option value="" disabled>Pilih Kelas...</option>
              {classesList.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {currentData && (
            <button 
              onClick={() => alert("Mengunduh laporan kelas...")}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-200"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence mode="wait">
        {currentData ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            
            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Total Siswa */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Siswa</p>
                  <p className="text-2xl font-bold text-gray-900">{currentData.totalStudents} Siswa</p>
                </div>
              </div>

              {/* Card Dominasi */}
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl border border-blue-600 shadow-lg text-white col-span-1 md:col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1 flex items-center gap-2">
                    <Target size={16} /> Dominasi Kepribadian
                  </p>
                  <p className="text-3xl font-bold">{currentData.dominantType}</p>
                  <p className="text-sm text-blue-100 mt-2 opacity-90 max-w-lg">
                    {currentData.description}
                  </p>
                </div>
                <div className="hidden md:block">
                  <PieChart size={64} className="opacity-30" />
                </div>
              </div>
            </div>

            {/* 2. Main Chart & List Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* KOLOM KIRI: Grafik Distribusi */}
              <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart2 className="text-blue-600" />
                  Distribusi Minat Siswa
                </h3>
                
                <div className="space-y-6">
                  {currentData.distribution.map((item) => {
                    const isActive = activeCategory?.type === item.type;
                    return (
                      <div 
                        key={item.type} 
                        onClick={() => setActiveCategory(item)}
                        className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300
                          ${isActive 
                            ? "bg-gray-50 border-blue-300 shadow-sm scale-[1.01]" 
                            : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                          }
                        `}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className={`font-bold ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                              {item.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{item.count} Siswa</span>
                            <span className="text-xs text-gray-400">({item.percentage}%)</span>
                            <ChevronRight size={16} className={`text-gray-300 transition-transform ${isActive ? "rotate-90 text-blue-500" : ""}`} />
                          </div>
                        </div>
                        
                        {/* Progress Bar Container */}
                        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden relative">
                          {/* Animated Bar */}
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${item.color} relative`}
                          >
                             {/* Glossy effect top */}
                             <div className="absolute top-0 left-0 right-0 h-1/2 bg-white opacity-20" />
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* KOLOM KANAN: Daftar Siswa Detail */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-fit min-h-[400px]">
                {activeCategory ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={activeCategory.type}
                  >
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 ${activeCategory.bgLight} ${activeCategory.textColor}`}>
                       <span className={`w-2 h-2 rounded-full ${activeCategory.color}`} />
                       {activeCategory.type}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Daftar Siswa
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Terdapat {activeCategory.count} siswa yang dominan di tipe ini.
                    </p>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {activeCategory.students.map((student, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeCategory.bgLight} ${activeCategory.textColor}`}>
                            {student.charAt(0)}
                          </div>
                          <span className="text-gray-700 font-medium text-sm">{student}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  // State Kosong (Belum klik kategori)
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Users className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-gray-900 font-bold mb-2">Siapa saja mereka?</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Klik salah satu batang grafik di sebelah kiri untuk melihat daftar nama siswa pada kategori tersebut.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        ) : (
          /* STATE AWAL: Belum Pilih Kelas */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <PieChart size={40} className="text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pilih Kelas Terlebih Dahulu</h3>
            <p className="text-gray-500 max-w-md text-center">
              Silakan pilih kelas melalui menu dropdown di pojok kanan atas untuk menampilkan analisis kelompok.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}