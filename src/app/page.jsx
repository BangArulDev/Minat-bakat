import { About, Features, Hero, Price, Process } from "@/components";


export default function Home() {
  return (
    <main className="flex flex-col w-full overflow-hidden">
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. About Section */}
      <About />

      <Features />

      <Price />

    </main>
  );
}