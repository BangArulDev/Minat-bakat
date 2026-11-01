"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Printer,
  RefreshCw,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getStudents,
  getClassrooms,
  getSchoolProfile,
  getDetailedResults,
} from "@/app/actions/guru";

import RiasecStudentReport from "@/components/riasec/RiasecStudentReport";

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
          setClassrooms(classesResponse.data || []);
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

  const handlePrint = () => {
    if (!selectedStudent || !latestResult) return;
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <FileText size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Laporan Lengkap Siswa
              </h1>
              <p className="text-sm text-gray-500">
                Laporan asesmen minat karier individual siswa sesuai teori Holland (RIASEC)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-xs"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Perbarui
          </button>

          {latestResult && (
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md transition-colors"
            >
              <Printer size={18} />
              Cetak Laporan
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SELECTOR */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs print:hidden">
        <div className="mb-4 flex items-center gap-2">
          <Search size={19} className="text-blue-600" />
          <h2 className="font-bold text-gray-900 text-sm">
            Pilih Siswa untuk Melihat Laporan
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Filter Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(event) => {
                setSelectedClass(event.target.value);
                setSelectedStudentId("");
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              <option value="">Semua Kelas</option>
              {classrooms.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Cari Nama / NIS
            </label>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedStudentId("");
              }}
              placeholder="Ketik nama atau NIS siswa..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Pilih Siswa
            </label>
            <select
              value={selectedStudentId}
              onChange={(event) =>
                setSelectedStudentId(event.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              <option value="">-- Pilih Siswa --</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nis ? `${student.nis} - ` : ""}{student.name} ({student.className})
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
        <div className="flex min-h-64 items-center justify-center gap-3 rounded-2xl border bg-white text-gray-500">
          <Loader2 size={23} className="animate-spin text-blue-600" />
          Memuat data laporan siswa...
        </div>
      ) : !selectedStudent ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center shadow-xs">
          <FileText
            size={48}
            className="mx-auto mb-4 text-gray-300"
          />
          <h3 className="font-bold text-gray-800 text-lg">
            Pilih Siswa untuk Melihat Laporan
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Gunakan filter kelas dan pilihan siswa di atas untuk menampilkan hasil laporan asesmen RIASEC yang identik dengan tampilan di dashboard siswa.
          </p>
        </div>
      ) : !latestResult ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-xs">
          <AlertCircle
            size={36}
            className="mx-auto mb-3 text-amber-600"
          />
          <h3 className="font-bold text-amber-900 text-lg">
            Hasil Asesmen Belum Tersedia
          </h3>
          <p className="mt-2 text-sm text-amber-800">
            Siswa <strong>{selectedStudent.name}</strong> belum menyelesaikan tes asesmen RIASEC.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-10 shadow-xs">
          <RiasecStudentReport
            identity={{
              name: selectedStudent.name,
              nis: selectedStudent.nis,
              gender: selectedStudent.gender,
              className: selectedStudent.className,
              schoolName: school?.name,
            }}
            rawScores={latestResult.rawScores}
            date={latestResult.date}
            dominantCode={latestResult.dominantCode}
            consistency={latestResult.consistency}
            title="Laporan Lengkap Asesmen Siswa"
            subtitle={`Laporan individual peserta didik: ${selectedStudent.name}`}
          />
        </div>
      )}
    </div>
  );
}
