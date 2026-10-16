import { redirect } from "next/navigation";

export default function InstrumenPage() {
  // Halaman instrumen sudah dinonaktifkan untuk Guru
  redirect("/guru/dashboard");
}