
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Printer,
  RefreshCw,
  Search,
  School,
  UserRound,
  GraduationCap,
  ChartColumnIncreasing,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getStudents,
  getClassrooms,
  getSchoolProfile,
  getDetailedResults,
} from "@/app/actions/guru";

const TYPES = [
  { code: "R", name: "Realistic" },
  { code: "I", name: "Investigative" },
  { code: "A", name: "Artistic" },
  { code: "S", name: "Social" },
  { code: "E", name: "Enterprising" },
  { code: "C", name: "Conventional" },
];

const SCORE_COLORS = {
  R: "bg-blue-600",
  I: "bg-cyan-600",
  A: "bg-purple-600",
  S: "bg-emerald-600",
  E: "bg-orange-500",
  C: "bg-indigo-600",
};

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function normalizeScores(rawScores) {
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

  return TYPES.map((type, index) => {
    const rawValue =
      scores[type.code] ??
      scores[type.code.toLowerCase()] ??
      (Array.isArray(scores) ? scores[index] : undefined);

    const numeric = Number(rawValue);

    return {
      ...type,
      score:
        rawValue !== undefined &&
        rawValue !== null &&
        rawValue !== "" &&
        Number.isFinite(numeric)
          ? numeric
          : 0,
    };
  });
}

function createRanking(scores, dominantCode) {
  const order = String(dominantCode || "")
    .toUpperCase()
    .split("")
    .filter((code) => TYPES.some((type) => type.code === code));

  const rankOrder = { R: 0, I: 1, A: 2, S: 3, E: 4, C: 5 };

  const sorted = [...scores].sort(
    (a, b) =>
      b.score - a.score ||
      order.indexOf(a.code) - order.indexOf(b.code) ||
      rankOrder[a.code] - rankOrder[b.code]
  );

  // Apabila tersedia, gunakan kode dominan tersimpan
  // untuk menentukan posisi 1-3 ketika skor seri.
  const positions =
    order.length >= 3
      ? order.slice(0, 3)
      : sorted.slice(0, 3).map((item) => item.code);

  const ranks = Object.fromEntries(
    sorted.map((item, index) => [item.code, index + 1])
  );

  return scores.map((item) => {
    const positionIndex = positions.indexOf(item.code);

    return {
      ...item,
      rank: ranks[item.code],
      position:
        positionIndex >= 0
          ? `Dominan ${positionIndex + 1}`
          : "—",
    };
  });
}

