
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  getClassrooms,
  getTabulasiAnswers,
} from "@/app/actions/guru";

// ============================================
// KONFIGURASI TABULASI
// ============================================

const TOTAL_QUESTIONS = 216;
const TOTAL_ESTIMATES = 12;

export default function TabulasiPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [students, setStudents] = useState([]);
  const [questionIds, setQuestionIds] = useState([]);
  const [estimateIds, setEstimateIds] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // MENGAMBIL DATA DARI DATABASE
  // ============================================

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [classRes, tabRes] = await Promise.all([
        getClassrooms(),
        getTabulasiAnswers(),
      ]);

      if (!classRes?.success) {
        throw new Error(
          classRes?.error || "Gagal memuat kelas."
        );
      }

      if (!tabRes?.success) {
        throw new Error(
          tabRes?.error || "Gagal memuat tabulasi."
        );
      }

      const classData = classRes.data || [];
      const tabData = tabRes.data || {};

      setClasses(classData);
      setStudents(tabData.students || []);

      setQuestionIds(tabData.questionIds || []);
      setEstimateIds(tabData.estimateIds || []);

      setSelectedClass((previous) => {
        const exists = classData.some(
          (item) => item.id === previous
        );

        return exists
          ? previous
          : classData[0]?.id || "";
      });
    } catch (err) {
      console.error("Error tabulasi:", err);
      setError(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // FILTER DATA BERDASARKAN KELAS DAN NAMA
  // ============================================

  const filteredStudents = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return students.filter((student) => {
      const sameClass =
        student.classId === selectedClass;

      const nameMatch = String(
        student.name || ""
      ).toLowerCase().includes(keyword);

      const nisMatch = String(
        student.nis || ""
      ).toLowerCase().includes(keyword);

      return sameClass && (nameMatch || nisMatch);
    });
  }, [students, selectedClass, search]);

  const selectedClassName =
    classes.find((item) => item.id === selectedClass)
      ?.name || "Kelas";

  // ============================================
  // VALIDASI INSTRUMEN
  // ============================================

  const instrumentReady =
    questionIds.length === TOTAL_QUESTIONS &&
    estimateIds.length === TOTAL_ESTIMATES;

  // ============================================
  // CEK KETERSEDIAAN JAWABAN
  // ============================================

  const hasAnswers = (student) => {
    return (
      student.answers !== null &&
      student.answers !== undefined &&
      student.selfEstimates !== null &&
      student.selfEstimates !== undefined
    );
  };

  const studentsWithAnswers =
    filteredStudents.filter(hasAnswers).length;

  const studentsWithoutAnswers =
    filteredStudents.length - studentsWithAnswers;

  // ============================================
  // FORMAT JAWABAN SOAL 1-216
  // ============================================

  const formatAnswer = (student, questionId) => {
    if (!student.answers) {
      return "—";
    }

    const value =
      student.answers[String(questionId)];

    // YA = 1
    if (value === 1 || value === true) {
      return 1;
    }

    // TIDAK = KOSONG
    if (value === 0 || value === false) {
      return "";
    }

    // JAWABAN TIDAK TERSEDIA
    return "—";
  };

  // ============================================
  // FORMAT SELF-ESTIMATE 1-12
  // ============================================

  const formatEstimate = (student, estimateId) => {
    if (!student.selfEstimates) {
      return "—";
    }

    const value =
      student.selfEstimates[String(estimateId)];

    if (
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 7
    ) {
      return value;
    }

    return "—";
  };

  // ============================================
  // MEMBUAT FILE EXCEL XLSX
  // ============================================

  const downloadExcel = async () => {
    if (
      !instrumentReady ||
      filteredStudents.length === 0 ||
      downloading
    ) {
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const ExcelJS = (
        await import("exceljs")
      ).default;

      const workbook = new ExcelJS.Workbook();

      workbook.creator = "CARE Indonesia";
      workbook.title = "Tabulasi Jawaban RIASEC";
      workbook.subject = "Asesmen Minat Karier Holland";

      const sheet = workbook.addWorksheet(
        "Tabulasi Data"
      );

      // HEADER EXCEL
      const headers = [
        "No",
        "NIS",
        "Nama Siswa",
        ...questionIds.map((_, index) => index + 1),
        ...estimateIds.map(
          (_, index) => `SE ${index + 1}`
        ),
      ];

      sheet.addRow(headers);

      // ISI EXCEL
      filteredStudents.forEach((student, index) => {
        const rowData = [
          index + 1,
          String(student.nis || ""),
          student.name || "",

          // Jawaban 216 soal
          ...questionIds.map((id) =>
            formatAnswer(student, id)
          ),

          // Nilai 12 Self-Estimate
          ...estimateIds.map((id) =>
            formatEstimate(student, id)
          ),
        ];

        sheet.addRow(rowData);
      });

      // ============================================
      // FORMAT HEADER
      // ============================================

      const headerRow = sheet.getRow(1);

      headerRow.height = 30;

      headerRow.font = {
        bold: true,
        color: {
          argb: "FFFFFFFF",
        },
      };

      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FF2563EB",
        },
      };

      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      // UKURAN KOLOM
      sheet.getColumn(1).width = 7;
      sheet.getColumn(2).width = 21;
      sheet.getColumn(3).width = 32;

      for (
        let col = 4;
        col <= headers.length;
        col++
      ) {
        sheet.getColumn(col).width = 9;
      }

      // NIS SEBAGAI TEKS
      sheet.getColumn(2).numFmt = "@";

      // HEADER DAN IDENTITAS TETAP TERLIHAT
      sheet.views = [
        {
          state: "frozen",
          xSplit: 3,
          ySplit: 1,
        },
      ];

      // FILTER EXCEL
      sheet.autoFilter = {
        from: {
          row: 1,
          column: 1,
        },
        to: {
          row: 1,
          column: headers.length,
        },
      };

      // BORDER DAN ALIGNMENT
      for (
        let rowIndex = 2;
        rowIndex <= sheet.rowCount;
        rowIndex++
      ) {
        const row = sheet.getRow(rowIndex);

        row.alignment = {
          vertical: "middle",
        };

        row.getCell(2).numFmt = "@";

        for (
          let colIndex = 4;
          colIndex <= headers.length;
          colIndex++
        ) {
          row.getCell(colIndex).alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        }
      }

      // ============================================
      // GENERATE FILE
      // ============================================

      const buffer =
        await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      const safeClassName =
        selectedClassName.replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

      link.href = url;
      link.download =
        `Tabulasi_RIASEC_${safeClassName}.xlsx`;

      document.body.appendChild(link);

      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error("Download error:", err);

      setError(
        "Gagal mengunduh Excel: " +
        (err.message || "Unknown error")
      );
    } finally {
      setDownloading(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="min-h-[350px] flex flex-col items-center justify-center gap-3">
        <Loader2
          size={30}
          className="animate-spin text-blue-600"
        />

        <p className="text-gray-500 text-sm">
          Memuat data tabulasi siswa...
        </p>
      </div>
    );
  }

  // ============================================
  // TAMPILAN HALAMAN
  // ============================================

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tabulasi Data
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Rekapitulasi jawaban asesmen minat karier
            berdasarkan nomor soal.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={loadData}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            type="button"
            onClick={downloadExcel}
            disabled={
              downloading ||
              filteredStudents.length === 0 ||
              !instrumentReady
            }
            className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            {downloading ? (
              <Loader2
                size={19}
                className="animate-spin"
              />
            ) : (
              <Download size={19} />
            )}

            {downloading
              ? "Menyiapkan Excel..."
              : "Download Tabulasi Data"}
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">

        {/* PILIH KELAS */}
        <div className="relative w-full md:w-56">
          <Filter
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />

          <select
            value={selectedClass}
            onChange={(e) =>
              setSelectedClass(e.target.value)
            }
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {classes.length === 0 && (
              <option value="">
                Belum ada kelas
              </option>
            )}

            {classes.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* JENIS INSTRUMEN */}
        <div className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 rounded-xl text-blue-700 text-sm font-semibold">
          <FileSpreadsheet size={18} />
          Holland RIASEC
        </div>

        {/* CARI SISWA */}
        <div className="relative w-full flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Cari nama atau NIS siswa..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* PESAN ERROR */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <AlertCircle
            size={19}
            className="shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {/* PERINGATAN INSTRUMEN */}
      {!instrumentReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Jumlah instrumen di database belum sesuai.
          Ditemukan {questionIds.length} soal utama
          dan {estimateIds.length} Self-Estimate.
          Seharusnya terdapat 216 soal utama dan
          12 Self-Estimate.
        </div>
      )}

      {/* RINGKASAN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Hasil Siswa
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {filteredStudents.length}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Berdasarkan kelas terpilih
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Soal Utama
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {questionIds.length}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Jawaban Ya atau Tidak
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Self-Estimate
          </p>

          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {estimateIds.length}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Nilai 1 sampai 7
          </p>
        </div>
      </div>

      {/* MATRIKS TABULASI */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-bold text-gray-900">
              Matriks Jawaban Siswa
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Ya = 1 | Tidak = kosong |
              Self-Estimate = 1–7
            </p>
          </div>

          <span className="text-sm font-medium text-gray-500">
            {filteredStudents.length} hasil siswa
          </span>
        </div>

        {/* KETERANGAN DATA LAMA */}
        {studentsWithoutAnswers > 0 && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="shrink-0"
            />

            <span>
              {studentsWithoutAnswers} siswa memiliki
              hasil tes tanpa jawaban lengkap yang tersimpan.
              Tanda — berarti jawaban tidak tersedia,
              bukan jawaban Tidak.
            </span>
          </div>
        )}

        {/* TABEL HORIZONTAL */}
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-max min-w-full border-collapse whitespace-nowrap text-sm">

            <thead>
              <tr className="bg-blue-50 text-gray-700">

                <th className="sticky left-0 z-20 bg-blue-50 border-r border-b border-gray-200 px-3 py-4 min-w-[52px] text-center">
                  No
                </th>

                <th className="sticky left-[52px] z-20 bg-blue-50 border-r border-b border-gray-200 px-4 py-4 min-w-[200px] text-left">
                  Nama / NIS
                </th>

                {/* NOMOR SOAL 1-216 */}
                {questionIds.map((id, index) => (
                  <th
                    key={`q-head-${id}`}
                    title={`Soal nomor ${index + 1}`}
                    className="border-r border-b border-gray-200 px-3 py-4 min-w-[48px] text-center"
                  >
                    {index + 1}
                  </th>
                ))}

                {/* SELF-ESTIMATE 1-12 */}
                {estimateIds.map((id, index) => (
                  <th
                    key={`se-head-${id}`}
                    className="bg-indigo-50 border-r border-b border-gray-200 px-3 py-4 min-w-[60px] text-center"
                  >
                    SE {index + 1}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map(
                (student, index) => (
                  <tr
                    key={student.id}
                    className="group hover:bg-blue-50/40"
                  >

                    {/* NOMOR URUT */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50 border-r border-b border-gray-100 px-3 py-3 text-center">
                      {index + 1}
                    </td>

                    {/* IDENTITAS */}
                    <td className="sticky left-[52px] z-10 bg-white group-hover:bg-blue-50 border-r border-b border-gray-100 px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {student.name}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {student.nis}
                      </p>

                      {!hasAnswers(student) && (
                        <p className="text-xs text-amber-600 mt-1">
                          Jawaban lama tidak tersedia
                        </p>
                      )}
                    </td>

                    {/* JAWABAN 216 SOAL */}
                    {questionIds.map((id) => (
                      <td
                        key={`answer-${id}`}
                        className="border-r border-b border-gray-100 px-3 py-3 min-w-[48px] text-center text-gray-800"
                      >
                        {formatAnswer(student, id)}
                      </td>
                    ))}

                    {/* JAWABAN 12 SELF-ESTIMATE */}
                    {estimateIds.map((id) => (
                      <td
                        key={`estimate-${id}`}
                        className="bg-indigo-50/40 border-r border-b border-gray-100 px-3 py-3 min-w-[60px] text-center font-semibold text-indigo-700"
                      >
                        {formatEstimate(student, id)}
                      </td>
                    ))}
                  </tr>
                )
              )}

              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      2 +
                      questionIds.length +
                      estimateIds.length
                    }
                    className="py-16 px-6 text-center text-gray-500"
                  >
                    Belum ada hasil tes siswa
                    untuk kelas atau pencarian ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
          <span>
            Geser tabel ke kanan untuk melihat seluruh 228 jawaban.
          </span>

          <span>
            {studentsWithAnswers} hasil dengan jawaban lengkap
          </span>
        </div>
      </div>
    </div>
  );
}
