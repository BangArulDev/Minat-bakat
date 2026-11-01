"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Download,
  Printer,
  Briefcase,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Info,
  Target,
  BarChart3,
  Award,
  RefreshCw,
  UserRound,
  School,
  GraduationCap,
  Calendar,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";

import {
  riasecDescriptions,
  RIASEC_ORDER,
} from "@/data/riasecDescriptions";

import {
  getTopThreeCode,
  getRankedScores,
  getConsistencyLevel,
  getCareerRecommendations,
  getScorePercentages,
} from "@/utils/riasecScoring";

const TYPE_ORDER = ["R", "I", "A", "S", "E", "C"];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getPositions(code) {
  const positions = {};
  String(code || "")
    .toUpperCase()
    .split("")
    .slice(0, 3)
    .forEach((type, index) => {
      positions[type] = `Dominan ${index + 1}`;
    });
  return positions;
}

export function buildResultData(rawScores, date, explicitDominantCode, explicitConsistency) {
  let scores = rawScores;
  if (typeof scores === "string") {
    try {
      scores = JSON.parse(scores);
    } catch {
      scores = {};
    }
  }
  if (!scores || typeof scores !== "object") {
    scores = {};
  }

  // Ensure all 6 types have numeric values
  const normalizedScores = {};
  TYPE_ORDER.forEach((t) => {
    normalizedScores[t] = Number(scores[t] || scores[t.toLowerCase()] || 0);
  });

  const code = explicitDominantCode || getTopThreeCode(normalizedScores) || "RIA";
  const dominantPair = String(code).slice(0, 2);
  const ranked = getRankedScores(normalizedScores);

  let consistency;
  try {
    consistency = getConsistencyLevel(code);
    if (explicitConsistency && explicitConsistency !== "-") {
      consistency.level = explicitConsistency;
    }
  } catch {
    consistency = {
      level: explicitConsistency || "Sedang",
      description: "Menunjukkan pola minat yang khas pada siswa.",
    };
  }

  const career = getCareerRecommendations(code) || {
    interpretation: `Siswa memiliki pola minat dominan ${code}.`,
    recommendations: [],
  };

  const percentages = getScorePercentages(normalizedScores);
  const positions = getPositions(code);

  return {
    scores: normalizedScores,
    code,
    dominantPair,
    ranked,
    consistency,
    career,
    percentages,
    positions,
    date: date || null,
  };
}

