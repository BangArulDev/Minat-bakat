"use client";
import { useState, useEffect, useMemo } from "react";
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
import { getDetailedResults } from "@/app/actions/guru";
import { riasecDescriptions, RIASEC_ORDER } from "@/data/riasecDescriptions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AnalisisKelompokPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [activeCategory, setActiveCategory] = useState(null); // Kategori yang sedang diklik

  useEffect(() => {
    async function load() {
      const res = await getDetailedResults();
      if (res?.success) {
        setData(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  // Process data to group by classroom
  const { classesList, classData } = useMemo(() => {
    const list = new Set();
    const map = {};

    data.forEach(student => {
      const cls = student.className;
      list.add(cls);
      if (!map[cls]) {
        map[cls] = {
          totalStudents: 0,
          dominantType: "",
          description: "",
          typeCounts: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
          studentsByType: { R: [], I: [], A: [], S: [], E: [], C: [] }
        };
      }
      
      map[cls].totalStudents += 1;
      const dominant = student.dominantCode[0] || "R";
      if (map[cls].typeCounts[dominant] !== undefined) {
         map[cls].typeCounts[dominant] += 1;
         map[cls].studentsByType[dominant].push(student.name);
      }
    });

    // Finalize data for each class
    Object.keys(map).forEach(cls => {
      const c = map[cls];
      
      // Find the most dominant type for the whole class
      let maxCount = 0;
      let dominantKey = "R";
      RIASEC_ORDER.forEach(key => {
        if (c.typeCounts[key] > maxCount) {
          maxCount = c.typeCounts[key];
          dominantKey = key;
        }
      });
      
      c.dominantType = riasecDescriptions[dominantKey].name;
      c.description = `Kelas ini didominasi oleh siswa dengan tipe ${riasecDescriptions[dominantKey].name}. ${riasecDescriptions[dominantKey].shortDesc}.`;

      // Build distribution array
      c.distribution = RIASEC_ORDER.map(key => {
        const count = c.typeCounts[key];
        const percentage = c.totalStudents > 0 ? ((count / c.totalStudents) * 100).toFixed(1) : 0;
        return {
          type: riasecDescriptions[key].name,
          count,
          percentage: parseFloat(percentage),
          color: riasecDescriptions[key].color, // Use hex color directly
          textColor: "text-gray-800", // Tailwind can't do arbitrary text-colors easily dynamically without inline style
          bgLight: "bg-gray-100",
          students: c.studentsByType[key]
        };
      }).sort((a, b) => b.count - a.count);
    });

    return { classesList: Array.from(list).sort(), classData: map };
  }, [data]);

  const currentData = classData[selectedClass];

  const handleSelectClass = (e) => {
    setSelectedClass(e.target.value);
    setActiveCategory(null);
  };

  const handleDownloadPDF = () => {
    if (!currentData) return;
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Profil Minat Kelas: ${selectedClass}`, 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, 14, 28);
    doc.text(`Total Siswa: ${currentData.totalStudents}`, 14, 34);
    doc.text(`Tipe Dominan Kelas: ${currentData.dominantType}`, 14, 40);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Distribusi Minat Siswa", 14, 52);

    autoTable(doc, {
      startY: 56,
      head: [["Tipe RIASEC", "Jumlah Siswa", "Persentase", "Nama Siswa"]],
      body: currentData.distribution.map(d => [
        d.type,
        `${d.count} siswa`,
        `${d.percentage}%`,
        d.students.join(", ") || "-"
      ]),
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
    });

    doc.save(`Profil_Minat_${selectedClass.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
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
              <option value="" disabled>{isLoading ? "Memuat..." : "Pilih Kelas..."}</option>
              {classesList.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {currentData && (
            <button 
              onClick={handleDownloadPDF}
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
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
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
                            className="h-full rounded-full relative"
                            style={{ backgroundColor: item.color }}
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
                    <div 
                       className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                       style={{ backgroundColor: `${activeCategory.color}20`, color: activeCategory.color }}
                    >
                       <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCategory.color }} />
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
                          <div 
                             className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                             style={{ backgroundColor: `${activeCategory.color}20`, color: activeCategory.color }}
                          >
                            {student.charAt(0)}
                          </div>
                          <span className="text-gray-700 font-medium text-sm">{student}</span>
                        </div>
                      ))}
                      {activeCategory.students.length === 0 && (
                        <p className="text-sm text-gray-400">Belum ada siswa di kategori ini.</p>
                      )}
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