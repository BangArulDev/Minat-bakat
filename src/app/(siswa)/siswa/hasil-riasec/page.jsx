"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  Download,
  ArrowLeft,
  RefreshCw,
  Briefcase,
  TrendingUp,
  Star,
  ChevronRight,
  Info,
  Target,
  BarChart3,
  Award,
} from "lucide-react";
import { riasecDescriptions, RIASEC_ORDER } from "@/data/riasecDescriptions";
import {
  calculateScores,
  getTopThreeCode,
  getRankedScores,
  getConsistencyLevel,
  getCareerRecommendations,
  getScorePercentages,
} from "@/utils/riasecScoring";

export default function HasilRiasecPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("riasec_answers");
      if (!stored) {
        router.push("/siswa/tes-riasec");
        return;
      }

      const { answers, selfEstimates } = JSON.parse(stored);
      const scores = calculateScores(answers, selfEstimates);
      const code = getTopThreeCode(scores);
      const ranked = getRankedScores(scores);
      const consistency = getConsistencyLevel(code);
      const career = getCareerRecommendations(code);
      const percentages = getScorePercentages(scores);

      setResults({
        scores,
        code,
        ranked,
        consistency,
        career,
        percentages,
        answers,
        selfEstimates,
      });
    } catch (e) {
      console.error("Error loading results:", e);
      router.push("/siswa/tes-riasec");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleDownloadPDF = useCallback(async () => {
    if (!results) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Hasil Tes Minat Karier Holland RIASEC", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(
      `Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
      pageWidth / 2,
      28,
      { align: "center" }
    );

    // Kode Dominan
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`Kode Dominan: ${results.code}`, 14, 42);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(
      `Konsistensi: ${results.consistency.level}`,
      14,
      50
    );

    // Tabel Skor
    const scoreRows = results.ranked.map((r) => [
      `#${r.rank}`,
      `${riasecDescriptions[r.type].name} (${r.type})`,
      r.score.toString(),
      `${results.percentages[r.type]}%`,
    ]);

    autoTable(doc, {
      startY: 58,
      head: [["Peringkat", "Tipe RIASEC", "Skor", "Persentase"]],
      body: scoreRows,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 },
    });

    // Interpretasi
    let currentY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Interpretasi Tipe Dominan", 14, currentY);
    currentY += 8;

    results.code.split("").forEach((type) => {
      const desc = riasecDescriptions[type];
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text(`${desc.emoji} ${desc.name} (${desc.label})`, 14, currentY);
      currentY += 6;
      doc.setFont(undefined, "normal");
      const lines = doc.splitTextToSize(desc.description, pageWidth - 28);
      doc.text(lines, 14, currentY);
      currentY += lines.length * 5 + 6;
    });

    // Rekomendasi Karier
    if (results.career) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Rekomendasi Karier", 14, currentY);
      currentY += 8;

      const careerRows = results.career.recommendations.map((r, i) => [
        `${i + 1}`,
        r,
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["No", "Rekomendasi Pekerjaan"]],
        body: careerRows,
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
      });
    }

    doc.save(`Hasil_RIASEC_${results.code}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [results]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy size={24} className="text-amber-500" />
            Hasil Tes RIASEC
          </h1>
          <p className="text-sm text-gray-500">
            Berikut adalah hasil analisis minat kariermu
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/siswa/tes-riasec")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Ulangi Tes</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>

      {/* KODE DOMINAN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white shadow-xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-2 flex items-center gap-1">
            <Target size={16} /> Kode Minat Dominan
          </p>
          <div className="flex items-center gap-4 mb-4">
            {results.code.split("").map((type, i) => {
              const desc = riasecDescriptions[type];
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl font-bold">
                    <desc.icon size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{type}</p>
                    <p className="text-xs text-blue-200">{desc.name}</p>
                  </div>
                  {i < 2 && (
                    <ChevronRight size={20} className="text-blue-300 mx-1" />
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl">
              <p className="text-xs text-blue-200">Konsistensi</p>
              <p className="font-bold">{results.consistency.level}</p>
            </div>
            <p className="text-sm text-blue-100 max-w-lg">
              {results.consistency.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* SCORE OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            Profil RIASEC
          </h3>
          <RadarChart percentages={results.percentages} />
        </motion.div>

        {/* Score Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Peringkat Skor
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {results.ranked.map((r, idx) => {
              const desc = riasecDescriptions[r.type];
              const pct = results.percentages[r.type];
              return (
                <motion.div
                  key={r.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="px-6 py-4 flex items-center gap-4"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      idx === 0
                        ? "bg-amber-100 text-amber-700"
                        : idx === 1
                        ? "bg-gray-100 text-gray-600"
                        : idx === 2
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    #{r.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <desc.icon size={16} style={{ color: desc.color }} />
                      <span className="font-semibold text-sm text-gray-900">
                        {desc.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({desc.label})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: desc.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + idx * 0.1, duration: 0.6 }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{r.score}</p>
                    <p className="text-xs text-gray-400">{pct}%</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* INTERPRETASI TIPE DOMINAN */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info size={18} className="text-blue-600" />
          Interpretasi Tipe Dominanmu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.code.split("").map((type, idx) => {
            const desc = riasecDescriptions[type];
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div
                  className="px-5 py-4 flex items-center gap-3"
                  style={{ backgroundColor: desc.colorLight }}
                >
                  <desc.icon size={28} style={{ color: desc.color }} />
                  <div>
                    <p className="font-bold" style={{ color: desc.color }}>
                      {desc.name}
                    </p>
                    <p className="text-xs text-gray-500">{desc.shortDesc}</p>
                  </div>
                  {idx === 0 && (
                    <Award size={20} className="ml-auto text-amber-500" />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {desc.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {desc.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs px-2 py-0.5 rounded-md font-medium"
                        style={{
                          backgroundColor: desc.colorLight,
                          color: desc.color,
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* REKOMENDASI KARIER */}
      {results.career && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Briefcase size={20} />
              Rekomendasi Karier untuk Kode {results.career.code}
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              {results.career.interpretation}
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.career.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.03 }}
                  className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all"
                >
                  <div className="w-7 h-7 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{rec}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================
//  RADAR CHART (Pure Canvas)
// ============================================================
function RadarChart({ percentages }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 50;
    const types = RIASEC_ORDER;
    const numAxes = types.length;
    const angleStep = (Math.PI * 2) / numAxes;
    const startAngle = -Math.PI / 2; // Start from top

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw grid lines (20%, 40%, 60%, 80%, 100%)
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach((level) => {
      ctx.beginPath();
      for (let i = 0; i <= numAxes; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + Math.cos(angle) * radius * level;
        const y = cy + Math.sin(angle) * radius * level;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = level === 1.0 ? "#d1d5db" : "#e5e7eb";
      ctx.lineWidth = level === 1.0 ? 1.5 : 0.8;
      ctx.stroke();
    });

    // Draw axis lines
    types.forEach((_, i) => {
      const angle = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // Draw data polygon
    ctx.beginPath();
    types.forEach((type, i) => {
      const angle = startAngle + i * angleStep;
      const value = (percentages[type] || 0) / 100;
      const x = cx + Math.cos(angle) * radius * value;
      const y = cy + Math.sin(angle) * radius * value;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw data points and labels
    types.forEach((type, i) => {
      const angle = startAngle + i * angleStep;
      const value = (percentages[type] || 0) / 100;
      const x = cx + Math.cos(angle) * radius * value;
      const y = cy + Math.sin(angle) * radius * value;

      // Data point
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = riasecDescriptions[type].color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const labelRadius = radius + 28;
      const lx = cx + Math.cos(angle) * labelRadius;
      const ly = cy + Math.sin(angle) * labelRadius;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Emoji (Removed in favor of letter below)
      // ctx.font = "16px sans-serif";
      // ctx.fillText(riasecDescriptions[type].emoji, lx, ly - 10);

      // Type letter
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.fillStyle = riasecDescriptions[type].color;
      ctx.fillText(type, lx, ly - 2);

      // Percentage
      ctx.font = "11px Inter, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(`${percentages[type]}%`, lx, ly + 14);
    });
  }, [percentages]);

  return (
    <div className="flex items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  );
}
