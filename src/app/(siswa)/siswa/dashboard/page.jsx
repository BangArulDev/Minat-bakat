"use client";
import { motion } from "framer-motion";
import { 
  Hash, 
  BookOpen, 
  Users, 
  ClipboardList, 
  User, 
  School, 
  MapPin, 
  UserCheck, 
  BadgeCheck,
  Building2
} from "lucide-react";

export default function DashboardSiswa() {
  // --- MOCK DATA ---
  const stats = {
    classCode: "CLS-X-IPA1",
    className: "X MIPA 1",
    totalStudents: 32,
    totalInstruments: 3, // Jumlah tes yang tersedia/ditugaskan
  };

  const studentData = {
    nis: "20241001",
    name: "Ahmad Rizki",
    class: "X MIPA 1",
    gender: "Laki-laki"
  };

  const schoolData = {
    name: "SMA Negeri 1 Harapan Bangsa",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    teacher: "Budi Santoso, S.Pd"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* 1. WELCOME HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Halo, {studentData.name}! 👋</h1>
        <p className="text-gray-500 text-sm">Selamat datang di dashboard, siap untuk mengenali potensimu hari ini?</p>
      </div>

      {/* 2. STATS CARDS (Grid 4 Kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Kode Kelas */}
        <StatCard 
          label="Kode Kelas" 
          value={stats.classCode} 
          icon={Hash} 
          color="bg-blue-50 text-blue-600" 
          isCode={true} 
        />
        {/* Card Nama Kelas */}
        <StatCard 
          label="Kelas Saat Ini" 
          value={stats.className} 
          icon={BookOpen} 
          color="bg-purple-50 text-purple-600" 
        />
        {/* Card Teman Sekelas */}
        <StatCard 
          label="Siswa Terdaftar" 
          value={`${stats.totalStudents} Siswa`} 
          icon={Users} 
          color="bg-orange-50 text-orange-600" 
        />
        {/* Card Instrumen */}
        <StatCard 
          label="Item Instrumen" 
          value={`${stats.totalInstruments} Tes`} 
          icon={ClipboardList} 
          color="bg-green-50 text-green-600" 
        />
      </div>

      {/* 3. INFO SECTIONS (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: Identitas Siswa */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <User size={20} /> Identitas Siswa
            </h3>
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
              Status: Aktif
            </span>
          </div>
          
          <div className="p-6 space-y-5">
            <InfoRow label="Nomor Induk Siswa (NIS)" value={studentData.nis} isMono />
            <InfoRow label="Nama Lengkap" value={studentData.name} />
            <InfoRow label="Kelas" value={studentData.class} />
            <InfoRow label="Jenis Kelamin" value={studentData.gender} />
          </div>
        </motion.div>

        {/* KOLOM KANAN: Informasi Sekolah & Guru */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="bg-indigo-600 px-6 py-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <School size={20} /> Informasi Sekolah
            </h3>
          </div>
          
          <div className="p-6 space-y-5">
            <InfoRow label="Nama Sekolah" value={schoolData.name} icon={Building2} />
            <div className="grid grid-cols-2 gap-4">
               <InfoRow label="Provinsi" value={schoolData.province} icon={MapPin} />
               <InfoRow label="Kota / Kabupaten" value={schoolData.city} icon={MapPin} />
            </div>
            
            {/* Highlight Guru */}
            <div className="pt-4 mt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Guru Pembimbing (BK)</p>
              <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{schoolData.teacher}</p>
                  <p className="text-xs text-indigo-600 flex items-center gap-1">
                    <BadgeCheck size={10} /> Terverifikasi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

// 1. Kartu Statistik Atas
function StatCard({ label, value, icon: Icon, color, isCode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={22} />
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-xl font-bold text-gray-900 ${isCode ? "font-mono tracking-tight" : ""}`}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// 2. Baris Data Informasi
function InfoRow({ label, value, isMono, icon: Icon }) {
  return (
    <div className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
        {Icon && <Icon size={12} />} {label}
      </p>
      <p className={`text-gray-800 font-medium ${isMono ? "font-mono bg-gray-100 px-2 py-0.5 rounded text-sm w-fit" : "text-base"}`}>
        {value}
      </p>
    </div>
  );
}