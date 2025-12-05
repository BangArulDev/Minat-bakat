"use client";
import { Users, BookOpen, FileText, CreditCard, School, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardGuru() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. Judul Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ringkasan Dashboard</h1>
        <p className="text-gray-500">Selamat datang kembali, pantau aktivitas siswamu hari ini.</p>
      </div>

      {/* 2. Kartu Statistik (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Siswa */}
        <StatCard 
          title="Total Siswa" 
          value="142" 
          icon={Users} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        {/* Card Kelas */}
        <StatCard 
          title="Jumlah Kelas" 
          value="6" 
          icon={BookOpen} 
          color="text-purple-600" 
          bg="bg-purple-50" 
        />
        {/* Card Instrumen */}
        <StatCard 
          title="Item Instrumen" 
          value="24" 
          icon={FileText} 
          color="text-orange-600" 
          bg="bg-orange-50" 
        />
        {/* Card Sisa Kuota */}
        <StatCard 
          title="Sisa Kuota" 
          value="11" 
          icon={CreditCard} 
          color="text-green-600" 
          bg="bg-green-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:col-span-2 space-y-8">
        
        {/* 3. Kolom Kiri: Info Sekolah & Beli Kuota */}
          
          {/* Section Kuota Sosiometri */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">KUOTA SOSIOMETRI</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                Aktif
              </span>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                <div className="space-y-2">
                  <p className="text-sm text-yellow-800 font-medium">
                    Siswa kuota Anda adalah <strong className="text-black text-base">11</strong>.
                  </p>
                  <p className="text-xs text-yellow-700 leading-relaxed">
                    Kuota akan terus berkurang saat menambahkan siswa atau saat siswa mendaftar pada kelas tertentu. 
                    Jika kuota habis Anda tidak bisa lagi menambahkan siswa.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
                Beli Kuota Sekarang
              </button>
              <p className="text-xs text-gray-500 text-center sm:text-left">
                Metode pembayaran: Virtual Account, QRIS, Alfamart, Indomaret, Kartu Kredit.
              </p>
            </div>
          </div>

          {/* Section Data Sekolah */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <School className="text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">Identitas Sekolah</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                <InfoItem label="Kode / ID Sekolah" value="SCH-2024-8891" />
                <InfoItem label="Nama Sekolah" value="SMA Negeri 1 Harapan Bangsa" />
                <InfoItem label="Alamat" value="Jl. Pendidikan No. 45" />
                <InfoItem label="Kota / Kab." value="Jakarta Selatan" />
                <InfoItem label="Provinsi" value="DKI Jakarta" />
             </div>
          </div>


        {/* 4. Kolom Kanan: Quick Actions atau Info Tambahan (Opsional biar seimbang) */}
        {/* <div className="space-y-6">
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <h4 className="font-bold text-lg mb-2">Butuh Bantuan?</h4>
            <p className="text-blue-100 text-sm mb-4">
              Panduan penggunaan aplikasi untuk guru BK tersedia di sini.
            </p>
            <button className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2">
              Lihat Panduan <ArrowRight size={16} />
            </button>
          </div>
        </div> */}

      </div>
    </div>
  );
}

// === KOMPONEN KECIL (Helper Components) ===

// 1. Komponen Kartu Statistik
function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${bg} ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </motion.div>
  );
}

// 2. Komponen Item Info Sekolah
function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}