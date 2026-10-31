
import AuthPage from "@/components/auth/AuthPage";

export const metadata = {
  title: "Masuk atau Daftar | Asesmen Minat Karier - CARE Indonesia",
  description:
    "Masuk atau daftar akun siswa dan guru untuk mengakses Asesmen Minat Karier berdasarkan teori Holland (RIASEC) yang dikembangkan oleh CARE Indonesia.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f3f6ff]">
      <div className="w-full min-h-screen bg-white lg:overflow-hidden lg:rounded-none">
        <AuthPage />
      </div>
    </main>
  );
}
