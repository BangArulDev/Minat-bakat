import AuthPage from "@/components/auth/AuthPage";
import clsx from "clsx";

export const metadata = {
  title: "Masuk atau Daftar - TalentaKu",
  description: "Akses akun siswa atau guru kamu.",
};

export default function LoginPage() {
  return (
    <div className="h-screen flex items-center justify-center">
      <AuthPage />
    </div>
  );
}