export default function LaporanLengkapPage() {
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [results, setResults] = useState([]);
  const [school, setSchool] = useState(null);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
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
      setClassrooms(classesResponse.data || []);
      setSchool(schoolResponse.data || {});
      setResults(resultsResponse.data || []);
    } catch (err) {
      console.error("Laporan Lengkap:", err);
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchClass =
        !selectedClass ||
        student.className === selectedClass;

      const matchSearch =
        !keyword ||
        String(student.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(student.nis || "")
          .toLowerCase()
          .includes(keyword);

      return matchClass && matchSearch;
    });
  }, [students, selectedClass, search]);

  const selectedStudent = students.find(
    (student) => student.id === selectedStudentId
  );

  // getDetailedResults mengembalikan hasil berdasarkan tanggal
  // terbaru. Jika siswa memiliki beberapa tes, gunakan
  // hasil terbaru yang tersedia.
  const latestResult = useMemo(() => {
    if (!selectedStudent) return null;

    return [...results]
      .filter(
        (result) =>
          String(result.nis) === String(selectedStudent.nis)
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )[0] || null;
  }, [results, selectedStudent]);

  const ranking = useMemo(() => {
    if (!latestResult) return [];

    return createRanking(
      normalizeScores(latestResult.rawScores),
      latestResult.dominantCode
    );
  }, [latestResult]);

  const maximumScore = Math.max(
    1,
    ...ranking.map((item) => item.score)
  );

  const dominantCode = latestResult?.dominantCode || "—";

  const handlePrint = () => {
    if (!selectedStudent || !latestResult) return;

    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* CSS khusus untuk mencetak laporan saja */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          #care-laporan-cetak,
          #care-laporan-cetak * {
            visibility: visible !important;
          }

          #care-laporan-cetak {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }

          #care-laporan-cetak .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          #care-laporan-cetak .print-bar {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <FileText size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Laporan Lengkap
              </h1>
              <p className="text-sm text-gray-500">
                Hasil Asesmen Minat Karier Holland RIASEC
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Perbarui
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!latestResult || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Printer size={18} />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* FILTER */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Search size={19} className="text-blue-600" />
          <h2 className="font-bold text-gray-900">
            Pilih Data Laporan
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600">
              Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(event) => {
                setSelectedClass(event.target.value);
                setSelectedStudentId("");
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Semua Kelas</option>
              {classrooms.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600">
              Cari Nama / NIS
            </label>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedStudentId("");
              }}
              placeholder="Cari siswa..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600">
              Nama Siswa
            </label>
            <select
              value={selectedStudentId}
              onChange={(event) =>
                setSelectedStudentId(event.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Pilih siswa</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nis} - {student.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 rounded-2xl border bg-white text-gray-500">
          <Loader2 size={23} className="animate-spin" />
          Memuat data laporan...
        </div>
      ) : !selectedStudent ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <FileText
            size={42}
            className="mx-auto mb-4 text-gray-300"
          />
          <h3 className="font-bold text-gray-800">
            Pilih Siswa untuk Melihat Laporan
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Gunakan pilihan kelas dan siswa di atas untuk
            menampilkan laporan lengkap.
          </p>
        </div>
      ) : !latestResult ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <AlertCircle
            size={28}
            className="mx-auto mb-3 text-amber-600"
          />
          <h3 className="font-bold text-amber-900">
            Hasil Asesmen Belum Tersedia
          </h3>
          <p className="mt-2 text-sm text-amber-800">
            {selectedStudent.name} belum mempunyai hasil tes
            RIASEC yang dapat ditampilkan.
          </p>
        </div>
      ) : (
        <div
          id="care-laporan-cetak"
          className="mx-auto max-w-4xl space-y-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10"
        >
          {/* KOP LAPORAN */}
          <div className="border-b-2 border-blue-800 pb-5 text-center">
            <p className="text-sm font-bold tracking-[0.2em] text-blue-800">
              CARE INDONESIA
            </p>

            <h2 className="mt-2 text-xl font-extrabold text-gray-900 md:text-2xl">
              LAPORAN HASIL ASESMEN MINAT KARIER
            </h2>

            <p className="mt-2 text-sm font-semibold text-gray-600">
              Berdasarkan Teori Holland (RIASEC)
            </p>

            <p className="mt-3 text-sm font-medium text-gray-700">
              {school?.name || "Nama sekolah belum diisi"}
            </p>
          </div>

          {/* IDENTITAS */}
          <section className="print-avoid-break">
            <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-base font-bold text-blue-900">
              <UserRound size={18} />
              A. Identitas Peserta
            </h3>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <InfoItem
                label="Nama Lengkap"
                value={selectedStudent.name}
              />
              <InfoItem
                label="NIS"
                value={selectedStudent.nis}
              />
              <InfoItem
                label="Kelas"
                value={selectedStudent.className}
              />
              <InfoItem
                label="Jenis Kelamin"
                value={
                  selectedStudent.gender === "L"
                    ? "Laki-laki"
                    : selectedStudent.gender === "P"
                    ? "Perempuan"
                    : "—"
                }
              />
              <InfoItem
                label="Sekolah"
                value={school?.name || "—"}
              />
              <InfoItem
                label="Tanggal Asesmen"
                value={formatDate(latestResult.date)}
              />
            </div>
          </section>

          {/* RINGKASAN */}
          <section className="print-avoid-break">
            <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-base font-bold text-blue-900">
              <GraduationCap size={18} />
              B. Ringkasan Hasil Asesmen
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-semibold text-blue-700">
                  Kode Holland RIASEC
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-widest text-blue-900">
                  {dominantCode}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs font-semibold text-gray-500">
                  Tingkat Konsistensi
                </p>
                <p className="mt-2 text-2xl font-extrabold text-gray-900">
                  {latestResult.consistency || "—"}
                </p>
              </div>
            </div>
          </section>

          {/* SKOR */}
          <section className="print-avoid-break">
            <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-base font-bold text-blue-900">
              <ChartColumnIncreasing size={18} />
              C. Skor, Peringkat dan Posisi RIASEC
            </h3>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Tipe</th>
                    <th className="px-4 py-3 text-left">Skor</th>
                    <th className="px-4 py-3 text-center">
                      Peringkat
                    </th>
                    <th className="px-4 py-3 text-left">Posisi</th>
                  </tr>
                </thead>

                <tbody>
                  {ranking.map((item) => (
                    <tr
                      key={item.code}
                      className="border-b border-gray-100"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {item.code} - {item.name}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex min-w-24 items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`print-bar h-full rounded-full ${
                                SCORE_COLORS[item.code]
                              }`}
                              style={{
                                width: `${
                                  (item.score / maximumScore) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="w-8 text-right font-bold">
                            {item.score}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center font-semibold">
                        {item.rank}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {item.position}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* INTERPRETASI */}
          <section className="print-avoid-break">
            <h3 className="mb-4 border-b pb-2 text-base font-bold text-blue-900">
              D. Interpretasi Tiga Tipe Dominan
            </h3>

            <p className="mb-4 text-sm leading-7 text-gray-700">
              Hasil asesmen menunjukkan kombinasi minat karier
              peserta berdasarkan enam tipe kepribadian kerja
              Holland. Tiga tipe dominan digunakan sebagai
              dasar awal untuk mengeksplorasi lingkungan
              pekerjaan dan kegiatan yang sesuai dengan minat.
            </p>

            <div className="grid gap-3">
              {[...ranking]
                .filter((item) => item.position !== "—")
                .sort((a, b) =>
                  a.position.localeCompare(b.position)
                )
                .map((item) => (
                  <div
                    key={item.code}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <p className="font-bold text-blue-900">
                      {item.position}: {item.name} ({item.code})
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Skor: {item.score}
                    </p>
                  </div>
                ))}
            </div>
          </section>

          {/* PENUTUP */}
          <section className="print-avoid-break border-t pt-5">
            <h3 className="mb-3 text-base font-bold text-blue-900">
              E. Catatan Penggunaan Hasil
            </h3>

            <p className="text-sm leading-7 text-gray-700">
              Laporan ini merupakan bahan eksplorasi minat
              karier, bukan penetapan mutlak kemampuan,
              kepribadian, atau pilihan pekerjaan peserta.
              Hasil sebaiknya didiskusikan bersama guru
              bimbingan dan konseling serta dipertimbangkan
              dengan kemampuan, pengalaman, dan tujuan
              pendidikan peserta.
            </p>
          </section>

          <div className="border-t pt-4 text-center text-xs text-gray-400">
            CARE Indonesia — Asesmen Minat Karier Holland RIASEC
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
      <span className="text-xs font-medium text-gray-500">
        {label}
      </span>
      <span className="font-semibold text-gray-900">
        {value || "—"}
      </span>
    </div>
  );
}
