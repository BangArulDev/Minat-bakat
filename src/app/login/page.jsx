import AuthPage from "@/components/AuthPage";

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
