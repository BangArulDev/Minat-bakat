"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  User, 
  Printer, 
  Briefcase, 
  BookOpen, 
  Target,
  ChevronDown,
  X
} from "lucide-react";

// --- MOCK DATA ---
// 1. Daftar Siswa (Untuk Pencarian)
const studentsList = [
  { id: 1, name: "Ahmad Rizki", nis: "20241001", class: "X MIPA 1" },
  { id: 2, name: "Bunga Citra", nis: "20241002", class: "X MIPA 1" },
  { id: 3, name: "Candra Wijaya", nis: "20241003", class: "XI IPS 2" },
  { id: 4, name: "Dinda Kirana", nis: "20241004", class: "X MIPA 2" },
];

// 2. Detail Data Hasil Tes (Simulasi data yang diambil dari backend saat siswa dipilih)
const studentResult = {
  summary: {
    dominant: "Artistic",
    secondary: "Investigative",
    description: "Siswa memiliki kecenderungan kreativitas yang tinggi, menyukai kebebasan berekspresi, dan memiliki rasa ingin tahu intelektual yang kuat. Kurang menyukai rutinitas yang kaku."
  },
  scores: [
    { type: "Realistic", score: 30, color: "bg-red-500", desc: "Praktikal & Fisik" },
    { type: "Investigative", score: 75, color: "bg-blue-500", desc: "Analitis & Ilmiah" },
    { type: "Artistic", score: 88, color: "bg-orange-500", desc: "Kreatif & Intuitif" },
    { type: "Social", score: 60, color: "bg-pink-500", desc: "Ramah & Empati" },
    { type: "Enterprising", score: 45, color: "bg-purple-500", desc: "Ambisius & Persuasif" },
    { type: "Conventional", score: 20, color: "bg-green-500", desc: "Teratur & Data" },
  ],
  recommendations: {
    majors: ["Desain Komunikasi Visual", "Seni Rupa Murni", "Arsitektur", "Sastra & Bahasa"],
    careers: ["Graphic Designer", "Illustrator", "Art Director", "Content Creator"]
  }
};

export default function AnalisisIndividuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter pencarian siswa
  const filteredStudents = studentsList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nis.includes(searchQuery)
  );

  const handleSelectStudent = (student) => {
    setSearchQuery(student.name);
    setSelectedStudent(student);
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedStudent(null);
    setIsDropdownOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* HEADER & SEARCH SECTION */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analisis Profil Individu</h1>
            <p className="text-gray-500 text-sm">Lihat detail potensi minat dan bakat per siswa secara mendalam.</p>
          </div>
          
          {selectedStudent && (
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Printer size={18} />
              Cetak Laporan
            </button>
          )}
        </div>

        {/* Search Input (Autocomplete) */}
        <div className="relative z-20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama siswa atau NIS..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
                if(e.target.value === "") setSelectedStudent(null);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full pl-12 pr-10 py-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-lg"
            />
            {searchQuery && (
              <button 
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          <AnimatePresence>
            {isDropdownOpen && searchQuery && !selectedStudent && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto"
              >
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="w-full text-left px-6 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.nis}</p>
                      </div>
                      <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {student.class}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-6 py-4 text-gray-500 text-center text-sm">
                    Siswa tidak ditemukan.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RESULT CONTENT (Hanya muncul jika siswa dipilih) */}
      <AnimatePresence mode="wait">
        {selectedStudent ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            {/* 1. Identity Card */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border-4 border-white/30 shadow-inner">
                <User size={48} />
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold mb-1">{selectedStudent.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 opacity-90 text-sm">
                  <span className="px-3 py-1 bg-white/20 rounded-full border border-white/20">NIS: {selectedStudent.nis}</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full border border-white/20">Kelas: {selectedStudent.class}</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full border border-white/20">Usia: 16 Tahun</span>
                </div>
              </div>
              <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Dominasi Minat</p>
                <p className="text-2xl font-bold text-yellow-300">{studentResult.summary.dominant}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 2. Chart / Score Visualization (Kolom Kiri) */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="text-blue-600" />
                  Grafik Profil RIASEC
                </h3>
                
                <div className="space-y-5">
                  {studentResult.scores.map((item) => (
                    <div key={item.type}>
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-gray-700 text-sm">{item.type}</span>
                        <span className="text-gray-500 text-xs font-medium">{item.desc}</span>
                        <span className="font-bold text-gray-900 text-sm">{item.score}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${item.color}`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2 text-sm uppercase">Interpretasi Singkat</h4>
                  <p className="text-blue-900/80 leading-relaxed text-sm">
                    {studentResult.summary.description}
                  </p>
                </div>
              </div>

              {/* 3. Recommendations (Kolom Kanan) */}
              <div className="space-y-6">
                
                {/* Rekomendasi Jurusan */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-fit">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="text-purple-600" />
                    Rekomendasi Jurusan
                  </h3>
                  <ul className="space-y-3">
                    {studentResult.recommendations.majors.map((major, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="font-medium text-gray-700">{major}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rekomendasi Karir */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-fit">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="text-orange-600" />
                    Prospek Karir
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {studentResult.recommendations.careers.map((career) => (
                      <span key={career} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100">
                        {career}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        ) : (
          /* State Awal (Belum ada siswa dipilih) */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <User size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pilih Siswa Terlebih Dahulu</h3>
            <p className="text-gray-500 max-w-md text-center">
              Gunakan kolom pencarian di atas untuk menemukan siswa dan melihat hasil analisis minat bakat mereka secara detail.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}