import { About, Explorasi, FAQ, Hero, HowItWorks, RIASEC, Testimoni } from "@/components";


export default function Home() {
  return (
    <main className="flex flex-col w-full overflow-hidden">
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. About Section */}
      <About />

      {/* 3. Cara Kerja */}
      <HowItWorks />

      {/* 4. Tipe Kepribadian (RIASEC) */}
      <RIASEC />

      {/* 5. Testimoni */}
      <Testimoni />

      {/* 6. QnA / FAQ */}
      <FAQ />

      {/* 7. Explorasi Kampus/Karir */}
      <Explorasi />

    </main>
  );
}