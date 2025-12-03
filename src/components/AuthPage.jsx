"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Briefcase, 
  GraduationCap 
} from "lucide-react";

export default function AuthPage() {
  // State untuk mengontrol tampilan
  const [authMode, setAuthMode] = useState("login"); // 'login' atau 'register'
  const [userType, setUserType] = useState("siswa"); // 'siswa' atau 'guru'

  // Fungsi toggle sederhana
  const toggleAuthMode = () => setAuthMode(authMode === "login" ? "register" : "login");

  // Variabel konten dinamis berdasarkan User Type
  const content = {
    siswa: {
      color: "blue",
      icon: GraduationCap,
      welcomeTitle: "Mulai Perjalanannmu",
      welcomeDesc: "Temukan potensi tersembunyi dan raih masa depan impianmu.",
      bgGradient: "from-blue-600 to-indigo-600",
    },
    guru: {
      color: "emerald", // Warna beda biar kontras
      icon: Briefcase,
      welcomeTitle: "Bimbing Masa Depan",
      welcomeDesc: "Kelola kelas dan bantu siswa menemukan bakat terbaik mereka.",
      bgGradient: "from-emerald-600 to-teal-600",
    }
  };

  const currentContent = content[userType];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      {/* Container Utama (Card Besar) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      >

        {/* --- BAGIAN KIRI: VISUAL BANNER --- */}
        {/* Bagian ini berubah warna tergantung Siswa/Guru */}
        <motion.div 
          className={`relative w-full md:w-5/12 p-12 flex flex-col justify-between text-white bg-gradient-to-br ${currentContent.bgGradient}`}
          layout // Animasi halus saat layout berubah
        >
          {/* Logo Putih */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">TalentaKu</span>
          </div>

          {/* Teks Inspiratif Tengah */}
          <div className="relative z-10 my-10">
            <motion.div
              key={userType} // Re-render animasi saat tipe user berubah
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <currentContent.icon size={28} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">{currentContent.welcomeTitle}</h2>
              <p className="text-blue-50/90 leading-relaxed">
                {currentContent.welcomeDesc}
              </p>
            </motion.div>
          </div>

          {/* Hiasan Lingkaran Abstrak */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="text-xs text-white/50 relative z-10">
            &copy; 2024 TalentaKu Platform
          </div>
        </motion.div>


        {/* --- BAGIAN KANAN: FORM AREA --- */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Tombol Back to Home (Pojok Kanan Atas) */}
          <Link href="/" className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors">
            <XIcon />
          </Link>

          {/* 1. SWITCHER: SISWA vs GURU */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-full inline-flex relative">
              {/* Background Putih Bergerak (Indikator) */}
              <motion.div 
                className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm"
                initial={false}
                animate={{ 
                  x: userType === "siswa" ? 0 : "100%", 
                  width: "50%" 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              
              {/* Tombol Siswa */}
              <button 
                onClick={() => setUserType("siswa")}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${userType === "siswa" ? "text-gray-900" : "text-gray-500"}`}
              >
                Siswa
              </button>
              
              {/* Tombol Guru */}
              <button 
                onClick={() => setUserType("guru")}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${userType === "guru" ? "text-gray-900" : "text-gray-500"}`}
              >
                Guru
              </button>
            </div>
          </div>


          {/* 2. FORM UTAMA */}
          <div className="max-w-sm mx-auto w-full">
            <motion.div
              key={authMode} // Reset animasi saat mode berubah (Login <-> Daftar)
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {authMode === "login" ? "Selamat Datang Kembali" : "Buat Akun Baru"}
              </h1>
              <p className="text-gray-500 text-sm mb-8 text-center">
                {authMode === "login" 
                  ? `Masuk sebagai ${userType} untuk melanjutkan.` 
                  : `Daftar sebagai ${userType} dan mulai akses fitur.`}
              </p>

              <form className="space-y-4">
                
                {/* Input Nama (Hanya muncul saat Daftar) */}
                <AnimatePresence>
                  {authMode === "register" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative mb-4">
                        <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input 
                          type="text" 
                          placeholder="Nama Lengkap" 
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    placeholder="Alamat Email" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Input Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input 
                    type="password" 
                    placeholder="Kata Sandi" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Lupa Password (Hanya Login) */}
                {authMode === "login" && (
                  <div className="flex justify-end">
                    <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">
                      Lupa Password?
                    </a>
                  </div>
                )}

                {/* Tombol Submit */}
                <button 
                  type="button" // Ganti 'submit' kalau sudah ada backend
                  className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all
                    ${userType === "siswa" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}
                  `}
                >
                  {authMode === "login" ? "Masuk Sekarang" : "Daftar Akun"}
                  <ArrowRight size={18} />
                </button>

              </form>

              {/* 3. SWITCHER: DAFTAR vs MASUK */}
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  {authMode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
                  <button 
                    onClick={toggleAuthMode}
                    className={`font-bold hover:underline ${userType === "siswa" ? "text-blue-600" : "text-emerald-600"}`}
                  >
                    {authMode === "login" ? "Daftar Gratis" : "Login disini"}
                  </button>
                </p>
              </div>

            </motion.div>
          </div>

        </div>

      </motion.div>
    </div>
  );
}

// Komponen Ikon X Kecil untuk tombol close
function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </svg>
  )
}