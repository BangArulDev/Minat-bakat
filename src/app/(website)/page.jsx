
import { About, Features, Hero, Price } from "../../components";
import Pricing from "../../components/home/Pricing";

export default function Home() {
  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen bg-[#f3f6ff]">

      {/* 1. Tampilan Utama Asesmen Minat Karier */}
      <Hero />

      {/* 2. Tentang Holland RIASEC */}
      <About />

      {/* 3. Konsistensi Holland Code */}
      <Features />

      {/* 4. Mengapa Penelusuran Minat Karier */}
      <Price />

      {/* 5. Daftar Harga Asesmen Minat Karier */}
      <Pricing />

    </main>
  );
}
