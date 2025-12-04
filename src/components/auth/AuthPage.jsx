"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Sparkles, User, Mail, Lock, ArrowRight, Briefcase, GraduationCap, 
  School, MapPin, Map, CheckCircle, ArrowLeft, Phone, Hash, Calendar, Eye, EyeOff, Loader2
} from "lucide-react";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState("login"); // 'login' atau 'register'
  const [userType, setUserType] = useState("siswa"); // 'siswa' atau 'guru'

  const toggleAuthMode = () => setAuthMode(authMode === "login" ? "register" : "login");

  // Konfigurasi Tema
  const content = {
    siswa: {
      color: "blue",
      icon: GraduationCap,
      welcomeTitle: "Mulai Perjalanannmu",
      welcomeDesc: "Masuk dengan Kode Kelas untuk memulai tes minat bakat.",
      bgGradient: "from-blue-600 to-indigo-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      textColor: "text-blue-600",
      ringColor: "focus:ring-blue-500/20",
    },
    guru: {
      color: "emerald",
      icon: Briefcase,
      welcomeTitle: "Bimbing Masa Depan",
      welcomeDesc: "Kelola kelas dan pantau hasil minat bakat siswa Anda.",
      bgGradient: "from-emerald-600 to-teal-600",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      textColor: "text-emerald-600",
      ringColor: "focus:ring-emerald-500/20",
    }
  };

  const currentContent = content[userType];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden relative z-50 bg-white">
      
      {/* --- BAGIAN KIRI: VISUAL BANNER --- */}
      <motion.div 
        className={`hidden md:flex relative w-full h-full p-16 flex-col justify-between text-white bg-gradient-to-br ${currentContent.bgGradient} transition-all duration-500`}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">TalentaKu</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={userType} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                <currentContent.icon size={32} className="text-white" />
              </div>
              <h2 className="text-5xl font-bold mb-6 leading-tight">{currentContent.welcomeTitle}</h2>
              <p className="text-blue-50/90 text-lg leading-relaxed">
                {currentContent.welcomeDesc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-sm text-white/50 relative z-10">
          &copy; {new Date().getFullYear()} TalentaKu Platform.
        </div>
        
        {/* Hiasan Blur Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </motion.div>


      {/* --- BAGIAN KANAN: FORM AREA --- */}
      <div className="w-full h-full flex flex-col items-center bg-white relative overflow-y-auto">
        
        <div className="w-full max-w-md py-12 px-8 md:px-0 my-auto">
          
          <Link href="/" className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
            <XIcon />
          </Link>

          {/* Switcher Siswa/Guru (Hanya di mode Login atau Register Siswa) */}
          {/* Kita sembunyikan switcher hanya jika sedang Register GURU (karena multi-step) */}
          {!(authMode === "register" && userType === "guru") && (
            <div className="flex justify-center mb-10">
              <div className="bg-gray-100 p-1.5 rounded-full inline-flex relative w-full max-w-[300px]">
                <motion.div 
                  className="absolute top-1.5 bottom-1.5 bg-white rounded-full shadow-sm"
                  initial={false}
                  animate={{ x: userType === "siswa" ? 0 : "100%" }}
                  style={{ width: "50%" }} 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button onClick={() => setUserType("siswa")} className={`flex-1 relative z-10 py-2.5 rounded-full text-sm font-bold transition-colors ${userType === "siswa" ? "text-gray-900" : "text-gray-500"}`}>Siswa</button>
                <button onClick={() => setUserType("guru")} className={`flex-1 relative z-10 py-2.5 rounded-full text-sm font-bold transition-colors ${userType === "guru" ? "text-gray-900" : "text-gray-500"}`}>Guru</button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {authMode === "login" ? (
              // --- FORM LOGIN (Dinamis Siswa vs Guru) ---
              <LoginForm key="login-form" content={currentContent} toggleMode={toggleAuthMode} userType={userType} />
            ) : userType === "guru" ? (
              // --- FORM REGISTER GURU ---
              <RegisterGuruForm key="register-guru" content={currentContent} toggleMode={toggleAuthMode} />
            ) : (
              // --- FORM REGISTER SISWA (Sekarang Multi-Step) ---
              <RegisterSiswaForm key="register-siswa" content={currentContent} toggleMode={toggleAuthMode} />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

// =================================================================
// 1. KOMPONEN LOGIN (DINAMIS)
// =================================================================
function LoginForm({ content, toggleMode, userType }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Selamat Datang</h1>
        <p className="text-gray-500">
          {userType === "siswa" ? "Masuk menggunakan Kode Kelas & Akun Anda." : "Masuk ke Dashboard Guru."}
        </p>
      </div>
      
      <form className="space-y-5">
        
        {/* INPUT KHUSUS SISWA: KODE KELAS */}
        {userType === "siswa" && (
           <InputIcon icon={Hash} placeholder="Kode Kelas (Contoh: X-IPA-1)" ringColor={content.ringColor} />
        )}

        {/* Username (Siswa) atau Email (Guru) */}
        <InputIcon 
          icon={userType === "siswa" ? User : Mail} 
          type={userType === "siswa" ? "text" : "email"} 
          placeholder={userType === "siswa" ? "Username" : "Alamat Email"} 
          ringColor={content.ringColor} 
        />
        
        <InputIcon icon={Lock} type="password" placeholder="Kata Sandi" ringColor={content.ringColor} />
        
        <div className="flex justify-end">
          <a href="#" className={`text-sm font-bold hover:underline ${content.textColor}`}>Lupa Password?</a>
        </div>
        
        <button type="button" className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all ${content.buttonColor}`}>
          Masuk Sekarang <ArrowRight size={20} />
        </button>
      </form>
      
      <div className="mt-8 text-center text-gray-500">
        Belum punya akun? <button onClick={toggleMode} className={`font-bold hover:underline ${content.textColor}`}>Daftar Gratis</button>
      </div>
    </motion.div>
  );
}

// =================================================================
// 2. KOMPONEN REGISTER SISWA (MULTI-STEP BARU)
// =================================================================
function RegisterSiswaForm({ content, toggleMode }) {
  const [step, setStep] = useState(1);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [classInfo, setClassInfo] = useState({ name: "", school: "" });

  const [formData, setFormData] = useState({
    kodeKelas: "",
    namaKelas: "",
    sekolah: "",
    kota: "",
    nis: "",
    namaLengkap: "",
    kotaLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Simulasi Validasi Kode Kelas
  const handleCheckCode = () => {
    if (!formData.kodeKelas) return;
    setIsValidatingCode(true);
    
    // Pura-pura loading 1 detik
    setTimeout(() => {
      setIsValidatingCode(false);
      // Pura-pura dapet data dari server
      const mockData = { name: "XII IPA 2", school: "SMA Negeri 1 Talenta" };
      setClassInfo(mockData);
      setFormData(prev => ({
         ...prev, 
         namaKelas: mockData.name,
         sekolah: mockData.school 
      }));
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Siswa</h1>
        <div className="flex items-center gap-2 mt-4">
          {[1, 2].map((num) => (
            <div key={num} className={`h-2 rounded-full flex-1 transition-all ${step >= num ? "bg-blue-500" : "bg-gray-200"}`} />
          ))}
        </div>
        <p className="text-xs text-blue-600 font-bold mt-2 text-right">Langkah {step} dari 2</p>
      </div>

      <form className="space-y-4">
        
        {/* === LANGKAH 1: INFO PRIBADI & KELAS === */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            {/* Input Kode Kelas dengan Tombol Validasi */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Kode Kelas</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                   <Hash className="absolute left-4 top-3.5 text-gray-400" size={20} />
                   <input 
                      name="kodeKelas" 
                      value={formData.kodeKelas} 
                      onChange={handleChange}
                      placeholder="Masukkan Kode" 
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ${content.ringColor} transition-all font-medium text-sm`}
                   />
                </div>
                <button 
                  type="button" 
                  onClick={handleCheckCode}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-200 transition-colors"
                >
                  {isValidatingCode ? <Loader2 className="animate-spin" size={20} /> : "Cek"}
                </button>
              </div>
              {classInfo.name && (
                <p className="text-xs text-green-600 mt-1 ml-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Kelas ditemukan: {classInfo.name}
                </p>
              )}
            </div>

            {/* Field ReadOnly / AutoFill */}
            <div className="grid grid-cols-2 gap-4">
               <InputIcon icon={Briefcase} name="namaKelas" placeholder="Nama Kelas" value={formData.namaKelas} readOnly className="bg-gray-100 text-gray-500" />
               <InputIcon icon={School} name="sekolah" placeholder="Nama Sekolah" value={formData.sekolah} readOnly className="bg-gray-100 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <InputIcon icon={MapPin} name="kota" placeholder="Kota / Kab." ringColor={content.ringColor} onChange={handleChange} />
               <InputIcon icon={Hash} name="nis" placeholder="NIS" type="number" ringColor={content.ringColor} onChange={handleChange} />
            </div>

            <InputIcon icon={User} name="namaLengkap" placeholder="Nama Lengkap" ringColor={content.ringColor} onChange={handleChange} />

            <div className="grid grid-cols-2 gap-4">
               <InputIcon icon={Map} name="kotaLahir" placeholder="Kota Lahir" ringColor={content.ringColor} onChange={handleChange} />
               <InputIcon icon={Calendar} name="tanggalLahir" type="date" ringColor={content.ringColor} onChange={handleChange} />
            </div>

             {/* Radio Jenis Kelamin */}
             <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.jenisKelamin === 'L' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
                  <input type="radio" name="jenisKelamin" value="L" checked={formData.jenisKelamin === 'L'} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                  <span className="font-medium text-sm">Laki-laki</span>
                </label>
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.jenisKelamin === 'P' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
                  <input type="radio" name="jenisKelamin" value="P" checked={formData.jenisKelamin === 'P'} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                  <span className="font-medium text-sm">Perempuan</span>
                </label>
             </div>
          </motion.div>
        )}

        {/* === LANGKAH 2: AKUN LOGIN === */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
             <h3 className="font-bold text-gray-700 flex items-center gap-2"><Lock size={18} /> Informasi Login</h3>
             
             <InputIcon icon={User} name="username" placeholder="Buat Username" ringColor={content.ringColor} onChange={handleChange} />
             <InputIcon icon={Lock} name="password" type="password" placeholder="Password Baru" ringColor={content.ringColor} onChange={handleChange} />
             <InputIcon icon={CheckCircle} name="confirmPassword" type="password" placeholder="Konfirmasi Password" ringColor={content.ringColor} onChange={handleChange} />
          </motion.div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
              <ArrowLeft size={18} /> Kembali
            </button>
          )}
          
          {step < 2 ? (
             <button type="button" onClick={() => setStep(step + 1)} className={`flex-1 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 ${content.buttonColor}`}>
               Lanjut <ArrowRight size={18} />
             </button>
          ) : (
            <button type="button" className={`flex-1 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 ${content.buttonColor}`}>
              Daftar Sekarang <CheckCircle size={18} />
            </button>
          )}
        </div>
      </form>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        Sudah punya akun? <button onClick={toggleMode} className={`font-bold hover:underline ${content.textColor}`}>Login disini</button>
      </div>
    </motion.div>
  );
}

