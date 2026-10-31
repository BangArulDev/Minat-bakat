
import AuthPage from "@/components/auth/AuthPage";

export const metadata = {
  title: "Masuk atau Daftar | Asesmen Minat Karier - CARE Indonesia",
  description:
    "Masuk atau daftar akun Personal, Siswa, dan Guru untuk mengakses Asesmen Minat Karier berdasarkan teori Holland (RIASEC) yang dikembangkan oleh CARE Indonesia.",
  keywords: [
    "Asesmen Minat Karier",
    "CARE Indonesia",
    "Holland RIASEC",
    "Login Personal",
    "Login Siswa",
    "Login Guru",
    "Penelusuran Minat Karier",
  ],
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f3f6ff]">
      <div className="min-h-screen w-full bg-white lg:overflow-hidden">
        <AuthPage />
      </div>
    </main>
  );
}
