// ... import lainnya
import { Inter } from "next/font/google";
import { Navbar, Footer, ScrollToTop } from "@/components";
import "@/styles/globals.css";

// Penting: tambahkan 'variable: "--font-inter"' di sini
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // <--- Ini kuncinya agar terbaca di CSS v4
});

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      {/* Masukkan variabel font ke dalam class body */}
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
