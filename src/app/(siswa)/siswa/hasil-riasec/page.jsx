
"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { motion } from "framer-motion";

import {
  Trophy,
  Download,
  Briefcase,
  TrendingUp,
  ChevronRight,
  Info,
  Target,
  BarChart3,
  Award,
  RefreshCw,
  UserRound,
  School,
  GraduationCap,
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

import {
  getSiswaLatestResult,
} from "@/app/actions/riasec";

import {
  getSiswaReportIdentity,
} from "@/app/actions/siswa-report";

// ============================================
// KONFIGURASI
// ============================================

const TYPE_ORDER = ["R", "I", "A", "S", "E", "C"];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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

function buildResult(rawScores, date) {
  let scores = rawScores;

  if (typeof scores === "string") {
    scores = JSON.parse(scores);
  }

  if (!scores || typeof scores !== "object") {
    throw new Error("Data skor RIASEC tidak valid.");
  }

  const code = getTopThreeCode(scores);

  const ranked = getRankedScores(scores);

  const consistency = getConsistencyLevel(code);

  const career = getCareerRecommendations(code);

  const percentages = getScorePercentages(scores);

  const positions = getPositions(code);

  return {
    scores,
    code,
    ranked,
    consistency,
    career,
    percentages,
    positions,
    date: date || null,
  };
}

// ============================================
// HALAMAN HASIL RIASEC
// ============================================

export default function HasilRiasecPage() {
  const [results, setResults] = useState(null);
  const [identity, setIdentity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [resultResponse, identityResponse] =
        await Promise.all([
          getSiswaLatestResult(),
          getSiswaReportIdentity(),
        ]);

      if (
        !identityResponse?.success ||
        !identityResponse.data
      ) {
        throw new Error(
          identityResponse?.error ||
          "Identitas peserta tidak ditemukan."
        );
      }

      setIdentity(identityResponse.data);

      if (
        !resultResponse?.success ||
        !resultResponse.data
      ) {
        throw new Error(
          resultResponse?.error ||
          "Hasil asesmen belum tersedia di database."
        );
      }

      const result = buildResult(
        resultResponse.data.rawScores,
        resultResponse.data.createdAt ||
          resultResponse.data.date
      );

      setResults(result);
    } catch (err) {
      console.error("Load RIASEC result:", err);

      setResults(null);

      setError(
        err.message || "Gagal mengambil hasil asesmen."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // ============================================
  // DOWNLOAD PDF
  // ============================================

  const handleDownloadPDF = async () => {
    if (!results || !identity || downloading) {
      return;
    }

    setDownloading(true);

    try {
      const { default: jsPDF } = await import("jspdf");

      const { default: autoTable } =
        await import("jspdf-autotable");

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

      // ----------------------------------------
      // HELPER PDF
      // ----------------------------------------

      const ensureSpace = (requiredHeight) => {
        if (y + requiredHeight > height - 18) {
          doc.addPage();
          y = 20;
        }
      };

      const addParagraph = (text, fontSize = 10) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(55, 65, 81);

        const lines = doc.splitTextToSize(
          String(text || "—"),
          contentWidth
        );

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
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175);
        doc.text(text, margin, y);

        y += 8;
      };

      // ----------------------------------------
      // JUDUL LAPORAN
      // ----------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(30, 64, 175);

      doc.text(
        "CARE INDONESIA",
        width / 2,
        y,
        { align: "center" }
      );

      y += 9;

      doc.setFontSize(13);
      doc.setTextColor(17, 24, 39);

      doc.text(
        "HASIL ASESMEN MINAT KARIER",
        width / 2,
        y,
        { align: "center" }
      );

      y += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Berdasarkan Teori Holland (RIASEC)",
        width / 2,
        y,
        { align: "center" }
      );

      y += 8;

      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.7);
      doc.line(margin, y, width - margin, y);

      y += 9;

      // ----------------------------------------
      // IDENTITAS SISWA
      // ----------------------------------------

      addHeading("A. IDENTITAS PESERTA");

      const identityRows = [
        ["Nama Lengkap", identity.name || "—"],
        ["NIS", identity.nis || "—"],
        ["Kelas", identity.className || "—"],
        ["Sekolah", identity.schoolName || "—"],
        [
          "Tanggal Asesmen",
          formatDate(results.date),
        ],
      ];

      autoTable(doc, {
        startY: y,
        body: identityRows,
        theme: "plain",
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 10,
          cellPadding: 2.5,
          textColor: [40, 40, 40],
        },
        columnStyles: {
          0: {
            cellWidth: 43,
            fontStyle: "bold",
          },
        },
      });

      y = doc.lastAutoTable.finalY + 7;

      // ----------------------------------------
      // RINGKASAN HASIL
      // ----------------------------------------

      addHeading("B. RINGKASAN HASIL");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(30, 64, 175);

      doc.text(
        `Kode Holland: ${results.code}`,
        margin,
        y
      );

      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);

      doc.text(
        `Konsistensi: ${results.consistency.level}`,
        margin,
        y
      );

      y += 10;

      // ----------------------------------------
      // TABEL SKOR, PERINGKAT, POSISI
      // ----------------------------------------

      addHeading("C. SKOR DAN PERINGKAT RIASEC");

      const sortedRows = [...results.ranked]
        .sort((a, b) => a.rank - b.rank)
        .map((item) => [
          item.type,
          riasecDescriptions[item.type]?.name ||
            item.type,
          String(item.score),
          String(item.rank),
          results.positions[item.type] || "—",
        ]);

      autoTable(doc, {
        startY: y,
        head: [
          [
            "Tipe",
            "Nama Tipe",
            "Skor",
            "Peringkat",
            "Posisi",
          ],
        ],
        body: sortedRows,
        theme: "grid",
        margin: {
          left: margin,
          right: margin,
        },
        headStyles: {
          fillColor: [37, 99, 235],
          fontSize: 9,
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
      });

      y = doc.lastAutoTable.finalY + 7;

      // ----------------------------------------
      // INTERPRETASI TIPE DOMINAN
      // ----------------------------------------

      addHeading("D. INTERPRETASI TIPE DOMINAN");

      results.code.split("").forEach(
        (type, index) => {
          const desc = riasecDescriptions[type];

          if (!desc) return;

          ensureSpace(20);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(30, 64, 175);

          doc.text(
            `Dominan ${index + 1}: ${desc.name} (${type})`,
            margin,
            y
          );

          y += 7;

          addParagraph(desc.description, 9);
        }
      );

      // ----------------------------------------
      // REKOMENDASI KARIER
      // ----------------------------------------

      const careers =
        results.career?.recommendations || [];

      if (careers.length > 0) {
        addHeading("E. REKOMENDASI KARIER");

        const careerRows = careers.map(
          (career, index) => [
            String(index + 1),
            String(career),
          ]
        );

        autoTable(doc, {
          startY: y,
          head: [["No", "Rekomendasi Karier"]],
          body: careerRows,
          theme: "striped",
          margin: {
            left: margin,
            right: margin,
          },
          headStyles: {
            fillColor: [5, 150, 105],
          },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
        });

        y = doc.lastAutoTable.finalY + 8;
      }

      // ----------------------------------------
      // CATATAN
      // ----------------------------------------

      addHeading("F. CATATAN");

      addParagraph(
        "Hasil asesmen digunakan sebagai bahan " +
        "eksplorasi minat karier. Hasil ini bukan " +
        "penetapan mutlak pilihan pendidikan atau " +
        "pekerjaan. Diskusikan hasil dengan guru BK.",
        9
      );

      // ----------------------------------------
      // NOMOR HALAMAN
      // ----------------------------------------

      const pageCount =
        doc.internal.getNumberOfPages();

      for (
        let pageNumber = 1;
        pageNumber <= pageCount;
        pageNumber++
      ) {
        doc.setPage(pageNumber);

        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);

        doc.text(
          `CARE Indonesia | Halaman ${pageNumber} dari ${pageCount}`,
          width / 2,
          height - 10,
          { align: "center" }
        );
      }

      // ----------------------------------------
      // SIMPAN PDF
      // ----------------------------------------

      const safeNis = String(identity.nis || "Siswa")
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      doc.save(
        `Hasil_RIASEC_${safeNis}_${results.code}.pdf`
      );
    } catch (err) {
      console.error("Download PDF:", err);

      alert(
        "Gagal membuat PDF. Silakan coba kembali."
      );
    } finally {
      setDownloading(false);
    }
  };

  // ============================================
  // TAMPILAN LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center gap-3 text-gray-500">
        <RefreshCw
          className="animate-spin text-blue-600"
          size={30}
        />
        Memuat hasil asesmen...
      </div>
    );
  }

  // ============================================
  // TAMPILAN ERROR
  // ============================================

  if (error || !results) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle
          size={36}
          className="mx-auto mb-3 text-red-500"
        />

        <h2 className="text-xl font-bold text-gray-900">
          Hasil Asesmen Belum Tersedia
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {error || "Data hasil tidak ditemukan."}
        </p>

        <button
          type="button"
          onClick={loadResults}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  // ============================================
  // TAMPILAN HASIL
  // ============================================

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Trophy
              size={25}
              className="text-amber-500"
            />

            Hasil Tes RIASEC
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Hasil analisis minat karier berdasarkan
            teori Holland.
          </p>
        </div>

        {/* TOMBOL ULANGI TES SUDAH DIHAPUS */}

        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
        >
          {downloading ? (
            <RefreshCw
              size={18}
              className="animate-spin"
            />
          ) : (
            <Download size={18} />
          )}

          {downloading
            ? "Membuat PDF..."
            : "Download PDF"}
        </button>
      </div>

      {/* IDENTITAS SISWA */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 font-bold text-gray-900">
          <UserRound
            size={19}
            className="text-blue-600"
          />

          Identitas Peserta
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
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
            label="Kelas"
            value={identity?.className}
            icon={GraduationCap}
          />

          <IdentityItem
            label="Sekolah"
            value={identity?.schoolName}
            icon={School}
          />
        </div>
      </div>

      {/* KODE DOMINAN */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-7 text-white shadow-xl"
      >
        <div className="relative z-10">
          <p className="mb-3 flex items-center gap-2 text-sm text-blue-100">
            <Target size={17} />
            Kode Minat Dominan
          </p>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            {results.code.split("").map(
              (type, index) => {
                const desc =
                  riasecDescriptions[type];

                if (!desc) return null;

                const Icon = desc.icon;

                return (
                  <div
                    key={`${type}-${index}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                      <Icon size={29} />
                    </div>

                    <div>
                      <p className="text-xl font-bold">
                        {type}
                      </p>

                      <p className="text-xs text-blue-100">
                        {desc.name}
                      </p>
                    </div>

                    {index < 2 && (
                      <ChevronRight
                        size={19}
                        className="text-blue-200"
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-xl bg-white/15 px-4 py-3">
              <p className="text-xs text-blue-100">
                Konsistensi
              </p>

              <p className="font-bold">
                {results.consistency.level}
              </p>
            </div>

            <p className="max-w-lg text-sm text-blue-100">
              {results.consistency.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* PROFIL SKOR */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* RADAR */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 font-bold text-gray-900">
            <BarChart3
              size={19}
              className="text-blue-600"
            />

            Profil RIASEC
          </h3>

          <RadarChart
            percentages={results.percentages}
          />
        </div>

        {/* PERINGKAT */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b bg-gray-50 px-6 py-5">
            <h3 className="flex items-center gap-2 font-bold text-gray-900">
              <TrendingUp
                size={19}
                className="text-blue-600"
              />

              Peringkat Skor RIASEC
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {results.ranked.map((item) => {
              const desc =
                riasecDescriptions[item.type];

              if (!desc) return null;

              const Icon = desc.icon;

              return (
                <div
                  key={item.type}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                    {item.rank}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Icon
                        size={16}
                        style={{
                          color: desc.color,
                        }}
                      />

                      <span className="font-semibold text-gray-900">
                        {item.type} - {desc.name}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${
                            results.percentages[
                              item.type
                            ] || 0
                          }%`,
                          backgroundColor:
                            desc.color,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs font-medium text-blue-700">
                      {results.positions[
                        item.type
                      ] || "—"}
                    </p>
                  </div>

                  <span className="font-bold text-gray-900">
                    {item.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TABEL DETAIL */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-6 py-5">
          <h3 className="font-bold text-gray-900">
            Tabel Skor, Peringkat, dan Posisi
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-50 text-blue-900">
              <tr>
                <th className="px-5 py-3">Tipe</th>
                <th className="px-5 py-3">Skor</th>
                <th className="px-5 py-3">Peringkat</th>
                <th className="px-5 py-3">Posisi</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {TYPE_ORDER.map((type) => {
                const item = results.ranked.find(
                  (row) => row.type === type
                );

                return (
                  <tr key={type}>
                    <td className="px-5 py-3 font-semibold">
                      {type}
                    </td>

                    <td className="px-5 py-3">
                      {item?.score ?? 0}
                    </td>

                    <td className="px-5 py-3">
                      {item?.rank ?? "—"}
                    </td>

                    <td className="px-5 py-3 font-medium text-blue-700">
                      {results.positions[type] || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTERPRETASI */}

      <section>
        <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
          <Info
            size={19}
            className="text-blue-600"
          />

          Interpretasi Tipe Dominan
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          {results.code.split("").map(
            (type, index) => {
              const desc =
                riasecDescriptions[type];

              if (!desc) return null;

              const Icon = desc.icon;

              return (
                <div
                  key={`${type}-${index}`}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div
                    className="flex items-center gap-3 px-5 py-4"
                    style={{
                      backgroundColor:
                        desc.colorLight,
                    }}
                  >
                    <Icon
                      size={25}
                      style={{
                        color: desc.color,
                      }}
                    />

                    <div>
                      <p
                        className="font-bold"
                        style={{
                          color: desc.color,
                        }}
                      >
                        Dominan {index + 1}
                      </p>

                      <p className="text-sm font-semibold text-gray-700">
                        {desc.name}
                      </p>
                    </div>

                    {index === 0 && (
                      <Award
                        size={20}
                        className="ml-auto text-amber-500"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-sm leading-7 text-gray-600">
                      {desc.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(desc.keywords || []).map(
                        (keyword) => (
                          <span
                            key={keyword}
                            className="rounded-md px-2 py-1 text-xs font-medium"
                            style={{
                              backgroundColor:
                                desc.colorLight,
                              color: desc.color,
                            }}
                          >
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* REKOMENDASI KARIER */}

      {results.career && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 text-white">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Briefcase size={20} />

              Rekomendasi Karier untuk Kode{" "}
              {results.code}
            </h3>

            <p className="mt-2 text-sm text-emerald-100">
              {results.career.interpretation}
            </p>
          </div>

          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {(results.career.recommendations || [])
              .map((career, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-200 text-xs font-bold text-emerald-800">
                    {index + 1}
                  </div>

                  <p className="text-sm font-medium text-gray-800">
                    {career}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// KOMPONEN IDENTITAS
// ============================================

function IdentityItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <Icon
        size={19}
        className="mt-0.5 shrink-0 text-blue-600"
      />

      <div>
        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="mt-1 font-semibold text-gray-900">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// ============================================
// RADAR CHART RIASEC
// ============================================

function RadarChart({ percentages }) {
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

    [0.2, 0.4, 0.6, 0.8, 1].forEach(
      (level) => {
        ctx.beginPath();

        for (let i = 0; i <= count; i++) {
          const angle =
            startAngle + i * angleStep;

          const x =
            cx +
            Math.cos(angle) * radius * level;

          const y =
            cy +
            Math.sin(angle) * radius * level;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();

        ctx.strokeStyle =
          level === 1
            ? "#d1d5db"
            : "#e5e7eb";

        ctx.lineWidth =
          level === 1 ? 1.5 : 0.8;

        ctx.stroke();
      }
    );

    // AXIS

    types.forEach((_, index) => {
      const angle =
        startAngle + index * angleStep;

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
      const angle =
        startAngle + index * angleStep;

      const value =
        (percentages[type] || 0) / 100;

      const x =
        cx + Math.cos(angle) * radius * value;

      const y =
        cy + Math.sin(angle) * radius * value;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();

    ctx.fillStyle =
      "rgba(59, 130, 246, 0.15)";
    ctx.fill();

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // TITIK DAN LABEL

    types.forEach((type, index) => {
      const desc =
        riasecDescriptions[type];

      const angle =
        startAngle + index * angleStep;

      const value =
        (percentages[type] || 0) / 100;

      const x =
        cx + Math.cos(angle) * radius * value;

      const y =
        cy + Math.sin(angle) * radius * value;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);

      ctx.fillStyle = desc.color;
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      const labelRadius = radius + 28;

      const lx =
        cx + Math.cos(angle) * labelRadius;

      const ly =
        cy + Math.sin(angle) * labelRadius;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = desc.color;

      ctx.fillText(type, lx, ly - 2);

      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#6b7280";

      ctx.fillText(
        `${percentages[type] || 0}%`,
        lx,
        ly + 14
      );
    });
  }, [percentages]);

  return (
    <div className="flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="max-w-full"
      />
    </div>
  );
}