export default function RiasecStudentReport({
  identity = {},
  rawScores = {},
  date = null,
  dominantCode = null,
  consistency = null,
  onClose = null,
  onPrev = null,
  onNext = null,
  title = "Laporan Hasil Asesmen RIASEC",
  subtitle = "Hasil analisis minat karier berdasarkan teori Holland.",
}) {
  const [downloading, setDownloading] = useState(false);

  const results = useMemo(() => {
    return buildResultData(rawScores, date, dominantCode, consistency);
  }, [rawScores, date, dominantCode, consistency]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!results) return;

    setDownloading(true);

    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = width - margin * 2;
      let y = 18;

      const ensureSpace = (requiredSpace) => {
        if (y + requiredSpace > height - 18) {
          doc.addPage();
          y = 18;
        }
      };

      const addParagraph = (text, fontSize = 9) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(55, 65, 81);

        const lines = doc.splitTextToSize(String(text || "—"), contentWidth);
        const lineHeight = fontSize * 0.48;

        for (const line of lines) {
          ensureSpace(lineHeight + 2);
          doc.text(line, margin, y);
          y += lineHeight + 1;
        }
        y += 3;
      };

      const addHeading = (text) => {
        ensureSpace(16);
        y += 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 64, 175);
        doc.text(text, margin, y);
        y += 7;
      };

      // ----------------------------------------
      // JUDUL LAPORAN
      // ----------------------------------------
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text("Laporan Hasil Asesmen Minat Karier", width / 2, y, {
        align: "center",
      });
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);
      doc.text("Berdasarkan Teori Holland (RIASEC)", width / 2, y, {
        align: "center",
      });
      y += 6;

      if (identity.schoolName) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(55, 65, 81);
        doc.text(String(identity.schoolName), width / 2, y, {
          align: "center",
        });
        y += 6;
      }

      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.6);
      doc.line(margin, y, width - margin, y);
      y += 8;

      // ----------------------------------------
      // A. IDENTITAS PESERTA
      // ----------------------------------------
      addHeading("A. IDENTITAS PESERTA");

      const genderLabel =
        identity.gender === "L"
          ? "Laki-laki (L)"
          : identity.gender === "P"
          ? "Perempuan (P)"
          : identity.gender || "—";

      const identityRows = [
        ["Nama Lengkap", identity.name || "—"],
        ["NIS", identity.nis || "—"],
        ["Jenis Kelamin", genderLabel],
        ["Kelas", identity.className || "—"],
        ["Sekolah", identity.schoolName || "—"],
        ["Tanggal Asesmen", formatDate(results.date)],
      ];

      autoTable(doc, {
        startY: y,
        body: identityRows,
        theme: "plain",
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9.5,
          cellPadding: 2.2,
          textColor: [40, 40, 40],
        },
        columnStyles: {
          0: { cellWidth: 42, fontStyle: "bold" },
        },
      });

      y = doc.lastAutoTable.finalY + 6;

      // ----------------------------------------
      // B. RINGKASAN HASIL
      // ----------------------------------------
      addHeading("B. RINGKASAN HASIL ASESMEN");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text(
        `Kode Holland: ${results.code}   |   Pasangan Dominan: ${results.dominantPair}`,
        margin,
        y
      );
      y += 7;

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      doc.text(`Tingkat Konsistensi: ${results.consistency.level}`, margin, y);
      y += 5;

      if (results.consistency.description) {
        addParagraph(results.consistency.description, 9);
      } else {
        y += 4;
      }

      // ----------------------------------------
      // C. TABEL SKOR DAN PERINGKAT RIASEC
      // ----------------------------------------
      addHeading("C. SKOR DAN PERINGKAT RIASEC");

      const sortedRows = [...results.ranked]
        .sort((a, b) => a.rank - b.rank)
        .map((item) => [
          item.type,
          riasecDescriptions[item.type]?.name || item.type,
          String(item.score),
          String(item.rank),
          results.positions[item.type] || "—",
        ]);

      autoTable(doc, {
        startY: y,
        head: [["Tipe", "Nama Tipe", "Skor", "Peringkat", "Posisi"]],
        body: sortedRows,
        theme: "grid",
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: [37, 99, 235],
          fontSize: 9,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 2.5,
        },
      });

      y = doc.lastAutoTable.finalY + 7;

      // ----------------------------------------
      // D. INTERPRETASI TIPE DOMINAN
      // ----------------------------------------
      addHeading("D. INTERPRETASI TIPE DOMINAN");

      results.code.split("").forEach((type, index) => {
        const desc = riasecDescriptions[type];
        if (!desc) return;

        ensureSpace(20);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 64, 175);
        doc.text(
          `Dominan ${index + 1}: ${desc.name} (${type})`,
          margin,
          y
        );
        y += 5.5;

        addParagraph(desc.description, 8.5);
      });

      // ----------------------------------------
      // E. REKOMENDASI KARIER
      // ----------------------------------------
      const careers = results.career?.recommendations || [];
      if (careers.length > 0) {
        addHeading("E. REKOMENDASI KARIER");

        if (results.career?.interpretation) {
          addParagraph(results.career.interpretation, 9);
        }

        const careerRows = careers.map((c, idx) => [
          String(idx + 1),
          String(c),
        ]);

        autoTable(doc, {
          startY: y,
          head: [["No", "Rekomendasi Profesi / Karier"]],
          body: careerRows,
          theme: "striped",
          margin: { left: margin, right: margin },
          headStyles: {
            fillColor: [5, 150, 105],
            fontSize: 9,
            fontStyle: "bold",
          },
          styles: {
            fontSize: 8.5,
            cellPadding: 2.5,
          },
        });

        y = doc.lastAutoTable.finalY + 7;
      }

      // ----------------------------------------
      // F. CATATAN PENGGUNAAN HASIL
      // ----------------------------------------
      addHeading("F. CATATAN PENGGUNAAN HASIL");

      addParagraph(
        "Laporan ini merupakan bahan eksplorasi minat karier, bukan penetapan mutlak pilihan pendidikan atau pekerjaan. Hasil sebaiknya didiskusikan bersama Guru Bimbingan dan Konseling (BK) serta dipertimbangkan dengan kemampuan, pengalaman, dan tujuan pribadi siswa.",
        8.5
      );

      // Area Tanda Tangan
      ensureSpace(35);
      y += 8;
      const colWidth = (width - margin * 2) / 2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);

      doc.text("Mengetahui,", margin + 10, y);
      doc.text(
        `Dicetak pada: ${new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        margin + colWidth + 10,
        y
      );

      y += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Kepala Sekolah", margin + 10, y);
      doc.text("Guru Bimbingan Konseling (BK)", margin + colWidth + 10, y);

      y += 22;
      doc.setFont("helvetica", "normal");
      doc.text("( __________________________ )", margin + 10, y);
      doc.text("( __________________________ )", margin + colWidth + 10, y);

      // ----------------------------------------
      // FOOTER & NOMOR HALAMAN
      // ----------------------------------------
      const pageCount = doc.internal.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Laporan Hasil Asesmen RIASEC | Halaman ${p} dari ${pageCount}`,
          width / 2,
          height - 9,
          { align: "center" }
        );
      }

      // ----------------------------------------
      // SIMPAN FILE
      // ----------------------------------------
      const safeNis = String(identity.nis || "Siswa").replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );
      doc.save(`Hasil_RIASEC_${safeNis}_${results.code}.pdf`);
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-12 print:p-0 print:m-0 print:max-w-none">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Trophy size={24} className="text-amber-500" />
            {title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Optional Prev/Next Navigation (for teacher modal) */}
          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              title="Siswa Sebelumnya"
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors shadow-xs"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              title="Siswa Selanjutnya"
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors shadow-xs"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Cetak Laporan Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-all"
          >
            <Printer size={17} className="text-gray-500" />
            <span>Cetak</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {downloading ? (
              <RefreshCw size={17} className="animate-spin" />
            ) : (
              <Download size={17} />
            )}
            <span>{downloading ? "Membuat PDF..." : "Download PDF"}</span>
          </button>

          {/* Optional Close Button (for modal) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Tutup"
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-1 shadow-xs"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 2. PRINT-ONLY HEADER (KOP LAPORAN) */}
      <div className="hidden print:block border-b-2 border-blue-800 pb-5 text-center">
        <h2 className="text-xl font-extrabold text-gray-900">
          Laporan Hasil Asesmen Minat Karier
        </h2>
        <p className="mt-1 text-sm font-semibold text-gray-600">
          Berdasarkan Teori Holland (RIASEC)
        </p>
        {identity.schoolName && (
          <p className="mt-2 text-sm font-medium text-gray-800">
            {identity.schoolName}
          </p>
        )}
      </div>

      {/* 3. IDENTITAS PESERTA */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs print:shadow-none print:border-gray-300">
        <h2 className="mb-5 flex items-center gap-2 font-bold text-gray-900 text-base">
          <UserRound size={19} className="text-blue-600" />
          Identitas Peserta
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <IdentityItem
            label="Nama Lengkap"
            value={identity?.name}
            icon={UserRound}
          />
          <IdentityItem
            label="NIS"
            value={identity?.nis}
            icon={Info}
          />
          <IdentityItem
            label="Jenis Kelamin"
            value={
              identity?.gender === "L"
                ? "Laki-laki (L)"
                : identity?.gender === "P"
                ? "Perempuan (P)"
                : identity?.gender || "—"
            }
            icon={UserRound}
          />
          <IdentityItem
            label="Kelas"
            value={identity?.className}
            icon={GraduationCap}
          />
          <IdentityItem
            label="Sekolah"
            value={identity?.schoolName}
            icon={School}
          />
          <IdentityItem
            label="Tanggal Asesmen"
            value={formatDate(results?.date)}
            icon={Calendar}
          />
        </div>
      </div>

      {/* 4. KODE MINAT DOMINAN (HERO BANNER) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-7 text-white shadow-xl print:shadow-none print:bg-blue-700"
      >
        <div className="relative z-10">
          <p className="mb-3 flex items-center gap-2 text-sm text-blue-100 font-semibold tracking-wide uppercase">
            <Target size={17} />
            Kode Minat Dominan
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            {results.code.split("").map((type, index) => {
              const desc = riasecDescriptions[type];
              if (!desc) return null;
              const Icon = desc.icon;

              return (
                <div key={`${type}-${index}`} className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
                    <Icon size={28} />
                  </div>

                  <div>
                    <p className="text-2xl font-black tracking-tight">{type}</p>
                    <p className="text-xs text-blue-100 font-medium">{desc.name}</p>
                  </div>

                  {index < 2 && (
                    <ChevronRight size={20} className="text-blue-200/80 ml-1" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/15">
            <div className="rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-xs">
              <p className="text-[11px] text-blue-100 font-semibold uppercase tracking-wider">
                Pasangan Dominan
              </p>
              <p className="font-bold text-lg font-mono tracking-wider">
                {results.dominantPair}
              </p>
            </div>

            <div className="rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-xs">
              <p className="text-[11px] text-blue-100 font-semibold uppercase tracking-wider">
                Konsistensi
              </p>
              <p className="font-bold text-lg">{results.consistency.level}</p>
            </div>

            <p className="max-w-lg text-xs md:text-sm text-blue-100 leading-relaxed">
              {results.consistency.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 5. PROFIL SKOR (RADAR CHART & RANKING BARS) */}
      <div className="grid gap-6 lg:grid-cols-2 print:grid-cols-2">
        {/* RADAR CHART */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs print:shadow-none print:border-gray-300">
          <h3 className="mb-5 flex items-center gap-2 font-bold text-gray-900 text-base">
            <BarChart3 size={19} className="text-blue-600" />
            Grafik Poligon RIASEC
          </h3>
          <RadarChart percentages={results.percentages} />
        </div>

        {/* PERINGKAT SKOR */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs print:shadow-none print:border-gray-300">
          <div className="border-b bg-gray-50/80 px-6 py-4">
            <h3 className="flex items-center gap-2 font-bold text-gray-900 text-base">
              <TrendingUp size={19} className="text-blue-600" />
              Peringkat Skor RIASEC
            </h3>
          </div>

          <div className="divide-y divide-gray-100 p-2">
            {results.ranked.map((item) => {
              const desc = riasecDescriptions[item.type];
              if (!desc) return null;
              const Icon = desc.icon;

              return (
                <div
                  key={item.type}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 rounded-xl transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                    {item.rank}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Icon size={16} style={{ color: desc.color }} />
                      <span className="font-bold text-sm text-gray-900">
                        {item.type} - {desc.name}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${results.percentages[item.type] || 0}%`,
                          backgroundColor: desc.color,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-[11px] font-semibold text-blue-700">
                      {results.positions[item.type] || "—"}
                    </p>
                  </div>

                  <span className="font-bold text-base text-gray-900 font-mono">
                    {item.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. TABEL SKOR, PERINGKAT, DAN POSISI */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs print:shadow-none print:border-gray-300">
        <div className="border-b bg-gray-50/80 px-6 py-4">
          <h3 className="font-bold text-gray-900 text-base">
            Tabel Skor, Peringkat, dan Posisi RIASEC
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-50/70 text-blue-900">
              <tr>
                <th className="px-5 py-3.5 font-bold">Tipe</th>
                <th className="px-5 py-3.5 font-bold">Nama Tipe</th>
                <th className="px-5 py-3.5 font-bold">Skor</th>
                <th className="px-5 py-3.5 font-bold text-center">Peringkat</th>
                <th className="px-5 py-3.5 font-bold">Posisi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {TYPE_ORDER.map((type) => {
                const item = results.ranked.find((row) => row.type === type);
                const desc = riasecDescriptions[type];

                return (
                  <tr key={type} className="hover:bg-gray-50/40">
                    <td className="px-5 py-3 font-bold text-blue-900">{type}</td>
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      {desc?.name || type}
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-900 font-mono">
                      {item?.score ?? 0}
                    </td>
                    <td className="px-5 py-3 font-bold text-center text-gray-700">
                      {item?.rank ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-semibold text-blue-700">
                      {results.positions[type] || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. INTERPRETASI TIPE DOMINAN */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-900 text-base">
          <Info size={19} className="text-blue-600" />
          Interpretasi Tipe Dominan
        </h3>

        <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
          {results.code.split("").map((type, index) => {
            const desc = riasecDescriptions[type];
            if (!desc) return null;
            const Icon = desc.icon;

            return (
              <div
                key={`${type}-${index}`}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs print:shadow-none print:border-gray-300"
              >
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{ backgroundColor: desc.colorLight }}
                >
                  <Icon size={24} style={{ color: desc.color }} />

                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider" style={{ color: desc.color }}>
                      Dominan {index + 1}
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {desc.name}
                    </p>
                  </div>

                  {index === 0 && (
                    <Award size={20} className="ml-auto text-amber-500" />
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                    {desc.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(desc.keywords || []).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-md px-2 py-1 text-[11px] font-semibold"
                        style={{
                          backgroundColor: desc.colorLight,
                          color: desc.color,
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. REKOMENDASI KARIER */}
      {results.career && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs print:shadow-none print:border-gray-300">
          <div className="bg-linear-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Briefcase size={20} />
              Rekomendasi Karier untuk Kode {results.code}
            </h3>

            {results.career.interpretation && (
              <p className="mt-2 text-xs sm:text-sm text-emerald-100 leading-relaxed">
                {results.career.interpretation}
              </p>
            )}
          </div>

          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
            {(results.career.recommendations || []).map((career, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-200 text-xs font-bold text-emerald-800 font-mono">
                  {index + 1}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-800">
                  {career}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. CATATAN PENGGUNAAN HASIL */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs print:shadow-none print:border-gray-300 space-y-3">
        <h4 className="font-bold text-gray-900 text-sm">
          Catatan Penggunaan Hasil Asesmen:
        </h4>
        <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
          Laporan ini merupakan bahan eksplorasi minat karier, bukan penetapan mutlak pilihan pendidikan atau pekerjaan peserta. Hasil sebaiknya didiskusikan bersama Guru Bimbingan dan Konseling (BK) serta dipertimbangkan bersama kemampuan akademik, minat pribadi, dan tujuan masa depan peserta didik.
        </p>

        {/* Signature Area (Visible during printing) */}
        <div className="hidden print:block pt-10 mt-6 border-t border-gray-300">
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
          Laporan Asesmen Minat Karier Holland (RIASEC)
        </div>
      </section>

    </div>
  );
}

// ============================================
// KOMPONEN ITEM IDENTITAS
// ============================================
function IdentityItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 print:bg-white print:border-gray-200">
      <Icon size={18} className="mt-0.5 shrink-0 text-blue-600" />
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-0.5 font-bold text-sm text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}

// ============================================
// KOMPONEN RADAR CHART
// ============================================
function RadarChart({ percentages = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 320;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 50;

    const types = RIASEC_ORDER;
    const count = types.length;
    const angleStep = (Math.PI * 2) / count;
    const startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, size, size);

    // GRID
    [0.2, 0.4, 0.6, 0.8, 1].forEach((level) => {
      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + Math.cos(angle) * radius * level;
        const y = cy + Math.sin(angle) * radius * level;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = level === 1 ? "#d1d5db" : "#e5e7eb";
      ctx.lineWidth = level === 1 ? 1.5 : 0.8;
      ctx.stroke();
    });

    // AXIS
    types.forEach((_, index) => {
      const angle = startAngle + index * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius
      );
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // POLYGON
    ctx.beginPath();
    types.forEach((type, index) => {
      const angle = startAngle + index * angleStep;
      const value = (percentages[type] || 0) / 100;
      const x = cx + Math.cos(angle) * radius * value;
      const y = cy + Math.sin(angle) * radius * value;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // TITIK DAN LABEL
    types.forEach((type, index) => {
      const desc = riasecDescriptions[type];
      const angle = startAngle + index * angleStep;
      const value = (percentages[type] || 0) / 100;
      const x = cx + Math.cos(angle) * radius * value;
      const y = cy + Math.sin(angle) * radius * value;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = desc?.color || "#3b82f6";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      const labelRadius = radius + 28;
      const lx = cx + Math.cos(angle) * labelRadius;
      const ly = cy + Math.sin(angle) * labelRadius;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = desc?.color || "#1f2937";
      ctx.fillText(type, lx, ly - 2);

      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(`${percentages[type] || 0}%`, lx, ly + 14);
    });
  }, [percentages]);

  return (
    <div className="flex items-center justify-center overflow-hidden py-2">
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  );
}