// =================================================================
// 3. KOMPONEN REGISTER GURU (SAMA SEPERTI SEBELUMNYA)
// =================================================================
function RegisterGuruForm({ content, toggleMode }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    kodeSekolah: "", namaSekolah: "", alamatSekolah: "", provinsi: "", kota: "", kotaAlias: "",
    namaLengkap: "", nip: "", gender: "L", whatsapp: "", email: "", password: "", confirmPassword: ""
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, kodeSekolah: "SCH-" + Math.random().toString(36).substring(2, 6).toUpperCase() }));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Guru</h1>
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`h-2 rounded-full flex-1 transition-all ${step >= num ? "bg-emerald-500" : "bg-gray-200"}`} />
          ))}
        </div>
        <p className="text-xs text-emerald-600 font-bold mt-2 text-right">Langkah {step} dari 3</p>
      </div>

      <form className="space-y-4">
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2"><School size={18} /> Info Sekolah</h3>
            <div className="bg-gray-100 p-3 rounded-xl border border-gray-200">
              <label className="text-xs text-gray-500 font-bold uppercase">Kode Sekolah (Otomatis)</label>
              <div className="text-lg font-mono font-bold text-gray-700">{formData.kodeSekolah}</div>
            </div>
            <InputIcon icon={School} name="namaSekolah" placeholder="Nama Sekolah" ringColor={content.ringColor} onChange={handleChange} />
            <div className="relative">
               <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
               <textarea name="alamatSekolah" placeholder="Alamat Lengkap Sekolah" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm min-h-[80px]" onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <InputIcon icon={Map} name="provinsi" placeholder="Provinsi" ringColor={content.ringColor} onChange={handleChange} />
               <InputIcon icon={MapPin} name="kota" placeholder="Kota/Kab" ringColor={content.ringColor} onChange={handleChange} />
            </div>
            <div>
              <InputIcon icon={MapPin} name="kotaAlias" placeholder="Kota Tanda Tangan" ringColor={content.ringColor} onChange={handleChange} />
              <p className="text-[10px] text-gray-400 mt-1 ml-2">*Contoh: "Jakarta" (untuk tampilan di surat/laporan)</p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
             <h3 className="font-bold text-gray-700 flex items-center gap-2"><User size={18} /> Info Konselor</h3>
             <InputIcon icon={User} name="namaLengkap" placeholder="Nama Lengkap & Gelar" ringColor={content.ringColor} onChange={handleChange} />
             <InputIcon icon={Briefcase} name="nip" type="number" placeholder="NIP / NUPTK" ringColor={content.ringColor} onChange={handleChange} />
             <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.gender === 'L' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 text-gray-500'}`}>
                  <input type="radio" name="gender" value="L" checked={formData.gender === 'L'} onChange={handleChange} className="w-4 h-4 accent-emerald-600" />
                  <span className="font-medium text-sm">Laki-laki</span>
                </label>
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.gender === 'P' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 text-gray-500'}`}>
                  <input type="radio" name="gender" value="P" checked={formData.gender === 'P'} onChange={handleChange} className="w-4 h-4 accent-emerald-600" />
                  <span className="font-medium text-sm">Perempuan</span>
                </label>
             </div>
             <InputIcon icon={Phone} name="whatsapp" type="tel" placeholder="No. WhatsApp (+62)" ringColor={content.ringColor} onChange={handleChange} />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
             <h3 className="font-bold text-gray-700 flex items-center gap-2"><Lock size={18} /> Info Login</h3>
             <InputIcon icon={Mail} name="email" type="email" placeholder="Email Aktif" ringColor={content.ringColor} onChange={handleChange} />
             <InputIcon icon={Lock} name="password" type="password" placeholder="Password" ringColor={content.ringColor} onChange={handleChange} />
             <InputIcon icon={CheckCircle} name="confirmPassword" type="password" placeholder="Konfirmasi Password" ringColor={content.ringColor} onChange={handleChange} />
          </motion.div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
              <ArrowLeft size={18} /> Kembali
            </button>
          )}
          {step < 3 ? (
             <button type="button" onClick={nextStep} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2">
               Lanjut <ArrowRight size={18} />
             </button>
          ) : (
            <button type="button" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2">
              Daftar Sekarang <CheckCircle size={18} />
            </button>
          )}
        </div>
      </form>
      <div className="mt-8 text-center text-gray-500 text-sm">
        Sudah punya akun? <button onClick={toggleMode} className={`font-bold hover:underline ${content.textColor}`}>Login disini</button>
      </div>
    </motion.div>
  );
}

// =================================================================
// 4. UTILITY COMPONENTS
// =================================================================
function InputIcon({ icon: Icon, ringColor, className, ...props }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-3.5 text-gray-400" size={20} />
      <input 
        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent transition-all font-medium text-sm ${className}`}
        {...props}
      />
    </div>
  );
}

function XIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
}