
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  User,
  Calendar,
  Key,
  X,
  Save,
  AlertTriangle,
  Hash,
  School,
  MapPin,
  Download,
  Upload,
  FileSpreadsheet,
  Loader2,
  Info,
} from "lucide-react";

import {
  getStudents,
  saveStudent,
  deleteStudent,
  getClassrooms,
  importStudentsExcel,
} from "@/app/actions/guru";

// ============================================
// HELPER FORMAT
// ============================================

const cleanText = (value) => String(value ?? "").trim();

const initialForm = {
  id: "",
  nis: "",
  name: "",
  pob: "",
  dob: "",
  gender: "L",
  className: "",
};

const EXCEL_HEADERS = [
  "NIS",
  "Nama Lengkap",
  "Kelas",
  "Username",
  "Password Awal",
  "Jenis Kelamin",
];

// Impor ExcelJS hanya ketika dibutuhkan.
async function createWorkbook() {
  const module = await import("exceljs");
  const ExcelJS = module.default || module;
  return new ExcelJS.Workbook();
}

function setupWorksheet(worksheet) {
  worksheet.columns = [
    { header: "NIS", key: "nis", width: 22 },
    { header: "Nama Lengkap", key: "name", width: 35 },
    { header: "Kelas", key: "className", width: 24 },
    { header: "Username", key: "username", width: 22 },
    { header: "Password Awal", key: "password", width: 22 },
    { header: "Jenis Kelamin", key: "gender", width: 19 },
  ];

  const header = worksheet.getRow(1);
  header.height = 29;

  header.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  });

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  worksheet.autoFilter = "A1:F1";

  // NIS, username dan password disimpan sebagai teks,
  // supaya angka nol di awal tidak hilang.
  ["A", "D", "E"].forEach((column) => {
    worksheet.getColumn(column).numFmt = "@";
  });
}

function saveWorkbookBuffer(buffer, filename) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function cellToText(cell) {
  const value = cell?.value;

  if (value == null) return "";

  if (typeof value === "object") {
    if ("result" in value) {
      return cleanText(value.result);
    }

    if ("text" in value) {
      return cleanText(value.text);
    }

    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("").trim();
    }
  }

  return cleanText(value);
}

function normalizeGender(value) {
  const raw = cleanText(value).toUpperCase();

  if (raw === "LAKI-LAKI" || raw === "LAKI LAKI") {
    return "L";
  }

  if (raw === "PEREMPUAN") {
    return "P";
  }

  return raw;
}

// ============================================
// HALAMAN DATA SISWA
// ============================================

