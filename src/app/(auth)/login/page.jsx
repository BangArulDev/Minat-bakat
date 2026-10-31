
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerGuru, registerSiswa } from "@/app/actions/auth";
import {
  Sparkles,
  User,
  Users,
  Mail,
  Lock,
  ArrowRight,
  Briefcase,
  GraduationCap,
  School,
  Map,
  CheckCircle,
  ArrowLeft,
  Phone,
  Hash,
  Calendar,
  Loader2,
  Compass,
  ShieldCheck,
  X,
} from "lucide-react";

const BRAND = {
  primary: "#6d5cff",
  dark: "#141b3d",
  background: "#f3f6ff",
};

const accountContent = {
  personal: {
    icon: User,
    title: "Kenali Minat, Rencanakan Masa Depan",
    description:
      "Eksplorasi minat karier secara mandiri berdasarkan teori Holland (RIASEC).",
  },
  siswa: {
    icon: GraduationCap,
    title: "Kenali Minat, Rencanakan Masa Depan",
    description:
      "Temukan kecenderungan minat karier melalui asesmen Holland (RIASEC) bersama sekolah Anda.",
  },
  guru: {
    icon: Briefcase,
    title: "Dampingi Perencanaan Karier Siswa",
    description:
      "Kelola peserta dan dukung eksplorasi pendidikan serta karier berdasarkan profil minat Holland (RIASEC).",
  },
};

const inputStyle =
  "w-full rounded-xl border border-slate-200 bg-[#f3f6ff] py-3.5 pl-12 pr-4 text-sm font-medium text-[#141b3d] outline-none transition-all placeholder:text-slate-400 focus:border-[#6d5cff] focus:ring-2 focus:ring-[#6d5cff]/15";

const primaryButton =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d5cff] px-5 py-3.5 text-base font-bold text-white shadow-[0_8px_20px_rgba(109,92,255,0.18)] transition-all hover:bg-[#5847e8] disabled:cursor-not-allowed disabled:opacity-50";

function InputIcon({ icon: Icon, className = "", ...props }) {
  return (
    <div className="relative">
      <Icon
        size={19}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        className={`${inputStyle} ${className}`}
        {...props}
      />
    </div>
  );
}

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      {message}
    </div>
  );
}

