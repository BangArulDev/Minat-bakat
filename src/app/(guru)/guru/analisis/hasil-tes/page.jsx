"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  Printer, 
  X, 
  CheckCircle, 
  Target, 
  BookOpen, 
  Briefcase, 
  Award,
  Users,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getResults, getClassrooms } from "@/app/actions/guru";
import { getScorePercentages, getCareerRecommendations, getConsistencyLevel } from "@/utils/riasecScoring";
import { riasecDescriptions, RIASEC_ORDER } from "@/data/riasecDescriptions";
import { useSearchParams, useRouter } from "next/navigation";

function HasilTesSiswaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nisFromUrl = searchParams.get("nis");

  const [data, setData] = useState([]);
  const [classList, setClassList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("Semua");
  const [selectedDominant, setSelectedDominant] = useState("Semua");
  const [selectedConsistency, setSelectedConsistency] = useState("Semua");

  // Modal / Selected Student for Detail
  const [activeStudent, setActiveStudent] = useState(null);

  // Load Data
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [resultsRes, classesRes] = await Promise.all([
          getResults(),
          getClassrooms()
        ]);

        if (resultsRes?.success) {
          setData(resultsRes.data);
        }

        if (classesRes?.success) {
          setClassList(classesRes.data.map(c => c.name));
        }
      } catch (err) {
        console.error("Gagal memuat hasil tes:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Auto-open student detail if 'nis' is present in URL
  useEffect(() => {
    if (!isLoading && nisFromUrl && data.length > 0) {
      const found = data.find(item => item.nis === nisFromUrl);
      if (found) {
        setActiveStudent(found);
      }
    }
  }, [isLoading, nisFromUrl, data]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = data.length;
    if (total === 0) {
      return { total: 0, topDominant: "-", highConsistency: 0, classCount: 0 };
    }

    // Hitung tipe dominan terbanyak (huruf pertama)
    const dominantCount = {};
    let highCount = 0;
    const classes = new Set();

    data.forEach(item => {
      const code = item.dominantCode || item.result || "";
      const first = code[0] || "-";
      if (first !== "-") {
        dominantCount[first] = (dominantCount[first] || 0) + 1;
      }

      const cons = (item.consistency || "").toLowerCase();
      if (cons.includes("tinggi") || cons.includes("high")) {
        highCount += 1;
      }

      if (item.className) classes.add(item.className);
    });

    let topDomLetter = "-";
    let maxCount = 0;
    Object.entries(dominantCount).forEach(([letter, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topDomLetter = letter;
      }
    });

    const topDomName = riasecDescriptions[topDomLetter] ? `${riasecDescriptions[topDomLetter].name} (${topDomLetter})` : "-";
    const highPercent = Math.round((highCount / total) * 100);

    return {
      total,
      topDominant: topDomName,
      highConsistency: `${highPercent}%`,
      classCount: classes.size
    };
  }, [data]);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search by name or NIS
      const query = search.toLowerCase();
      const matchSearch = 
        item.name.toLowerCase().includes(query) || 
        (item.nis && item.nis.toLowerCase().includes(query));

      // Filter by Class
      const matchClass = selectedClass === "Semua" || item.className === selectedClass;

      // Filter by Dominant Letter (first letter or contains)
      const code = item.dominantCode || item.result || "";
      const matchDominant = selectedDominant === "Semua" || code.startsWith(selectedDominant);

      // Filter by Consistency
      const cons = (item.consistency || "").toLowerCase();
      const matchConsistency = 
        selectedConsistency === "Semua" || 
        (selectedConsistency === "Tinggi" && (cons.includes("tinggi") || cons.includes("high"))) ||
        (selectedConsistency === "Sedang" && (cons.includes("sedang") || cons.includes("medium"))) ||
        (selectedConsistency === "Rendah" && (cons.includes("rendah") || cons.includes("low")));

      return matchSearch && matchClass && matchDominant && matchConsistency;
    });
  }, [data, search, selectedClass, selectedDominant, selectedConsistency]);

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Nama Siswa",
      "NIS",
      "Kelas",
      "Jenis Tes",
      "Tanggal Tes",
      "Kode Dominan",
      "Konsistensi",
      "Skor R",
      "Skor I",
      "Skor A",
      "Skor S",
      "Skor E",
      "Skor C"
    ];

    const rows = filteredData.map((item, idx) => {
      const raw = item.rawScores || {};
      return [
        idx + 1,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.nis || "-"}"`,
        `"${item.className || "-"}"`,
        `"${item.testType || "RIASEC"}"`,
        `"${item.date || "-"}"`,
        `"${item.dominantCode || item.result || "-"}"`,
        `"${item.consistency || "-"}"`,
        raw.R || 0,
        raw.I || 0,
        raw.A || 0,
        raw.S || 0,
        raw.E || 0,
        raw.C || 0
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Hasil_Tes_Siswa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setSelectedClass("Semua");
    setSelectedDominant("Semua");
    setSelectedConsistency("Semua");
  };

  // Build detail data for the active student in modal
  const activeStudentDetail = useMemo(() => {
    if (!activeStudent) return null;

    const raw = activeStudent.rawScores || {};
    const percentages = getScorePercentages(raw);
    const dominantCode = activeStudent.dominantCode || activeStudent.result || "RIA";
    const recs = getCareerRecommendations(dominantCode) || {
      interpretation: "Belum ada rekomendasi khusus untuk kombinasi kode ini.",
      recommendations: []
    };

    const firstLetter = dominantCode[0] || "R";
    const secondLetter = dominantCode[1] || "";
    const thirdLetter = dominantCode[2] || "";

    const scoresList = RIASEC_ORDER.map(type => ({
      code: type,
      name: riasecDescriptions[type]?.name || type,
      label: riasecDescriptions[type]?.label || type,
      score: percentages[type] || 0,
      rawScore: raw[type] || 0,
      color: riasecDescriptions[type]?.color || "#3b82f6",
      desc: riasecDescriptions[type]?.shortDesc || ""
    })).sort((a, b) => b.score - a.score);

    // Split majors vs careers from recommendations
    let majors = recs.recommendations.filter(r => 
      r.includes("Jurusan") || r.includes("Pendidikan") || r.includes("Ilmu") || 
      r.includes("Teknik") || r.includes("Sastra") || r.includes("Seni") || 
      r.includes("Desain") || r.includes("Manajemen") || r.includes("Akuntansi")
    );
    let careers = recs.recommendations.filter(r => !majors.includes(r));

    if (majors.length === 0 && recs.recommendations.length > 0) {
      majors = recs.recommendations.slice(0, 3);
      careers = recs.recommendations.slice(3);
    }

    const consInfo = getConsistencyLevel(dominantCode);

    return {
      student: activeStudent,
      dominantCode,
      primaryType: riasecDescriptions[firstLetter] || null,
      secondaryType: riasecDescriptions[secondLetter] || null,
      thirdType: riasecDescriptions[thirdLetter] || null,
      interpretation: recs.interpretation,
      scoresList,
      majors,
      careers,
      consistency: consInfo
    };
  }, [activeStudent]);

  // Navigate between students in modal
  const handleNextStudent = () => {
    if (!activeStudent) return;
    const currentIndex = filteredData.findIndex(s => s.id === activeStudent.id);
    if (currentIndex !== -1 && currentIndex < filteredData.length - 1) {
      setActiveStudent(filteredData[currentIndex + 1]);
    }
  };

  const handlePrevStudent = () => {
    if (!activeStudent) return;
    const currentIndex = filteredData.findIndex(s => s.id === activeStudent.id);
    if (currentIndex > 0) {
      setActiveStudent(filteredData[currentIndex - 1]);
    }
  };

  // Helper for dominant badge styling
  const getDominantBadge = (code) => {
    if (!code || code === "-") return <span className="text-gray-400 font-mono">-</span>;
    const firstLetter = code[0];
    const desc = riasecDescriptions[firstLetter];
    const bgStyle = desc ? { backgroundColor: `${desc.color}15`, color: desc.color, borderColor: `${desc.color}40` } : {};

    return (
      <span 
        style={bgStyle}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wider font-mono shadow-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: desc?.color || '#3b82f6' }} />
        {code}
      </span>
    );
  };

  // Helper for consistency badge
  const getConsistencyBadge = (cons) => {
    const val = (cons || "").toLowerCase();
    if (val.includes("tinggi") || val.includes("high")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle size={11} className="text-green-600" />
          Tinggi
        </span>
      );
    }
    if (val.includes("sedang") || val.includes("medium")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Sedang
        </span>
      );
    }
    if (val.includes("rendah") || val.includes("low")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Rendah
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        {cons || "-"}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Award className="text-blue-600" size={28} />
            Hasil Tes Siswa
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Kelola, telusuri, dan cetak laporan hasil asesmen minat bakat Holland RIASEC seluruh siswa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-green-200 hover:shadow-md cursor-pointer text-sm"
          >
            <Download size={18} />
            <span>Export Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa Tes */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Siswa Telah Tes</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.total}</p>
          </div>
        </div>

        {/* Tipe Dominan Terbanyak */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dominan Terbanyak</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5 truncate max-w-[170px]" title={stats.topDominant}>
              {stats.topDominant}
            </p>
          </div>
        </div>

        {/* Konsistensi Tinggi */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Konsistensi Tinggi</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.highConsistency}</p>
          </div>
        </div>

        {/* Kelas Berpartisipasi */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas Terdata</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.classCount}</p>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama siswa atau NIS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm bg-gray-50/50"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Kelas */}
          <div className="w-full sm:w-48 relative">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm cursor-pointer"
            >
              <option value="Semua">Semua Kelas</option>
              {classList.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Filter Tipe Holland Dominan */}
          <div className="w-full sm:w-48 relative">
            <select 
              value={selectedDominant}
              onChange={(e) => setSelectedDominant(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm cursor-pointer"
            >
              <option value="Semua">Semua Dominan</option>
              <option value="R">R - Realistic</option>
              <option value="I">I - Investigative</option>
              <option value="A">A - Artistic</option>
              <option value="S">S - Social</option>
              <option value="E">E - Enterprising</option>
              <option value="C">C - Conventional</option>
            </select>
          </div>

          {/* Filter Konsistensi */}
          <div className="w-full sm:w-44 relative">
            <select 
              value={selectedConsistency}
              onChange={(e) => setSelectedConsistency(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm cursor-pointer"
            >
              <option value="Semua">Semua Konsistensi</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>

          {/* Reset button */}
          {(search || selectedClass !== "Semua" || selectedDominant !== "Semua" || selectedConsistency !== "Semua") && (
            <button
              onClick={resetFilters}
              title="Reset Filter"
              className="px-3 py-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

        </div>

        {/* Filter Indicator / Summary */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>
            Menampilkan <strong className="text-gray-900 font-semibold">{filteredData.length}</strong> dari {data.length} total hasil siswa
          </span>
          {(selectedClass !== "Semua" || selectedDominant !== "Semua" || selectedConsistency !== "Semua") && (
            <span className="text-blue-600 font-medium">Filter sedang aktif</span>
          )}
        </div>
      </div>

      {/* 4. MAIN DATA TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="py-4 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider w-14 text-center">No</th>
                <th className="py-4 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Nama Siswa & NIS</th>
                <th className="py-4 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Kelas</th>
                <th className="py-4 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Tanggal Tes</th>
                <th className="py-4 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Kode Dominan</th>
                <th className="py-4 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Skor RIASEC</th>
                <th className="py-4 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Konsistensi</th>
                <th className="py-4 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider text-center w-36">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Memuat data hasil tes...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => {
                    const raw = item.rawScores || {};
                    return (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        {/* No */}
                        <td className="py-4 px-5 text-sm text-center text-gray-400 font-medium">
                          {index + 1}
                        </td>
                        
                        {/* Nama Siswa & NIS */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {item.name ? item.name.substring(0, 2).toUpperCase() : "??"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                NIS: {item.nis || "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Kelas */}
                        <td className="py-4 px-5 text-sm text-gray-600">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {item.className}
                          </span>
                        </td>

                        {/* Tanggal Tes */}
                        <td className="py-4 px-5 text-sm text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            {item.date}
                          </div>
                        </td>

                        {/* Kode Dominan */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          {getDominantBadge(item.dominantCode || item.result)}
                        </td>

                        {/* Skor RIASEC Mini Breakdown */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-mono font-medium" title="Realistic">
                              R:{raw.R ?? 0}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-mono font-medium" title="Investigative">
                              I:{raw.I ?? 0}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-mono font-medium" title="Artistic">
                              A:{raw.A ?? 0}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-medium" title="Social">
                              S:{raw.S ?? 0}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 font-mono font-medium" title="Enterprising">
                              E:{raw.E ?? 0}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-medium" title="Conventional">
                              C:{raw.C ?? 0}
                            </span>
                          </div>
                        </td>

                        {/* Konsistensi */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          {getConsistencyBadge(item.consistency)}
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => setActiveStudent(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-xs"
                              title="Lihat Detail Profil & Laporan"
                            >
                              <Eye size={14} />
                              <span>Detail</span>
                            </button>
                            <button 
                              onClick={() => {
                                setActiveStudent(item);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Cetak Laporan Siswa"
                            >
                              <Printer size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <FileText size={28} />
                        </div>
                        <p className="font-semibold text-gray-800 text-base">Tidak ada data hasil tes</p>
                        <p className="text-xs text-gray-400 max-w-sm">
                          {search || selectedClass !== "Semua" || selectedDominant !== "Semua" 
                            ? "Coba sesuaikan kata kunci atau filter yang Anda gunakan."
                            : "Siswa belum ada yang menyelesaikan tes asesmen RIASEC."}
                        </p>
                        {(search || selectedClass !== "Semua" || selectedDominant !== "Semua") && (
                          <button 
                            onClick={resetFilters}
                            className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Reset Semua Filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL / SLIDE-OVER DETAIL HASIL SISWA */}
      <AnimatePresence>
        {activeStudent && activeStudentDetail && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStudent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            />

            {/* Modal Dialog */}
            <div className="min-h-full flex items-center justify-center p-3 sm:p-6 text-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 text-left overflow-hidden relative my-8"
              >
                
                {/* Modal Top Action Bar */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Laporan Hasil Asesmen Holland RIASEC
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Prev/Next student */}
                    <button 
                      onClick={handlePrevStudent}
                      className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                      title="Siswa Sebelumnya"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={handleNextStudent}
                      className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                      title="Siswa Selanjutnya"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-1" />
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer size={15} />
                      <span>Cetak</span>
                    </button>
                    <button 
                      onClick={() => setActiveStudent(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer ml-1"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Modal Printable Content Container */}
                <div id="printable-report" className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                  
                  {/* Hero Student Banner */}
                  <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border-2 border-white/30 text-2xl font-black shadow-inner shrink-0">
                      {activeStudent.name ? activeStudent.name.substring(0, 2).toUpperCase() : "??"}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-black tracking-tight mb-1">{activeStudent.name}</h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-white/90">
                        <span className="px-2.5 py-1 bg-white/15 rounded-full border border-white/20 font-mono">
                          NIS: {activeStudent.nis || "-"}
                        </span>
                        <span className="px-2.5 py-1 bg-white/15 rounded-full border border-white/20">
                          Kelas: {activeStudent.className || "-"}
                        </span>
                        <span className="px-2.5 py-1 bg-white/15 rounded-full border border-white/20">
                          Tanggal: {activeStudent.date || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Dominant Highlight Badge */}
                    <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center shrink-0">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-white/70 mb-0.5">Tipe Dominan</p>
                      <p className="text-2xl font-black text-amber-300 tracking-wider font-mono">
                        {activeStudentDetail.dominantCode}
                      </p>
                      <p className="text-xs font-medium text-white/90 mt-0.5">
                        {activeStudentDetail.primaryType?.label || activeStudentDetail.primaryType?.name || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Konsistensi Banner */}
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Target size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tingkat Konsistensi Minat</p>
                        <p className="text-sm font-semibold text-gray-900">
                          Konsistensi {activeStudentDetail.consistency.level}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 max-w-md sm:text-right">
                      {activeStudentDetail.consistency.description}
                    </p>
                  </div>

                  {/* Dua Kolom: Grafik Skor & Interpretasi */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Kolom Kiri: Bar Skor RIASEC */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          <BarChart2 size={18} className="text-blue-600" />
                          Grafik Skor 6 Dimensi Holland
                        </h3>
                        <span className="text-xs text-gray-400">Persentase</span>
                      </div>

                      <div className="space-y-4">
                        {activeStudentDetail.scoresList.map((item) => (
                          <div key={item.code} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                                  style={{ backgroundColor: item.color }}
                                >
                                  {item.code}
                                </span>
                                <span className="font-bold text-gray-800">{item.name}</span>
                                <span className="text-gray-400 text-[11px]">({item.desc})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-[11px]">Skor: {item.rawScore}</span>
                                <span className="font-bold text-gray-900 font-mono text-xs">{item.score}%</span>
                              </div>
                            </div>
                            
                            {/* Bar Visual */}
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Kolom Kanan: Interpretasi Karakteristik */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                      <div className="border-b border-gray-100 pb-3">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          <Sparkles size={18} className="text-purple-600" />
                          Interpretasi Profil Karakteristik
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-xl">
                          <p className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                            Ringkasan Potensi Dominan:
                          </p>
                          <p className="text-xs text-purple-950/80 leading-relaxed">
                            {activeStudentDetail.interpretation}
                          </p>
                        </div>

                        {activeStudentDetail.primaryType && (
                          <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                            <p className="text-xs font-bold text-gray-900">
                              Karakteristik Tipe Utama ({activeStudentDetail.primaryType.name}):
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {activeStudentDetail.primaryType.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Rekomendasi Jurusan & Karir */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Rekomendasi Jurusan Kuliah */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <BookOpen size={17} className="text-indigo-600" />
                        Rekomendasi Jurusan / Program Studi
                      </h4>
                      {activeStudentDetail.majors.length > 0 ? (
                        <div className="space-y-2">
                          {activeStudentDetail.majors.map((major, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-xs">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-gray-800">{major}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Rekomendasi jurusan belum tersedia.</p>
                      )}
                    </div>

                    {/* Prospek Karir & Profesi */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Briefcase size={17} className="text-orange-600" />
                        Prospek Profesi & Karier Masa Depan
                      </h4>
                      {activeStudentDetail.careers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {activeStudentDetail.careers.map((career, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1.5 bg-orange-50 text-orange-800 border border-orange-200/80 rounded-lg text-xs font-medium"
                            >
                              {career}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Prospek karier belum tersedia.</p>
                      )}
                    </div>

                  </div>

                  {/* Area Khusus Cetak Tanda Tangan (Tersembunyi di layar normal, tampil saat print) */}
                  <div className="hidden print:block pt-12 mt-12 border-t border-gray-300">
                    <div className="flex justify-between text-xs text-gray-700">
                      <div>
                        <p>Mengetahui,</p>
                        <p className="font-semibold mt-1">Kepala Sekolah</p>
                        <div className="h-16" />
                        <p className="font-bold underline">_________________________</p>
                        <p>NIP: .......................................</p>
                      </div>
                      <div className="text-right">
                        <p>Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                        <p className="font-semibold mt-1">Guru Bimbingan Konseling (BK)</p>
                        <div className="h-16" />
                        <p className="font-bold underline">_________________________</p>
                        <p>NIP: .......................................</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Tekan tombol <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Cetak</kbd> untuk mencetak atau simpan sebagai PDF.
                  </p>
                  <button 
                    onClick={() => setActiveStudent(null)}
                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function HasilTesSiswaPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HasilTesSiswaContent />
    </Suspense>
  );
}
