import { About, Features, Hero, Price } from "../../components";


export default function Home() {
  return (
    <main className="flex flex-col w-full overflow-hidden min-h-screen bg-[#f3f6ff]">
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. About RIASEC Section */}
      <About />

      {/* 3. Konsistensi Holland Code */}
      <Features />

      {/* 4. Mengapa Care Minat Bakat */}
      <Price />

    </main>
  );
}