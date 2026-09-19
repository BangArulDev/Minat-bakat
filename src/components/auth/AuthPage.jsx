"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerGuru, registerSiswa } from "@/app/actions/auth";
import { 
  Sparkles, User, Mail, Lock, ArrowRight, Briefcase, GraduationCap, 
  School, MapPin, Map, CheckCircle, ArrowLeft, Phone, Hash, Calendar, 
  Loader2, Send, X as XIconLucide
} from "lucide-react";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState("login");
  const [userType, setUserType] = useState("siswa");

  const toRegister = () => setAuthMode("register");
  const toLogin = () => setAuthMode("login");
  const toForgot = () => setAuthMode("forgot");

  const content = {
    siswa: {
      color: "blue",
      icon: GraduationCap,
      welcomeTitle: "Mulai Perjalananmu",
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
      {/* VISUAL BANNER */}
      <motion.div className={`hidden md:flex relative w-full h-full p-16 flex-col justify-between text-white bg-gradient-to-br ${currentContent.bgGradient} transition-all duration-500`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">TalentaKu</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div key={userType} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                <currentContent.icon size={32} className="text-white" />
              </div>
              <h2 className="text-5xl font-bold mb-6 leading-tight">{currentContent.welcomeTitle}</h2>
              <p className="text-blue-50/90 text-lg leading-relaxed">{currentContent.welcomeDesc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-sm text-white/50 relative z-10">&copy; {new Date().getFullYear()} TalentaKu Platform.</div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </motion.div>

      {/* FORM AREA */}
      <div className="w-full h-full flex flex-col items-center bg-white relative overflow-y-auto">
        <div className="w-full max-w-md py-12 px-8 md:px-0 my-auto">
          <Link href="/" className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
            <XIconLucide />
          </Link>

          {(authMode === "login" || (authMode === "register" && userType === "siswa")) && (
            <div className="flex justify-center mb-10">
              <div className="bg-gray-100 p-1.5 rounded-full inline-flex relative w-full max-w-[300px]">
                <motion.div 
                  className="absolute top-1.5 bottom-1.5 bg-white rounded-full shadow-sm"
                  initial={false}
                  animate={{ x: userType === "siswa" ? 0 : "100%" }}
                  style={{ width: "48%" }} 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button onClick={() => setUserType("siswa")} className={`flex-1 relative z-10 py-2.5 rounded-full text-sm font-bold transition-colors ${userType === "siswa" ? "text-gray-900" : "text-gray-500"}`}>Siswa</button>
                <button onClick={() => setUserType("guru")} className={`flex-1 relative z-10 py-2.5 rounded-full text-sm font-bold transition-colors ${userType === "guru" ? "text-gray-900" : "text-gray-500"}`}>Guru</button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {authMode === "login" && <LoginForm key="login" content={currentContent} toRegister={toRegister} toForgot={toForgot} userType={userType} />}
            {authMode === "register" && userType === "siswa" && <RegisterSiswaForm key="reg-siswa" content={currentContent} toLogin={toLogin} />}
            {authMode === "register" && userType === "guru" && <RegisterGuruForm key="reg-guru" content={currentContent} toLogin={toLogin} />}
            {authMode === "forgot" && <ForgotPasswordForm key="forgot" content={currentContent} toLogin={toLogin} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// 1. LOGIN FORM
function LoginForm({ content, toRegister, toForgot, userType }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const username = e.target.username.value;
    const password = e.target.password.value;

    const result = await signIn("credentials", {
      username,
      password,
      userType,
      redirect: false,
    });

    if (result?.error) {
      setError("Username / Email atau Password salah.");
      setLoading(false);
    } else {
      router.push(userType === "siswa" ? "/siswa/dashboard" : "/guru/dashboard");
      router.refresh();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Selamat Datang</h1>
        <p className="text-gray-500">{userType === "siswa" ? "Masuk menggunakan Username & Akun Anda." : "Masuk ke Dashboard Guru."}</p>
      </div>
      
      {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-5">
        <InputIcon icon={userType === "siswa" ? User : Mail} type={userType === "siswa" ? "text" : "email"} name="username" placeholder={userType === "siswa" ? "Username" : "Alamat Email"} ringColor={content.ringColor} required />
        <InputIcon icon={Lock} type="password" name="password" placeholder="Kata Sandi" ringColor={content.ringColor} required />
        <div className="flex justify-end">
          <button type="button" onClick={toForgot} className={`text-sm font-bold hover:underline ${content.textColor}`}>Lupa Password?</button>
        </div>
        <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 ${content.buttonColor}`}>
          {loading ? <Loader2 className="animate-spin" /> : <>Masuk Sekarang <ArrowRight size={20} /></>}
        </button>
      </form>
      
      <div className="mt-8 text-center text-gray-500">
        Belum punya akun? <button onClick={toRegister} className={`font-bold hover:underline ${content.textColor}`}>Daftar Gratis</button>
      </div>
    </motion.div>
  );
}

// 2. FORGOT PASSWORD
function ForgotPasswordForm({ content, toLogin }) {
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setIsSent(true); }, 1500);
  };

  if (isSent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-green-600" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cek Email Anda</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">Kami telah mengirimkan tautan reset password ke <strong>{email}</strong>.</p>
        <button onClick={toLogin} className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:opacity-90 ${content.buttonColor}`}><ArrowLeft size={20} /> Kembali ke Login</button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="mb-8">
        <button onClick={toLogin} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-6 text-sm font-medium"><ArrowLeft size={16} /> Kembali</button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-500 text-sm">Masukkan email atau username yang terdaftar.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputIcon icon={Mail} type="email" placeholder="Masukkan Email" ringColor={content.ringColor} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit" disabled={isLoading || !email} className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 ${content.buttonColor}`}>
          {isLoading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Kirim Link</>}
        </button>
      </form>
    </motion.div>
  );
}

// 3. REGISTER SISWA
function RegisterSiswaForm({ content, toLogin }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    kodeKelas: "", namaLengkap: "", nis: "", kotaLahir: "", tanggalLahir: "", jenisKelamin: "L", username: "", password: "", confirmPassword: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }
    setLoading(true);
    setError("");
    const res = await registerSiswa(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      const loginRes = await signIn("credentials", { username: formData.username, password: formData.password, userType: "siswa", redirect: false });
      if (!loginRes?.error) {
        router.push("/siswa/dashboard");
        router.refresh();
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Siswa</h1>
        <p className="text-xs text-blue-600 font-bold mt-2 text-right">Langkah {step} dari 2</p>
      </div>

      {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">{error}</div>}

      <form className="space-y-4">
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <InputIcon icon={Hash} name="kodeKelas" placeholder="Kode Kelas (diberikan Guru)" ringColor={content.ringColor} onChange={handleChange} value={formData.kodeKelas} />
            <InputIcon icon={User} name="namaLengkap" placeholder="Nama Lengkap" ringColor={content.ringColor} onChange={handleChange} value={formData.namaLengkap} />
            <InputIcon icon={Hash} name="nis" placeholder="NIS" type="number" ringColor={content.ringColor} onChange={handleChange} value={formData.nis} />
            <div className="grid grid-cols-2 gap-4">
               <InputIcon icon={Map} name="kotaLahir" placeholder="Kota Lahir" ringColor={content.ringColor} onChange={handleChange} value={formData.kotaLahir} />
               <InputIcon icon={Calendar} name="tanggalLahir" type="date" ringColor={content.ringColor} onChange={handleChange} value={formData.tanggalLahir} />
            </div>
             <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${formData.jenisKelamin === 'L' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}>
                  <input type="radio" name="jenisKelamin" value="L" checked={formData.jenisKelamin === 'L'} onChange={handleChange} className="w-4 h-4" /> Laki-laki
                </label>
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${formData.jenisKelamin === 'P' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}>
                  <input type="radio" name="jenisKelamin" value="P" checked={formData.jenisKelamin === 'P'} onChange={handleChange} className="w-4 h-4" /> Perempuan
                </label>
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
             <InputIcon icon={User} name="username" placeholder="Buat Username" ringColor={content.ringColor} onChange={handleChange} value={formData.username} />
             <InputIcon icon={Lock} name="password" type="password" placeholder="Password Baru" ringColor={content.ringColor} onChange={handleChange} value={formData.password} />
             <InputIcon icon={CheckCircle} name="confirmPassword" type="password" placeholder="Konfirmasi Password" ringColor={content.ringColor} onChange={handleChange} value={formData.confirmPassword} />
          </motion.div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl border border-gray-300 font-bold"><ArrowLeft size={18} /></button>}
          {step < 2 ? (
             <button type="button" onClick={() => setStep(step + 1)} className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg ${content.buttonColor}`}>Lanjut</button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 ${content.buttonColor}`}>
              {loading ? <Loader2 className="animate-spin" /> : "Daftar Sekarang"}
            </button>
          )}
        </div>
      </form>
      <div className="mt-8 text-center text-gray-500 text-sm">
        Sudah punya akun? <button onClick={toLogin} className={`font-bold hover:underline ${content.textColor}`}>Login disini</button>
      </div>
    </motion.div>
  );
}

// 4. REGISTER GURU
function RegisterGuruForm({ content, toLogin }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    kodeSekolah: "", namaSekolah: "", namaLengkap: "", nip: "", gender: "L", whatsapp: "", email: "", password: "", confirmPassword: ""
  });

  useEffect(() => setFormData(prev => ({ ...prev, kodeSekolah: "SCH-" + Math.random().toString(36).substring(2, 6).toUpperCase() })), []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }
    setLoading(true);
    setError("");
    const res = await registerGuru(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      const loginRes = await signIn("credentials", { username: formData.email, password: formData.password, userType: "guru", redirect: false });
      if (!loginRes?.error) {
        router.push("/guru/dashboard");
        router.refresh();
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Guru</h1>
        <p className="text-xs text-emerald-600 font-bold mt-2 text-right">Langkah {step} dari 3</p>
      </div>

      {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">{error}</div>}

      <form className="space-y-4">
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <InputIcon icon={School} name="namaSekolah" placeholder="Nama Sekolah" ringColor={content.ringColor} onChange={handleChange} value={formData.namaSekolah} />
            <div className="bg-gray-100 p-3 rounded-xl border border-gray-200">
              <label className="text-xs text-gray-500 font-bold uppercase">Kode Sekolah (Otomatis)</label>
              <div className="text-lg font-mono font-bold text-gray-700">{formData.kodeSekolah}</div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
             <InputIcon icon={User} name="namaLengkap" placeholder="Nama Lengkap & Gelar" ringColor={content.ringColor} onChange={handleChange} value={formData.namaLengkap} />
             <InputIcon icon={Briefcase} name="nip" type="number" placeholder="NIP / NUPTK" ringColor={content.ringColor} onChange={handleChange} value={formData.nip} />
             <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${formData.gender === 'L' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200'}`}>
                  <input type="radio" name="gender" value="L" checked={formData.gender === 'L'} onChange={handleChange} className="w-4 h-4" /> Laki-laki
                </label>
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${formData.gender === 'P' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200'}`}>
                  <input type="radio" name="gender" value="P" checked={formData.gender === 'P'} onChange={handleChange} className="w-4 h-4" /> Perempuan
                </label>
             </div>
             <InputIcon icon={Phone} name="whatsapp" type="tel" placeholder="No. WhatsApp" ringColor={content.ringColor} onChange={handleChange} value={formData.whatsapp} />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
             <InputIcon icon={Mail} name="email" type="email" placeholder="Email Aktif" ringColor={content.ringColor} onChange={handleChange} value={formData.email} />
             <InputIcon icon={Lock} name="password" type="password" placeholder="Password" ringColor={content.ringColor} onChange={handleChange} value={formData.password} />
             <InputIcon icon={CheckCircle} name="confirmPassword" type="password" placeholder="Konfirmasi Password" ringColor={content.ringColor} onChange={handleChange} value={formData.confirmPassword} />
          </motion.div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl border border-gray-300 font-bold"><ArrowLeft size={18} /></button>}
          {step < 3 ? (
             <button type="button" onClick={() => setStep(step + 1)} className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg ${content.buttonColor}`}>Lanjut</button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 ${content.buttonColor}`}>
              {loading ? <Loader2 className="animate-spin" /> : "Daftar Sekarang"}
            </button>
          )}
        </div>
      </form>
      <div className="mt-8 text-center text-gray-500 text-sm">
        Sudah punya akun? <button onClick={toLogin} className={`font-bold hover:underline ${content.textColor}`}>Login disini</button>
      </div>
    </motion.div>
  );
}

// 5. UTILITY
function InputIcon({ icon: Icon, ringColor, className, ...props }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-3.5 text-gray-400" size={20} />
      <input className={`w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent transition-all font-medium text-sm ${className}`} {...props} />
    </div>
  );
}