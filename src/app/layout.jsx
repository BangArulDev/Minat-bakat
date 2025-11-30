import { Inter } from "next/font/google";
import "./globals.css";
import { Footer, Navbar } from "@/components";

// Kita pakai font 'Inter' karena sangat mudah dibaca (UX Tinggi)
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TalentaKu - Temukan Minat Bakatmu",
  description: "Platform tes minat bakat minimalis untuk masa depanmu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Navbar dipasang di paling atas */}
        <Navbar />
        
        {/* Children adalah isi halaman (Home, About, dll) */}
        {/* Kita beri 'pt-20' (padding-top) agar konten tidak tertutup Navbar yang fixed */}
        <main className="pt-20 min-h-screen">
          {children}
        </main>

        {/* Footer dipasang di paling bawah */}
        <Footer />
      </body>
    </html>
  );
}