export default function SiswaPage() {
  const [data, setData] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [itemToDelete, setItemToDelete] = useState(null);

  const fileInputRef = useRef(null);

  // ============================================
  // AMBIL DATA SISWA DAN KELAS
  // ============================================

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [studentsRes, classesRes] = await Promise.all([
        getStudents(),
        getClassrooms(),
      ]);

      if (studentsRes?.success) {
        setData(studentsRes.data || []);
      } else {
        setError(
          studentsRes?.error || "Gagal mengambil data siswa."
        );
      }

      if (classesRes?.success) {
        setClassOptions(classesRes.data || []);
      } else {
        setError(
          classesRes?.error || "Gagal mengambil data kelas."
        );
      }
    } catch (err) {
      console.error("Load students error:", err);
      setError("Terjadi kesalahan saat mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setNotice("");
    setError("");
    setOpenDropdownId(null);
    await loadData();
  };

  // ============================================
  // FORM TAMBAH SISWA
  // ============================================

  const handleAddClick = () => {
    setIsEditMode(false);

    setFormData({
      ...initialForm,
      className: classOptions[0]?.name || "",
    });

    setOpenDropdownId(null);
    setIsModalOpen(true);
  };

  // ============================================
  // FORM EDIT SISWA
  // ============================================

  const handleEditClick = (item) => {
    setIsEditMode(true);

    setFormData({
      id: item.id,
      nis: item.nis || "",
      name: item.name || "",
      pob: item.pob || "",
      dob: item.dob || "",
      gender: item.gender || "L",
      className: item.className || "",
    });

    setOpenDropdownId(null);
    setIsModalOpen(true);
  };

  // ============================================
  // SIMPAN SISWA
  // ============================================

  const handleSaveData = async () => {
    if (isSaving) return;

    if (!cleanText(formData.nis)) {
      alert("NIS wajib diisi.");
      return;
    }

    if (!cleanText(formData.name)) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    if (!formData.className) {
      alert("Silakan pilih kelas.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveStudent({
        ...formData,
        nis: cleanText(formData.nis),
        name: cleanText(formData.name),
      });

      if (!result?.success) {
        throw new Error(
          result?.error || "Gagal menyimpan data siswa."
        );
      }

      setIsModalOpen(false);
      setNotice(
        result.message || "Data siswa berhasil disimpan."
      );
      setError("");

      await loadData();
    } catch (err) {
      alert(err.message || "Gagal menyimpan data siswa.");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // HAPUS SISWA
  // ============================================

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setOpenDropdownId(null);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || isSaving) return;

    setIsSaving(true);

    try {
      const result = await deleteStudent(itemToDelete.id);

      if (!result?.success) {
        throw new Error(
          result?.error || "Gagal menghapus siswa."
        );
      }

      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setNotice("Data siswa berhasil dihapus.");
      setError("");

      await loadData();
    } catch (err) {
      alert(err.message || "Gagal menghapus siswa.");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // DOWNLOAD TEMPLATE EXCEL
  // ============================================

  const handleDownloadTemplate = async () => {
    setError("");

    try {
      const workbook = await createWorkbook();

      const worksheet = workbook.addWorksheet("Data Siswa");

      setupWorksheet(worksheet);

      // Kolom disediakan kosong agar guru mengisi
      // data siswa sendiri, tanpa akun contoh.
      for (let index = 2; index <= 101; index++) {
        const row = worksheet.getRow(index);

        row.getCell(1).numFmt = "@";
        row.getCell(4).numFmt = "@";
        row.getCell(5).numFmt = "@";
      }

      // Petunjuk di sheet terpisah.
      const instructions = workbook.addWorksheet("Petunjuk");

      instructions.columns = [
        { width: 27 },
        { width: 80 },
      ];

      const rows = [
        ["Kolom", "Petunjuk Pengisian"],
        ["NIS", "Wajib. Isi sesuai NIS siswa. Format teks."],
        ["Nama Lengkap", "Wajib. Nama lengkap siswa."],
        ["Kelas", "Wajib. Harus sama dengan nama kelas yang sudah dibuat pada Panel Guru."],
        ["Username", "Opsional. Kosongkan, karena sistem otomatis menggunakan NIS."],
        ["Password Awal", "Opsional. Kosongkan, karena sistem otomatis menggunakan NIS."],
        ["Jenis Kelamin", "Wajib. Isi L untuk laki-laki atau P untuk perempuan."],
        ["Batas Impor", "Maksimal 200 siswa per proses."],
        ["Keamanan", "Password awal sama dengan NIS dan harus diganti setelah login pertama ketika fitur penggantian password sudah tersedia."],
        ["Catatan", "Jangan mengubah nama kolom atau urutan kolom pada sheet Data Siswa."],
      ];

      instructions.addRows(rows);
      instructions.getRow(1).font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();

      saveWorkbookBuffer(
        buffer,
        "Template_Import_Siswa_CARE_Indonesia.xlsx"
      );

      setNotice("Template Excel berhasil disiapkan.");
    } catch (err) {
      console.error("Download template error:", err);
      setError("Gagal membuat template Excel.");
    }
  };

  // ============================================
  // IMPORT EXCEL
  // ============================================

  const handleImportClick = () => {
    if (isImporting) return;

    if (classOptions.length === 0) {
      alert(
        "Buat kelas terlebih dahulu pada menu Data Master → Kelas."
      );
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];

    // Izinkan memilih file yang sama di percobaan berikutnya.
    event.target.value = "";

    if (!file) return;

    const filename = file.name.toLowerCase();

    if (!filename.endsWith(".xlsx")) {
      alert("Gunakan file Excel dengan format .xlsx.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5 MB.");
      return;
    }

    setIsImporting(true);
    setError("");
    setNotice("");

    try {
      const workbook = await createWorkbook();

      const buffer = await file.arrayBuffer();

      await workbook.xlsx.load(buffer);

      const worksheet =
        workbook.getWorksheet("Data Siswa") ||
        workbook.worksheets[0];

      if (!worksheet) {
        throw new Error("Sheet Data Siswa tidak ditemukan.");
      }

      // Pemeriksaan header template.
      const headers = EXCEL_HEADERS.map((_, index) =>
        cellToText(worksheet.getRow(1).getCell(index + 1))
      );

      const validHeaders = EXCEL_HEADERS.every(
        (header, index) =>
          headers[index].toLowerCase() ===
          header.toLowerCase()
      );

      if (!validHeaders) {
        throw new Error(
          "Format kolom Excel tidak sesuai template. " +
          "Silakan gunakan template yang disediakan."
        );
      }

      const rows = [];
      const invalidRows = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const nis = cellToText(row.getCell(1));
        const name = cellToText(row.getCell(2));
        const className = cellToText(row.getCell(3));

        const username = cellToText(row.getCell(4));
        const password = cellToText(row.getCell(5));

        const gender = normalizeGender(
          cellToText(row.getCell(6))
        );

        const hasData =
          nis ||
          name ||
          className ||
          username ||
          password ||
          gender;

        if (!hasData) return;

        if (!nis || !name || !className) {
          invalidRows.push(
            `Baris ${rowNumber}: NIS, nama dan kelas wajib diisi.`
          );
          return;
        }

        if (username && username !== nis) {
          invalidRows.push(
            `Baris ${rowNumber}: Username harus sama dengan NIS atau kosong.`
          );
          return;
        }

        if (password && password !== nis) {
          invalidRows.push(
            `Baris ${rowNumber}: Password awal harus sama dengan NIS atau kosong.`
          );
          return;
        }

        if (gender !== "L" && gender !== "P") {
          invalidRows.push(
            `Baris ${rowNumber}: Jenis Kelamin harus L atau P.`
          );
          return;
        }

        rows.push({
          nis,
          name,
          className,
          gender,
        });
      });

      if (invalidRows.length > 0) {
        throw new Error(
          invalidRows.slice(0, 5).join("\n") +
          (invalidRows.length > 5
            ? `\nDan ${invalidRows.length - 5} kesalahan lainnya.`
            : "")
        );
      }

      if (rows.length === 0) {
        throw new Error(
          "Tidak ada data siswa dalam file Excel."
        );
      }

      if (rows.length > 200) {
        throw new Error(
          "Maksimal 200 siswa per impor."
        );
      }

      const confirmed = window.confirm(
        `Anda akan mengimpor ${rows.length} siswa.\n\n` +
        "Username = NIS\n" +
        "Password awal = NIS\n\n" +
        "Kuota guru akan berkurang sesuai jumlah siswa.\n\n" +
        "Lanjutkan?"
      );

      if (!confirmed) return;

      const result = await importStudentsExcel(rows);

      if (!result?.success) {
        throw new Error(
          result?.error || "Gagal mengimpor siswa."
        );
      }

      setNotice(
        result.message ||
        `${rows.length} siswa berhasil diimpor.`
      );

      await loadData();
    } catch (err) {
      console.error("Import Excel error:", err);

      setError(
        err.message || "Gagal membaca atau mengimpor Excel."
      );
    } finally {
      setIsImporting(false);
    }
  };

  // ============================================
  // EXPORT EXCEL DATA SISWA
  // ============================================

  const handleExportExcel = async () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data siswa untuk diekspor.");
      return;
    }

    setIsExporting(true);
    setError("");

    try {
      const workbook = await createWorkbook();

      const worksheet = workbook.addWorksheet("Data Siswa");

      setupWorksheet(worksheet);

      filteredData.forEach((student) => {
        // Password tidak ikut diekspor,
        // karena password awal mungkin telah diganti.
        const row = worksheet.addRow({
          nis: cleanText(student.nis),
          name: cleanText(student.name),
          className: cleanText(student.className),
          username: cleanText(student.username),
          password: "",
          gender: cleanText(student.gender),
        });

        row.getCell(1).numFmt = "@";
        row.getCell(4).numFmt = "@";
      });

      const info = workbook.addWorksheet("Informasi");

      info.columns = [
        { width: 28 },
        { width: 75 },
      ];

      info.addRows([
        ["Laporan", "Daftar Siswa CARE Indonesia"],
        ["Jumlah Siswa", filteredData.length],
        ["Kelas", filterClass || "Semua Kelas"],
        ["Password", "Tidak diekspor untuk melindungi keamanan akun."],
        ["Catatan", "Username akun baru menggunakan NIS."],
      ]);

      info.getRow(1).font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();

      saveWorkbookBuffer(
        buffer,
        "Data_Siswa_CARE_Indonesia.xlsx"
      );

      setNotice(
        `${filteredData.length} data siswa berhasil diekspor.`
      );
    } catch (err) {
      console.error("Export Excel error:", err);
      setError("Gagal mengekspor data siswa.");
    } finally {
      setIsExporting(false);
    }
  };

  // ============================================
  // FILTER DAN PENCARIAN
  // ============================================

  const filteredData = data.filter((item) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      cleanText(item.name).toLowerCase().includes(keyword) ||
      cleanText(item.nis).toLowerCase().includes(keyword) ||
      cleanText(item.username).toLowerCase().includes(keyword);

    const matchClass = filterClass
      ? item.className === filterClass
      : true;

    return matchSearch && matchClass;
  });

  const uniqueClasses = [
    ...new Set(
      data
        .map((item) => item.className)
        .filter(Boolean)
    ),
  ].sort();

  // ============================================
  // RENDER HALAMAN
  // ============================================

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* HEADER */}

      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Data Siswa
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Kelola data siswa, akun login, kelas,
            serta impor dan ekspor Excel.
          </p>
        </div>

        {/* TOMBOL AKSI */}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-blue-200 text-blue-700 font-medium rounded-xl hover:bg-blue-50 transition"
          >
            <Download size={18} />
            Download Template
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            disabled={isImporting || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {isImporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {isImporting ? "Mengimpor..." : "Import Excel"}
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {isExporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={18} />
            )}
            {isExporting ? "Mengekspor..." : "Export Excel"}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Muat ulang"
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={20}
              className={isLoading ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={handleAddClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-200"
          >
            <Plus size={20} />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* INPUT FILE TERSEMBUNYI */}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleImportFile}
        className="hidden"
      />

      {/* INFORMASI LOGIN */}

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <Info
          size={20}
          className="text-blue-600 shrink-0 mt-0.5"
        />

        <div className="text-sm text-blue-900">
          <p className="font-bold">
            Akun Login Siswa Otomatis
          </p>

          <p className="mt-1">
            Setiap siswa baru mendapatkan username dan
            password awal menggunakan NIS. Siswa yang telah
            dibuat dapat login tanpa mendaftar secara manual.
            Berikan kredensial awal secara privat kepada siswa.
          </p>
        </div>
      </div>

      {/* NOTIFIKASI */}

      {notice && (
        <div className="flex items-start justify-between gap-3 p-4 bg-green-50 text-green-800 border border-green-200 rounded-xl text-sm">
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Tutup notifikasi"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm whitespace-pre-line">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Tutup kesalahan"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* FILTER */}

      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="w-full md:w-64 relative">
          <Filter
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Semua Kelas</option>

            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Cari nama siswa, NIS, atau username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* TABEL DATA SISWA */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "No",
                  "NIS",
                  "Nama Siswa",
                  "TTL",
                  "L/P",
                  "Kelas",
                  "Login (Username)",
                  "Opsi",
                ].map((label) => (
                  <th
                    key={label}
                    className="py-4 px-5 font-semibold text-sm text-gray-500 whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-500"
                  >
                    <Loader2
                      size={26}
                      className="animate-spin mx-auto mb-2"
                    />
                    Memuat data siswa...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-500"
                  >
                    <User
                      size={32}
                      className="mx-auto mb-2 text-gray-300"
                    />
                    Data siswa tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/50 transition"
                  >
                    <td className="py-4 px-5 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                        {item.nis}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-sm font-bold text-gray-900 whitespace-nowrap">
                      {item.name}
                    </td>

                    <td className="py-4 px-5 text-sm text-gray-500">
                      <div className="whitespace-nowrap">
                        {item.pob || "—"}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Calendar size={11} />
                        {item.dob || "—"}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-sm">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                          item.gender === "L"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-pink-100 text-pink-600"
                        }`}
                      >
                        {item.gender}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-sm font-medium text-gray-700 whitespace-nowrap">
                      {item.className}
                    </td>

                    <td className="py-4 px-5">
                      <div className="inline-flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Key
                          size={14}
                          className="text-gray-400"
                        />

                        <span className="font-mono font-bold text-sm">
                          {item.username}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="relative">
                        <button
                          type="button"
                          aria-label={`Opsi siswa ${item.name}`}
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === item.id
                                ? null
                                : item.id
                            )
                          }
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openDropdownId === item.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                handleEditClick(item)
                              }
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
                            >
                              <Edit size={16} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteClick(item)
                              }
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t"
                            >
                              <Trash2 size={16} />
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Menampilkan{" "}
            <span className="font-bold text-gray-900">
              {filteredData.length}
            </span>{" "}
            dari{" "}
            <span className="font-bold text-gray-900">
              {data.length}
            </span>{" "}
            siswa
          </p>
        </div>
      </div>

      {/* ============================================
          MODAL TAMBAH / EDIT SISWA
      ============================================ */}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                {isEditMode ? (
                  <Edit
                    size={20}
                    className="text-orange-600"
                  />
                ) : (
                  <Plus
                    size={20}
                    className="text-blue-600"
                  />
                )}

                {isEditMode
                  ? "Edit Data Siswa"
                  : "Tambah Siswa Baru"}
              </h3>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* NIS */}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Hash size={14} />
                    NIS
                  </label>

                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nis: e.target.value,
                      })
                    }
                    placeholder="Masukkan NIS siswa"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>

                {/* NAMA */}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <User size={14} />
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* TEMPAT LAHIR */}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <MapPin size={14} />
                    Tempat Lahir (Opsional)
                  </label>

                  <input
                    type="text"
                    value={formData.pob}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pob: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* TANGGAL LAHIR */}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Calendar size={14} />
                    Tanggal Lahir (Opsional)
                  </label>

                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dob: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* JENIS KELAMIN */}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Jenis Kelamin
                  </label>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === "L"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            gender: "L",
                          })
                        }
                      />
                      Laki-laki
                    </label>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === "P"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            gender: "P",
                          })
                        }
                      />
                      Perempuan
                    </label>
                  </div>
                </div>

                {/* KELAS */}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <School size={14} />
                    Kelas
                  </label>

                  <select
                    value={formData.className}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        className: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Pilih Kelas</option>

                    {classOptions.map((cls) => (
                      <option
                        key={cls.id}
                        value={cls.name}
                      >
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!isEditMode && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6 text-sm text-blue-800">
                  <p className="font-bold mb-2">
                    Akun Login Otomatis
                  </p>

                  <p>
                    Username:{" "}
                    <strong>
                      {formData.nis || "(NIS siswa)"}
                    </strong>
                  </p>

                  <p>
                    Password awal:{" "}
                    <strong>
                      {formData.nis || "(NIS siswa)"}
                    </strong>
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-5 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-white"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveData}
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL HAPUS
      ============================================ */}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle
                size={32}
                className="text-red-600"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Hapus Siswa?
            </h3>

            <p className="text-gray-500 mb-6 text-sm">
              Apakah Anda yakin ingin menghapus data{" "}
              <strong className="text-gray-800">
                {itemToDelete?.name}
              </strong>
              ? Tindakan ini dapat memengaruhi data hasil
              tes siswa tersebut.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() =>
                  setIsDeleteModalOpen(false)
                }
                disabled={isSaving}
                className="px-5 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isSaving}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
