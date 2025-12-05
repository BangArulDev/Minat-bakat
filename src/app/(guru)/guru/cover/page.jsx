"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Printer, 
  Settings, 
  Image as ImageIcon, 
  RefreshCcw,
  Check
} from "lucide-react";

export default function CoverLaporanPage() {
  // --- STATE SETTINGS (Default Value) ---
  const [settings, setSettings] = useState({
    title: "LAPORAN HASIL TES PSIKOLOGI",
    subtitle: "ANALISIS MINAT DAN BAKAT SISWA",
    academicYear: "TAHUN AJARAN 2024 / 2025",
    schoolName: "SMA NEGERI 1 HARAPAN BANGSA",
    schoolAddress: "Jl. Pendidikan No. 45, Jakarta Selatan",
    city: "Jakarta",
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    headmaster: "Drs. Budi Santoso, M.Pd",
    nip: "NIP. 19750101 200003 1 001",
    logoUrl: null // Nanti bisa diganti upload gambar
  });

  const [isPrinting, setIsPrinting] = useState(false);

  // Handle Perubahan Input Form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi Cetak
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cetak Cover Laporan</h1>
          <p className="text-gray-500 text-sm">Sesuaikan identitas sekolah untuk halaman depan laporan.</p>
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
        >
          <Printer size={20} />
          <span>Cetak Cover</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- KOLOM KIRI: FORM PENGATURAN (Hidden saat Print) --- */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-fit space-y-6 print:hidden">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <Settings className="text-gray-400" size={20} />
            <h3 className="font-bold text-gray-900">Pengaturan Cover</h3>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <InputGroup label="Judul Laporan" name="title" value={settings.title} onChange={handleChange} />
            <InputGroup label="Sub-Judul" name="subtitle" value={settings.subtitle} onChange={handleChange} />
            <InputGroup label="Tahun Ajaran" name="academicYear" value={settings.academicYear} onChange={handleChange} />
            
            <div className="border-t border-gray-100 my-4 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Identitas Sekolah</p>
              <InputGroup label="Nama Sekolah" name="schoolName" value={settings.schoolName} onChange={handleChange} />
              <InputGroup label="Alamat Sekolah" name="schoolAddress" value={settings.schoolAddress} onChange={handleChange} />
            </div>

            <div className="border-t border-gray-100 my-4 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tanda Tangan</p>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Kota" name="city" value={settings.city} onChange={handleChange} />
                <InputGroup label="Tanggal" name="date" value={settings.date} onChange={handleChange} />
              </div>
              <InputGroup label="Nama Kepala Sekolah" name="headmaster" value={settings.headmaster} onChange={handleChange} />
              <InputGroup label="NIP" name="nip" value={settings.nip} onChange={handleChange} />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 leading-relaxed">
            <strong>Tips:</strong> Gunakan kertas ukuran A4 saat mencetak untuk hasil terbaik. Pastikan opsi "Background Graphics" aktif di pengaturan print browser.
          </div>
        </div>


        {/* --- KOLOM KANAN: PREVIEW A4 (Ini yang akan dicetak) --- */}
        <div className="lg:col-span-2 flex justify-center bg-gray-100 p-8 rounded-3xl border border-gray-200 overflow-auto print:p-0 print:bg-white print:border-none print:m-0">
          
          {/* A4 PAPER CONTAINER */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[25mm] relative flex flex-col items-center text-center justify-between mx-auto"
            style={{ fontFamily: "'Times New Roman', serif" }} // Font formal
          >
            
            {/* 1. Header Cover */}
            <div className="space-y-6 w-full mt-10">
              {/* Logo Placeholder */}
              <div className="w-32 h-32 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center text-gray-400 mb-8">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <ImageIcon size={32} />
                    <span className="text-[10px] mt-1">Logo Sekolah</span>
                  </>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-black uppercase tracking-wide leading-relaxed">
                  {settings.title}
                </h1>
                <h2 className="text-xl font-bold text-black uppercase mt-2">
                  {settings.subtitle}
                </h2>
                <h3 className="text-lg text-black mt-2 font-medium">
                  {settings.academicYear}
                </h3>
              </div>
            </div>

            {/* 2. Middle Content (Placeholder Nama Siswa) */}
            <div className="py-20 w-full">
              <div className="border-t-2 border-b-2 border-black py-4 w-3/4 mx-auto">
                <p className="text-sm italic text-gray-500 mb-2 print:hidden">[Area Nama Siswa Otomatis]</p>
                <p className="text-lg font-bold uppercase">NAMA SISWA</p>
                <p className="text-md">NIS: 00000000</p>
                <p className="text-md font-bold mt-1">KELAS: X - XII</p>
              </div>
            </div>

            {/* 3. Footer Cover */}
            <div className="w-full space-y-2 mb-10">
              <h3 className="text-xl font-bold uppercase">{settings.schoolName}</h3>
              <p className="text-sm">{settings.schoolAddress}</p>
              
              <div className="pt-16 w-full flex justify-end text-right">
                <div className="text-left inline-block min-w-[200px]">
                  <p>{settings.city}, {settings.date}</p>
                  <p className="mt-1">Kepala Sekolah,</p>
                  <div className="h-20"></div> {/* Spasi Tanda Tangan */}
                  <p className="font-bold underline">{settings.headmaster}</p>
                  <p>NIP. {settings.nip}</p>
                </div>
              </div>
            </div>

            {/* Print Decoration (Hidden on print) */}
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden" />

          </motion.div>
        </div>

      </div>

      {/* CSS KHUSUS PRINT */}
      <style jsx global>{`
        @media print {
          /* Sembunyikan semua elemen kecuali area kertas A4 */
          body * {
            visibility: hidden;
          }
          /* Tampilkan area kertas A4 */
          .max-w-7xl, .lg\\:col-span-2, .motion-div, .motion-div * {
            visibility: visible;
          }
          /* Atur posisi agar pas di kertas */
          .lg\\:col-span-2 {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 100%;
          }
          /* Hilangkan background abu-abu saat print */
          .bg-gray-100 {
            background-color: white !important;
          }
          /* Sembunyikan elemen sidebar, header, navbar */
          nav, aside, header, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Helper Input Component
function InputGroup({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500">{label}</label>
      <input 
        type="text" 
        name={name}
        value={value} 
        onChange={onChange}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800"
      />
    </div>
  );
}