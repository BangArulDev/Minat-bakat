"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Printer,
  RefreshCw,
  Search,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Download,
  Eye,
  FileSpreadsheet,
  Building2,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  getStudents,
  getClassrooms,
  getSchoolProfile,
  getDetailedResults,
} from "@/app/actions/guru";

import {
  riasecDescriptions,
  RIASEC_ORDER,
} from "@/data/riasecDescriptions";

import {
  getTopThreeCode,
  getConsistencyLevel,
  getCareerRecommendations,
} from "@/utils/riasecScoring";

import RiasecStudentReport from "@/components/riasec/RiasecStudentReport";

export default function LaporanLengkapPage() {
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [results, setResults] = useState([]);
  const [school, setSchool] = useState(null);

  // Filter HANYA berdasarkan Kelas (pilihan siswa telah dihapus sesuai instruksi)
  const [selectedClass, setSelectedClass] = useState("");
  const [activeStudentModal, setActiveStudentModal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        studentsResponse,
        classesResponse,
        schoolResponse,
        resultsResponse,
      ] = await Promise.all([
        getStudents(),
        getClassrooms(),
        getSchoolProfile(),
        getDetailedResults(),
      ]);

      const failed = [
        studentsResponse,
        classesResponse,
        schoolResponse,
        resultsResponse,
      ].find((response) => !response?.success);

      if (failed) {
        throw new Error(
          failed.error || "Gagal mengambil data laporan."
        );
      }

      setStudents(studentsResponse.data || []);
      const classes = classesResponse.data || [];
      setClassrooms(classes);
      if (classes.length > 0 && !selectedClass) {
        setSelectedClass(classes[0].name);
      }
      setSchool(schoolResponse.data || {});
      setResults(resultsResponse.data || []);
    } catch (err) {
      console.error("Laporan Lengkap:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [
          studentsResponse,
          classesResponse,
          schoolResponse,
          resultsResponse,
        ] = await Promise.all([
          getStudents(),
          getClassrooms(),
          getSchoolProfile(),
          getDetailedResults(),
        ]);

        if (!active) return;

        if (studentsResponse?.success) {
          setStudents(studentsResponse.data || []);
        }
        if (classesResponse?.success) {
          const classes = classesResponse.data || [];
          setClassrooms(classes);
          if (classes.length > 0) {
            setSelectedClass(classes[0].name);
          }
        }
        if (schoolResponse?.success) {
          setSchool(schoolResponse.data || {});
        }
        if (resultsResponse?.success) {
          setResults(resultsResponse.data || []);
        }
      } catch (err) {
        if (active) setError(err.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Filter siswa yang terdaftar di kelas terpilih
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.className === selectedClass);
  }, [students, selectedClass]);

  // Gabungkan data siswa di kelas dengan hasil tes terbarunya
  const classReportRows = useMemo(() => {
    if (!selectedClass) return [];

    return classStudents.map((student) => {
      // Cari hasil tes terbaru siswa berdasarkan NIS
      const studentResults = results
        .filter((r) => String(r.nis) === String(student.nis))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const latest = studentResults[0] || null;

      let raw = {};
      if (latest?.rawScores) {
        raw =
          typeof latest.rawScores === "string"
            ? JSON.parse(latest.rawScores || "{}")
            : latest.rawScores;
      }

      const scores = {
        R: Number(raw.R || raw.r || 0),
        I: Number(raw.I || raw.i || 0),
        A: Number(raw.A || raw.a || 0),
        S: Number(raw.S || raw.s || 0),
        E: Number(raw.E || raw.e || 0),
        C: Number(raw.C || raw.c || 0),
      };

      const dominantCode = latest?.dominantCode && latest.dominantCode !== "-"
        ? latest.dominantCode
        : latest
        ? getTopThreeCode(scores)
        : "-";

      const dominantPair = dominantCode !== "-" ? dominantCode.slice(0, 2) : "-";

      let consistency = latest?.consistency || "-";
      if ((!consistency || consistency === "-") && dominantCode !== "-") {
        try {
          consistency = getConsistencyLevel(dominantCode).level;
        } catch {
          consistency = "Sedang";
        }
      }

      let careerText = "-";
      if (dominantCode !== "-") {
        const rec = getCareerRecommendations(dominantCode);
        const topCareers = rec?.recommendations?.slice(0, 3) || [];
        careerText = topCareers.length > 0 ? topCareers.join(", ") : "-";
      }

      return {
        id: student.id,
        nis: student.nis || "-",
        name: student.name || "-",
        gender: student.gender === "L" ? "L" : student.gender === "P" ? "P" : student.gender || "-",
        className: student.className || selectedClass,
        hasTest: !!latest,
        testDate: latest?.date || null,
        scores,
        dominantCode,
        dominantPair,
        consistency,
        careerText,
        rawScores: raw,
      };
    });
  }, [classStudents, results, selectedClass]);

  // Statistik & Distribusi Kelas
  const classStats = useMemo(() => {
    const total = classReportRows.length;
    const completed = classReportRows.filter((r) => r.hasTest).length;
    const pending = total - completed;

    // Distribusi 6 tipe RIASEC (berdasarkan huruf pertama kode dominan)
    const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const scoreSums = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

    classReportRows.forEach((r) => {
      if (r.hasTest && r.dominantCode !== "-") {
        const firstLetter = r.dominantCode[0];
        if (counts[firstLetter] !== undefined) {
          counts[firstLetter] += 1;
        }
        RIASEC_ORDER.forEach((t) => {
          scoreSums[t] += r.scores[t] || 0;
        });
      }
    });

    // Cari tipe paling dominan di kelas
    let dominantType = "R";
    let maxCount = -1;
    RIASEC_ORDER.forEach((t) => {
      if (counts[t] > maxCount) {
        maxCount = counts[t];
        dominantType = t;
      }
    });

    const averageScores = {};
    RIASEC_ORDER.forEach((t) => {
      averageScores[t] = completed > 0 ? (scoreSums[t] / completed).toFixed(1) : 0;
    });

    return {
      total,
      completed,
      pending,
      percentageCompleted: total > 0 ? Math.round((completed / total) * 100) : 0,
      dominantType,
      dominantName: riasecDescriptions[dominantType]?.name || dominantType,
      counts,
      averageScores,
    };
  }, [classReportRows]);

  const handlePrint = () => {
    window.print();
  };

  // Export Laporan Kelas ke CSV
  const handleExportCSV = () => {
    if (classReportRows.length === 0) {
      alert("Tidak ada data siswa untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "NIS",
      "Nama Siswa",
      "Jenis Kelamin",
      "Kelas",
      "Status Asesmen",
      "Skor R",
      "Skor I",
      "Skor A",
      "Skor S",
      "Skor E",
      "Skor C",
      "Kode Dominan",
      "Pasangan Dominan",
      "Tingkat Konsistensi",
      "Rekomendasi Karier",
    ];

    const rows = classReportRows.map((r, idx) => [
      idx + 1,
      `"${r.nis}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.gender}"`,
      `"${r.className}"`,
      `"${r.hasTest ? "Selesai" : "Belum Tes"}"`,
      r.scores.R,
      r.scores.I,
      r.scores.A,
      r.scores.S,
      r.scores.E,
      r.scores.C,
      `"${r.dominantCode}"`,
      `"${r.dominantPair}"`,
      `"${r.consistency}"`,
      `"${r.careerText.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [
        `LAPORAN KELAS HOLLAND RIASEC - ${selectedClass}`,
        `Sekolah: ${school?.name || "-"}`,
        `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")}`,
        "",
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_RIASEC_Kelas_${selectedClass.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download PDF Laporan Kelas (Format A4 Landscape yang sangat rapi)
  const handleDownloadPDF = async () => {
    if (classReportRows.length === 0) return;

    setDownloadingPDF(true);
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();
      const margin = 12;
      let y = 14;

      // Header Laporan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(17, 24, 39);
      doc.text("Laporan Hasil Asesmen Minat Karier Holland (RIASEC)", width / 2, y, {
        align: "center",
      });
      y += 6;

      doc.setFontSize(11);
      doc.setTextColor(30, 64, 175);
      doc.text(`Rekapitulasi Kelas: ${selectedClass}`, width / 2, y, {
        align: "center",
      });
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      const schoolText = school?.name ? `${school.name}  |  ` : "";
      doc.text(
        `${schoolText}Total Siswa: ${classStats.total}  |  Selesai Asesmen: ${classStats.completed} (${classStats.percentageCompleted}%)  |  Dominan Kelas: ${classStats.dominantName} (${classStats.dominantType})`,
        width / 2,
        y,
        { align: "center" }
      );
      y += 6;

      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, y, width - margin, y);
      y += 5;

      // Tabel Data Siswa
      const tableRows = classReportRows.map((r, idx) => [
        String(idx + 1),
        String(r.nis),
        String(r.name),
        String(r.gender),
        String(r.scores.R),
        String(r.scores.I),
        String(r.scores.A),
        String(r.scores.S),
        String(r.scores.E),
        String(r.scores.C),
        String(r.dominantCode),
        String(r.dominantPair),
        String(r.consistency),
        String(r.careerText),
      ]);

      autoTable(doc, {
        startY: y,
        head: [
          [
            "No",
            "NIS",
            "Nama Siswa",
            "JK",
            "R",
            "I",
            "A",
            "S",
            "E",
            "C",
            "Kode",
            "Pasangan",
            "Konsistensi",
            "Rekomendasi Karier",
          ],
        ],
        body: tableRows,
        theme: "grid",
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: [30, 64, 175],
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 20 },
          2: { cellWidth: 42 },
          3: { cellWidth: 10, halign: "center" },
          4: { cellWidth: 9, halign: "center" },
          5: { cellWidth: 9, halign: "center" },
          6: { cellWidth: 9, halign: "center" },
          7: { cellWidth: 9, halign: "center" },
          8: { cellWidth: 9, halign: "center" },
          9: { cellWidth: 9, halign: "center" },
          10: { cellWidth: 14, halign: "center", fontStyle: "bold" },
          11: { cellWidth: 16, halign: "center" },
          12: { cellWidth: 18, halign: "center" },
          13: { cellWidth: "auto" },
        },
      });

      y = doc.lastAutoTable.finalY + 8;

      // Area Tanda Tangan
      if (y + 30 > height - 12) {
        doc.addPage();
        y = 15;
      }

      const colWidth = (width - margin * 2) / 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(55, 65, 81);

      doc.text("Mengetahui,", margin + 20, y);
      doc.text(
        `Dicetak pada: ${new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        margin + colWidth + 20,
        y
      );

      y += 4;
      doc.setFont("helvetica", "bold");
      doc.text("Kepala Sekolah", margin + 20, y);
      doc.text("Guru Bimbingan Konseling (BK)", margin + colWidth + 20, y);

      y += 18;
      doc.setFont("helvetica", "normal");
      doc.text("( __________________________ )", margin + 20, y);
      doc.text("( __________________________ )", margin + colWidth + 20, y);

      // Nomor Halaman
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Laporan Rekapitulasi Kelas Holland RIASEC - Kelas: ${selectedClass} | Hal ${p} dari ${totalPages}`,
          width / 2,
          height - 6,
          { align: "center" }
        );
      }

      doc.save(`Laporan_RIASEC_Kelas_${selectedClass.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      alert("Gagal mengunduh PDF laporan kelas.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 print:p-0 print:m-0 print:max-w-none">
      
      {/* 1. TOP HEADER & AKSI (Tombol Cetak, Export, PDF) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 shadow-xs">
              <FileText size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Laporan Lengkap Kelas
              </h1>
              <p className="text-sm text-gray-500">
                Rekapitulasi dan analisis hasil asesmen minat karier Holland RIASEC per kelas
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-xs"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Perbarui
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={loading || classReportRows.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet size={17} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={loading || downloadingPDF || classReportRows.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {downloadingPDF ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Download size={17} />
            )}
            Download PDF
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={loading || classReportRows.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md transition-colors"
          >
            <Printer size={18} />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* 2. PILIHAN KELAS (HANYA PEMILIH KELAS, PILIHAN SISWA SUDAH DIHAPUS) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-600" />
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                Pilih Kelas untuk Laporan Lengkap
              </h2>
              <p className="text-xs text-gray-500">
                Laporan otomatis mencakup seluruh siswa dan analisis komprehensif pada kelas yang dipilih.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50/70 px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-xs"
            >
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  Kelas: {cls.name} ({cls.classCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 rounded-2xl border bg-white text-gray-500 shadow-xs">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <span>Memuat data laporan kelas...</span>
        </div>
      ) : classReportRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center shadow-xs">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">
            Belum Ada Siswa di Kelas {selectedClass}
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Silakan masukkan siswa ke kelas ini pada menu Data Master Siswa.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* 3. PRINT-ONLY HEADER (KOP RESMI LAPORAN KELAS) */}
          <div className="hidden print:block border-b-2 border-blue-800 pb-5 text-center">
            <h2 className="text-xl font-extrabold text-gray-900">
              Laporan Hasil Asesmen Minat Karier
            </h2>
            <p className="mt-1 text-sm font-semibold text-gray-600">
              Berdasarkan Teori Holland (RIASEC) — Rekapitulasi Kelas
            </p>
            {school?.name && (
              <p className="mt-2 text-base font-bold text-blue-900">
                {school.name}
              </p>
            )}
            <div className="mt-2 flex justify-center gap-6 text-xs text-gray-700">
              <span><strong>Kelas:</strong> {selectedClass}</span>
              <span><strong>Total Siswa:</strong> {classStats.total} Siswa</span>
              <span><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>

          {/* 4. KARTU STATISTIK RINGKASAN KELAS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Siswa</span>
                <Users size={18} className="text-blue-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">{classStats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Siswa terdaftar di kelas</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Sudah Mengisi</span>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-900">{classStats.completed}</p>
              <p className="text-xs text-emerald-700 mt-1">
                {classStats.percentageCompleted}% kelengkapan
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 shadow-xs">
              <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Belum Tes</span>
                <Clock size={18} className="text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-900">{classStats.pending}</p>
              <p className="text-xs text-amber-700 mt-1">Perlu didorong mengisi</p>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 shadow-xs">
              <div className="flex items-center justify-between text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Dominan Kelas</span>
                <Target size={18} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-indigo-900">
                {classStats.dominantType} - {classStats.dominantName}
              </p>
              <p className="text-xs text-indigo-700 mt-1">Paling banyak di kelas ini</p>
            </div>
          </div>

          {/* 5. DISTRIBUSI MINAT RIASEC KELAS (6 TIPE HOLLAND) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={19} className="text-blue-600" />
              Distribusi 6 Tipe Minat Holland di Kelas {selectedClass}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {RIASEC_ORDER.map((code) => {
                const desc = riasecDescriptions[code];
                const count = classStats.counts[code];
                const percentage =
                  classStats.completed > 0
                    ? ((count / classStats.completed) * 100).toFixed(0)
                    : 0;
                const avgScore = classStats.averageScores[code];

                return (
                  <div
                    key={code}
                    className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 text-center hover:bg-white hover:shadow-xs transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white font-black text-lg mb-2 shadow-xs"
                      style={{ backgroundColor: desc?.color || "#3b82f6" }}
                    >
                      {code}
                    </div>

                    <p className="font-bold text-sm text-gray-900">{desc?.name}</p>
                    <p className="text-xl font-black text-gray-800 mt-1">
                      {count}{" "}
                      <span className="text-xs font-semibold text-gray-500">siswa</span>
                    </p>
                    <p className="text-xs font-bold text-blue-700 mt-0.5">
                      {percentage}%
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-200 text-[11px] text-gray-500">
                      Rata-rata: <strong>{avgScore}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. TABEL REKAPITULASI HASIL ASESMEN SELURUH SISWA DI KELAS */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Rekapitulasi Nilai Asesmen Siswa Kelas {selectedClass}
                </h3>
                <p className="text-xs text-gray-500">
                  Daftar lengkap skor per tipe, kode dominan, konsistensi, dan rekomendasi karier
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full w-fit">
                {classReportRows.length} Siswa Terdaftar
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-blue-900 text-white font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">No</th>
                    <th className="py-3 px-3.5">NIS</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-2 text-center w-10">JK</th>
                    <th className="py-3 px-2 text-center bg-blue-950/40 w-9 font-mono">R</th>
                    <th className="py-3 px-2 text-center bg-blue-950/40 w-9 font-mono">I</th>
                    <th className="py-3 px-2 text-center bg-blue-950/40 w-9 font-mono">A</th>
                    <th className="py-3 px-2 text-center bg-blue-950/40 w-9 font-mono">S</th>
                    <th className="py-3 px-2 text-center bg-blue-950/40 w-9 font-mono">E</th>
                    <th className="py-3 px-2 text-center bg-blue-950/40 w-9 font-mono">C</th>
                    <th className="py-3 px-3 text-center font-bold">Kode</th>
                    <th className="py-3 px-3 text-center">Pasangan</th>
                    <th className="py-3 px-3 text-center">Konsistensi</th>
                    <th className="py-3 px-4 min-w-44">Rekomendasi Karier</th>
                    <th className="py-3 px-3 text-center print:hidden w-24">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {classReportRows.map((r, idx) => (
                    <tr
                      key={r.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-center text-gray-500 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-gray-700 font-semibold">
                        {r.nis}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {r.name}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-gray-600">
                        {r.gender}
                      </td>
                      
                      {/* 6 Skor RIASEC */}
                      <td className="py-3 px-2 text-center font-mono text-gray-800">
                        {r.hasTest ? r.scores.R : "-"}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-gray-800">
                        {r.hasTest ? r.scores.I : "-"}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-gray-800">
                        {r.hasTest ? r.scores.A : "-"}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-gray-800">
                        {r.hasTest ? r.scores.S : "-"}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-gray-800">
                        {r.hasTest ? r.scores.E : "-"}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-gray-800">
                        {r.hasTest ? r.scores.C : "-"}
                      </td>

                      {/* Kode Dominan */}
                      <td className="py-3 px-3 text-center">
                        {r.hasTest ? (
                          <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-xs">
                            {r.dominantCode}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Belum Tes</span>
                        )}
                      </td>

                      {/* Pasangan Dominan */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-gray-700">
                        {r.hasTest ? r.dominantPair : "-"}
                      </td>

                      {/* Konsistensi */}
                      <td className="py-3 px-3 text-center">
                        {r.hasTest ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              r.consistency.toLowerCase().includes("tinggi")
                                ? "bg-green-100 text-green-800"
                                : r.consistency.toLowerCase().includes("sedang")
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {r.consistency}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Rekomendasi Karier */}
                      <td className="py-3 px-4 text-xs text-gray-700 leading-snug">
                        {r.careerText}
                      </td>

                      {/* Tombol Aksi Detail */}
                      <td className="py-3 px-3 text-center print:hidden">
                        {r.hasTest ? (
                          <button
                            type="button"
                            onClick={() => setActiveStudentModal(r)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors shadow-2xs"
                            title="Lihat Laporan Siswa"
                          >
                            <Eye size={14} />
                            <span>Detail</span>
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. CATATAN PENGGUNAAN & LEMBAR PENGESAHAN CETAK */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4 print:border-none print:shadow-none">
            <h4 className="font-bold text-gray-900 text-sm">
              Catatan Bimbingan Karier Kelas:
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Rekapitulasi laporan kelas ini merupakan hasil asesmen pemetaan minat karier siswa berdasarkan teori Holland RIASEC. Data ini ditujukan sebagai panduan Guru BK dalam merancang bimbingan klasikal, pemilihan lintas minat/jurusan, dan perencanaan karier lanjutan bagi seluruh peserta didik di kelas {selectedClass}.
            </p>

            {/* Signature Area (Tampil saat cetak) */}
            <div className="hidden print:block pt-12 mt-8 border-t border-gray-300">
              <div className="grid grid-cols-2 text-xs text-gray-800">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold mt-1">Kepala Sekolah</p>
                  <div className="h-16" />
                  <p className="font-bold underline">_________________________</p>
                  <p className="text-gray-500 mt-0.5">NIP: .......................................</p>
                </div>
                <div className="text-right">
                  <p>
                    Dicetak pada:{" "}
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="font-bold mt-1">Guru Bimbingan Konseling (BK)</p>
                  <div className="h-16" />
                  <p className="font-bold underline">_________________________</p>
                  <p className="text-gray-500 mt-0.5">NIP: .......................................</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 text-center text-xs text-gray-400 print:text-gray-500">
              Laporan Rekapitulasi Hasil Asesmen Minat Karier Holland (RIASEC) — Kelas: {selectedClass}
            </div>
          </div>

        </div>
      )}

      {/* 8. MODAL DETAIL LAPORAN INDIVIDUAL SISWA (JIKA GURU KLIK DETAIL) */}
      <AnimatePresence>
        {activeStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStudentModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              key="modal-body"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 text-left overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
            >
              <div className="p-6 md:p-8 overflow-y-auto">
                <RiasecStudentReport
                  identity={{
                    name: activeStudentModal.name,
                    nis: activeStudentModal.nis,
                    gender: activeStudentModal.gender,
                    className: activeStudentModal.className,
                    schoolName: school?.name,
                  }}
                  rawScores={activeStudentModal.rawScores}
                  date={activeStudentModal.testDate}
                  dominantCode={activeStudentModal.dominantCode}
                  consistency={activeStudentModal.consistency}
                  onClose={() => setActiveStudentModal(null)}
                  title="Detail Hasil Asesmen Siswa"
                  subtitle={`Laporan individual peserta didik: ${activeStudentModal.name} (${activeStudentModal.className})`}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
