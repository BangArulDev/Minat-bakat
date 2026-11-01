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
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getResults, getClassrooms, getSchoolProfile } from "@/app/actions/guru";
import { getScorePercentages, getCareerRecommendations, getConsistencyLevel } from "@/utils/riasecScoring";
import { riasecDescriptions, RIASEC_ORDER } from "@/data/riasecDescriptions";
import { useSearchParams, useRouter } from "next/navigation";
import RiasecStudentReport from "@/components/riasec/RiasecStudentReport";

function HasilTesSiswaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nisFromUrl = searchParams.get("nis");

  const [data, setData] = useState([]);
  const [classList, setClassList] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("Semua");
  const [selectedDominant, setSelectedDominant] = useState("Semua");
  const [selectedConsistency, setSelectedConsistency] = useState("Semua");

  // Modal / Selected Student for Detail
  const [activeStudent, setActiveStudent] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveStudent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load Data
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [resultsRes, classesRes, schoolRes] = await Promise.all([
          getResults(),
          getClassrooms(),
          getSchoolProfile(),
        ]);

        if (resultsRes?.success) {
          setData(resultsRes.data);
        }

        if (classesRes?.success) {
          setClassList(classesRes.data.map(c => c.name));
        }

        if (schoolRes?.success && schoolRes.data?.name) {
          setSchoolName(schoolRes.data.name);
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
        const timer = setTimeout(() => setActiveStudent(found), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, nisFromUrl, data]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = data.length;
    if (total === 0) {
      return { total: 0, topDominant: "-", highConsistency: 0, classCount: 0 };
    }

    const dominantCount = {};
    let highCount = 0;
    const classes = new Set();

    data.forEach(item => {
      const code = item.dominantCode || item.result || "";
      const first = (code[0] || "-").toUpperCase();
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
        (item.name || "").toLowerCase().includes(query) || 
        (item.nis && item.nis.toLowerCase().includes(query));

      // Filter by Class
      const matchClass = selectedClass === "Semua" || item.className === selectedClass;

      // Filter by Dominant Letter (first letter or contains)
      const code = (item.dominantCode || item.result || "").toUpperCase();
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
      "Jenis Kelamin",
      "Kelas",
      "Jenis Tes",
      "Tanggal Tes",
      "Kode Dominan",
      "Pasangan Dominan",
      "Konsistensi",
      "Skor R",
      "Skor I",
      "Skor A",
      "Skor S",
      "Skor E",
      "Skor C"
    ];

    const rows = filteredData.map((item, idx) => {
      let raw = item.rawScores;
      if (typeof raw === "string") {
        try { raw = JSON.parse(raw); } catch (e) { raw = {}; }
      }
      raw = raw || {};

      const genderLabel = item.gender === "L" ? "Laki-laki" : item.gender === "P" ? "Perempuan" : item.gender || "-";
      const dominantCode = item.dominantCode || item.result || "-";
      const dominantPair = item.dominantPair || (dominantCode !== "-" ? dominantCode.slice(0, 2) : "-");

      return [
        idx + 1,
        `"${(item.name || "").replace(/"/g, '""')}"`,
        `"${item.nis || "-"}"`,
        `"${genderLabel}"`,
        `"${item.className || "-"}"`,
        `"${item.testType || "RIASEC"}"`,
        `"${item.date || "-"}"`,
        `"${dominantCode}"`,
        `"${dominantPair}"`,
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
    const firstLetter = (code[0] || "R").toUpperCase();
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
            type="button"
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
                type="button"
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
              type="button"
              onClick={resetFilters}
              title="Reset Filter"
              className="px-3 py-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm">Memuat data hasil tes...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  let raw = item.rawScores;
                  if (typeof raw === "string") {
                    try { raw = JSON.parse(raw); } catch (e) { raw = {}; }
                  }
                  raw = raw || {};

                  return (
                    <tr 
                      key={item.id || index}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-4 px-5 text-sm text-center text-gray-400 font-medium">
                        {index + 1}
                      </td>
                      
                      {/* Nama Siswa & NIS */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setActiveStudent(item)}
                            className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            {item.name ? item.name.substring(0, 2).toUpperCase() : "??"}
                          </button>
                          <div>
                            <button
                              type="button"
                              onClick={() => setActiveStudent(item)}
                              className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-left cursor-pointer hover:underline"
                            >
                              {item.name}
                            </button>
                            <p className="text-xs text-gray-400 font-mono">
                              NIS: {item.nis || "-"} {item.gender ? `• ${item.gender === "L" ? "L" : item.gender === "P" ? "P" : item.gender}` : ""}
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
                        <div className="flex flex-col gap-0.5">
                          {getDominantBadge(item.dominantCode || item.result)}
                          <span className="text-[10px] text-gray-500 font-medium">
                            Pasangan: <span className="font-mono font-bold text-gray-700">{item.dominantPair || (item.dominantCode || item.result || "").slice(0, 2)}</span>
                          </span>
                        </div>
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
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStudent(item);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                            title="Lihat Detail Profil & Laporan"
                          >
                            <Eye size={14} />
                            <span>Detail</span>
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStudent(item);
                              setTimeout(() => window.print(), 350);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Cetak Laporan Siswa"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
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
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Reset Semua Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL DETAIL HASIL SISWA */}
      <AnimatePresence>
        {activeStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStudent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div 
              key="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 text-left overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
            >
              <div className="p-6 md:p-8 overflow-y-auto">
                <RiasecStudentReport
                  identity={{
                    name: activeStudent.name,
                    nis: activeStudent.nis,
                    gender: activeStudent.gender,
                    className: activeStudent.className,
                    schoolName: schoolName,
                  }}
                  rawScores={activeStudent.rawScores}
                  date={activeStudent.createdAt || activeStudent.date}
                  dominantCode={activeStudent.dominantCode}
                  consistency={activeStudent.consistency}
                  onClose={() => setActiveStudent(null)}
                  onPrev={handlePrevStudent}
                  onNext={handleNextStudent}
                  title="Detail Hasil Asesmen Siswa"
                  subtitle={`Laporan individual peserta didik: ${activeStudent.name}`}
                />
              </div>
            </motion.div>
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