function AccountSelector({ value, onChange }) {
  const options = [
    { id: "personal", label: "Personal", icon: User },
    { id: "siswa", label: "Siswa", icon: GraduationCap },
    { id: "guru", label: "Guru", icon: Users },
  ];

  return (
    <div className="mb-9">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
        Pilih Jenis Akun
      </p>

      <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#f3f6ff] p-1.5">
        {options.map((option) => {
          const Icon = option.icon;
          const active = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={active}
              className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-xs font-bold transition-all sm:flex-row sm:text-sm ${
                active
                  ? "bg-white text-[#6d5cff] shadow-sm ring-1 ring-[#6d5cff]/20"
                  : "text-slate-500 hover:bg-white/70"
              }`}
            >
              <Icon size={17} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [authMode, setAuthMode] = useState("login");
  const [userType, setUserType] = useState("siswa");

  const content = accountContent[userType];
  const BannerIcon = content.icon;

  const changeUserType = (type) => {
    setUserType(type);
    setAuthMode("login");
  };

  return (
    <div className="relative grid min-h-screen w-full grid-cols-1 overflow-hidden bg-white lg:grid-cols-2">

      {/* PANEL KIRI - IDENTITAS CARE INDONESIA */}
      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-[#141b3d] via-[#4036a5] to-[#6d5cff] p-10 text-white lg:flex xl:p-14">

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles size={25} />
            </div>

            <div>
              <p className="text-xl font-extrabold tracking-tight">
                Asesmen Minat Karier
              </p>
              <p className="text-xs font-medium text-white/70">
                CARE Indonesia
              </p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={userType}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/15 backdrop-blur">
                <BannerIcon size={38} />
              </div>

              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
                {content.title}
              </h1>

              <p className="max-w-md text-lg leading-relaxed text-white/85">
                {content.description}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium">
                  <Compass size={15} />
                  Holland RIASEC
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium">
                  <ShieldCheck size={15} />
                  CARE Indonesia
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} CARE Indonesia.
            Seluruh hak cipta dilindungi.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[480px] w-[480px] rounded-full bg-[#998cff]/30 blur-3xl" />
      </div>

      {/* PANEL KANAN - AUTENTIKASI */}
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-white px-5 py-16 sm:px-8 lg:px-10">

        <Link
          href="/"
          aria-label="Kembali ke Beranda"
          className="absolute right-6 top-6 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#141b3d]"
        >
          <X size={23} />
        </Link>

        <div className="w-full max-w-md">

          {/* IDENTITAS MOBILE */}
          <div className="mb-9 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6d5cff]/10 text-[#6d5cff]">
              <Compass size={25} />
            </div>

            <h2 className="text-xl font-extrabold text-[#141b3d]">
              Asesmen Minat Karier
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              CARE Indonesia
            </p>
          </div>

          {authMode !== "forgot" && (
            <AccountSelector
              value={userType}
              onChange={changeUserType}
            />
          )}

          <AnimatePresence mode="wait">
            {userType === "personal" && authMode !== "forgot" ? (
              <PersonalNotice key="personal" />
            ) : authMode === "login" ? (
              <LoginForm
                key={`login-${userType}`}
                userType={userType}
                toRegister={() => setAuthMode("register")}
                toForgot={() => setAuthMode("forgot")}
              />
            ) : authMode === "register" && userType === "siswa" ? (
              <RegisterSiswaForm
                key="register-siswa"
                toLogin={() => setAuthMode("login")}
              />
            ) : authMode === "register" && userType === "guru" ? (
              <RegisterGuruForm
                key="register-guru"
                toLogin={() => setAuthMode("login")}
              />
            ) : (
              <ForgotPasswordForm
                key="forgot"
                toLogin={() => setAuthMode("login")}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

// =====================================
// AKUN PERSONAL - BELUM TERINTEGRASI
// =====================================

function PersonalNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="text-center"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6d5cff]/10 text-[#6d5cff]">
        <User size={30} />
      </div>

      <h2 className="text-3xl font-extrabold text-[#141b3d]">
        Akun Personal
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        Akun Personal ditujukan bagi individu yang ingin
        mengikuti Asesmen Minat Karier Holland (RIASEC)
        secara mandiri.
      </p>

      <div className="mt-7 rounded-2xl border border-indigo-100 bg-[#f3f6ff] p-5 text-left">
        <p className="font-bold text-[#141b3d]">
          Fitur sedang disiapkan
        </p>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Pendaftaran dan login Personal akan tersedia
          setelah sistem akun dan kuota asesmen
          terintegrasi.
        </p>
      </div>

      <Link
        href="/#harga-asesmen"
        className="mt-6 inline-flex items-center gap-2 font-semibold text-[#6d5cff] hover:underline"
      >
        Lihat Paket Asesmen
        <ArrowRight size={17} />
      </Link>
    </motion.div>
  );
}

// =====================================
// LOGIN SISWA DAN GURU
// =====================================

function LoginForm({ userType, toRegister, toForgot }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        userType,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Username / Email atau Password salah.");
        return;
      }

      router.push(
        userType === "siswa"
          ? "/siswa/dashboard"
          : "/guru/dashboard"
      );
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-[#141b3d]">
          Selamat Datang
        </h2>

        <p className="mt-3 text-sm text-slate-500">
          {userType === "siswa"
            ? "Masuk ke akun siswa untuk mengakses Asesmen Minat Karier."
            : "Masuk ke akun guru untuk mengelola asesmen peserta."}
        </p>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label
            htmlFor="login-username"
            className="mb-2 block text-sm font-semibold text-[#141b3d]"
          >
            {userType === "siswa"
              ? "Username"
              : "Alamat Email"}
          </label>

          <InputIcon
            id="login-username"
            icon={userType === "siswa" ? User : Mail}
            name="username"
            type={userType === "siswa" ? "text" : "email"}
            placeholder={
              userType === "siswa"
                ? "Masukkan Username"
                : "Masukkan Email"
            }
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block text-sm font-semibold text-[#141b3d]"
          >
            Kata Sandi
          </label>

          <InputIcon
            id="login-password"
            icon={Lock}
            type="password"
            name="password"
            placeholder="Masukkan Kata Sandi"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={toForgot}
            className="text-sm font-semibold text-[#6d5cff] hover:underline"
          >
            Lupa Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={primaryButton}
        >
          {loading ? (
            <>
              <Loader2 size={19} className="animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Masuk Sekarang
              <ArrowRight size={19} />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={toRegister}
          className="font-bold text-[#6d5cff] hover:underline"
        >
          Daftar Gratis
        </button>
      </p>
    </motion.div>
  );
}

// =====================================
// LUPA PASSWORD
// =====================================

function ForgotPasswordForm({ toLogin }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6d5cff]/10 text-[#6d5cff]">
        <Lock size={28} />
      </div>

      <h2 className="text-2xl font-extrabold text-[#141b3d]">
        Bantuan Kata Sandi
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        Untuk bantuan pemulihan akun, hubungi administrator
        CARE Indonesia melalui email resmi.
      </p>

      <a
        href="mailto:admincareindonesia@gmail.com?subject=Bantuan%20Pemulihan%20Akun%20Asesmen%20Minat%20Karier"
        className={`${primaryButton} mt-7`}
      >
        <Mail size={18} />
        Hubungi Administrator
      </a>

      <button
        type="button"
        onClick={toLogin}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#6d5cff] hover:underline"
      >
        <ArrowLeft size={17} />
        Kembali ke Login
      </button>
    </motion.div>
  );
}

// =====================================
// FORM PENDAFTARAN SISWA
// =====================================

function RegisterSiswaForm({ toLogin }) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    kodeKelas: "",
    namaLengkap: "",
    nis: "",
    kotaLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await registerSiswa(formData);

      if (res?.error) {
        setError(res.error);
        return;
      }

      const loginRes = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        userType: "siswa",
        redirect: false,
      });

      if (loginRes?.error || !loginRes) {
        setError(
          "Pendaftaran berhasil. Silakan kembali ke halaman login."
        );
        return;
      }

      router.push("/siswa/dashboard");
      router.refresh();
    } catch {
      setError("Pendaftaran gagal. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="mb-7">
        <h2 className="text-2xl font-extrabold text-[#141b3d]">
          Pendaftaran Siswa
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Buat akun untuk mengikuti Asesmen Minat Karier.
        </p>

        <p className="mt-3 text-right text-xs font-bold text-[#6d5cff]">
          Langkah {step} dari 2
        </p>
      </div>

      <ErrorMessage message={error} />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4"
      >
        {step === 1 && (
          <div className="space-y-4">
            <InputIcon
              icon={Hash}
              name="kodeKelas"
              placeholder="Kode Kelas dari Guru"
              value={formData.kodeKelas}
              onChange={handleChange}
            />

            <InputIcon
              icon={User}
              name="namaLengkap"
              placeholder="Nama Lengkap"
              value={formData.namaLengkap}
              onChange={handleChange}
            />

            <InputIcon
              icon={Hash}
              name="nis"
              type="text"
              inputMode="numeric"
              placeholder="NIS"
              value={formData.nis}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-3">
              <InputIcon
                icon={Map}
                name="kotaLahir"
                placeholder="Kota Lahir"
                value={formData.kotaLahir}
                onChange={handleChange}
              />

              <InputIcon
                icon={Calendar}
                name="tanggalLahir"
                type="date"
                value={formData.tanggalLahir}
                onChange={handleChange}
              />
            </div>

            <GenderSelector
              name="jenisKelamin"
              value={formData.jenisKelamin}
              onChange={handleChange}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <InputIcon
              icon={User}
              name="username"
              placeholder="Buat Username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
            />

            <InputIcon
              icon={Lock}
              name="password"
              type="password"
              placeholder="Kata Sandi Baru"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <InputIcon
              icon={CheckCircle}
              name="confirmPassword"
              type="password"
              placeholder="Konfirmasi Kata Sandi"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-slate-200 px-5 py-3 text-[#141b3d]"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep(2);
              }}
              className={primaryButton}
            >
              Lanjut
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={primaryButton}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          )}
        </div>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={toLogin}
          className="font-bold text-[#6d5cff] hover:underline"
        >
          Login di sini
        </button>
      </p>
    </motion.div>
  );
}

// =====================================
// FORM PENDAFTARAN GURU
// =====================================

function RegisterGuruForm({ toLogin }) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    kodeSekolah: "",
    namaSekolah: "",
    namaLengkap: "",
    nip: "",
    gender: "L",
    whatsapp: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      kodeSekolah:
        "SCH-" +
        Math.random().toString(36).substring(2, 6).toUpperCase(),
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await registerGuru(formData);

      if (res?.error) {
        setError(res.error);
        return;
      }

      const loginRes = await signIn("credentials", {
        username: formData.email,
        password: formData.password,
        userType: "guru",
        redirect: false,
      });

      if (loginRes?.error || !loginRes) {
        setError(
          "Pendaftaran berhasil. Silakan kembali ke halaman login."
        );
        return;
      }

      router.push("/guru/dashboard");
      router.refresh();
    } catch {
      setError("Pendaftaran gagal. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="mb-7">
        <h2 className="text-2xl font-extrabold text-[#141b3d]">
          Pendaftaran Guru
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Daftarkan akun untuk mengelola asesmen siswa.
        </p>

        <p className="mt-3 text-right text-xs font-bold text-[#6d5cff]">
          Langkah {step} dari 3
        </p>
      </div>

      <ErrorMessage message={error} />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4"
      >
        {step === 1 && (
          <div className="space-y-4">
            <InputIcon
              icon={School}
              name="namaSekolah"
              placeholder="Nama Sekolah"
              value={formData.namaSekolah}
              onChange={handleChange}
            />

            <div className="rounded-xl border border-indigo-100 bg-[#f3f6ff] p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Kode Sekolah
              </p>

              <p className="mt-1 font-mono text-lg font-bold text-[#141b3d]">
                {formData.kodeSekolah || "Menyiapkan..."}
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <InputIcon
              icon={User}
              name="namaLengkap"
              placeholder="Nama Lengkap dan Gelar"
              value={formData.namaLengkap}
              onChange={handleChange}
            />

            <InputIcon
              icon={Briefcase}
              name="nip"
              type="text"
              inputMode="numeric"
              placeholder="NIP / NUPTK"
              value={formData.nip}
              onChange={handleChange}
            />

            <GenderSelector
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            />

            <InputIcon
              icon={Phone}
              name="whatsapp"
              type="tel"
              placeholder="Nomor WhatsApp"
              value={formData.whatsapp}
              onChange={handleChange}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <InputIcon
              icon={Mail}
              name="email"
              type="email"
              placeholder="Email Aktif"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            <InputIcon
              icon={Lock}
              name="password"
              type="password"
              placeholder="Kata Sandi"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <InputIcon
              icon={CheckCircle}
              name="confirmPassword"
              type="password"
              placeholder="Konfirmasi Kata Sandi"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep(step - 1);
              }}
              className="rounded-xl border border-slate-200 px-5 py-3 text-[#141b3d]"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep(step + 1);
              }}
              className={primaryButton}
            >
              Lanjut
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={primaryButton}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          )}
        </div>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={toLogin}
          className="font-bold text-[#6d5cff] hover:underline"
        >
          Login di sini
        </button>
      </p>
    </motion.div>
  );
}

// =====================================
// PILIHAN JENIS KELAMIN
// =====================================

function GenderSelector({ name, value, onChange }) {
  const options = [
    { label: "Laki-laki", value: "L" },
    { label: "Perempuan", value: "P" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${
            value === option.value
              ? "border-[#6d5cff] bg-[#6d5cff]/5 text-[#6d5cff]"
              : "border-slate-200 text-slate-600"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            className="accent-[#6d5cff]"
          />

          {option.label}
        </label>
      ))}
    </div>
  );
}
