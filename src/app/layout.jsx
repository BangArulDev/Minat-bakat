import { Inter, Figtree, Caveat } from "next/font/google";
import "@/styles/globals.css"
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata = {
  title: "Care Minat Bakat — Temukan Potensi Dirimu",
  description: "Tes RIASEC untuk membantu siswa memahami minat, bakat, kecocokan jurusan, dan arah karier.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className="scroll-smooth">
      <body className={`${inter.variable} ${figtree.variable} ${caveat.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}