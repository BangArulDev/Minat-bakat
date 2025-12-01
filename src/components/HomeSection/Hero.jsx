"use client";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "..";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20">
      
      {/* 1. Hiasan Latar Belakang (Gradient Blur) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-50 -z-10" />

      <div className="max-w-4xl mx-auto px-6 text-center">
        
        {/* 2. Badge Kecil di Atas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6"
        >
          <Sparkles size={14} />
          <span>Kenali Potensi Dirimu Sekarang</span>
        </motion.div>

        {/* 3. Judul Besar (Headline) */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6"
        >
          Temukan Arah <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
            Masa Depanmu
          </span>
        </motion.h1>

        {/* 4. Deskripsi Pendek */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Jangan biarkan bakatmu terpendam. Ikuti tes psikologi modern kami untuk memetakan karier, jurusan, dan hobi yang paling sesuai dengan kepribadian unikmu.
        </motion.p>

        {/* 5. Tombol Aksi (CTA) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Tombol Utama */}
          <ButtonLink href="/tes">
            Mulai Tes Sekarang
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </ButtonLink>
          
          {/* Tombol Kedua */}
          <ButtonLink
            href="/about" 
            variant="outline"
          >
            Pelajari Lebih Lanjut
          </ButtonLink>
        </motion.div>

        {/* 6. Social Proof Kecil (Opsional - Biar lebih meyakinkan) */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="mt-12 text-sm text-gray-400"
        >
          Dipercaya oleh 10.000+ Siswa di Indonesia
        </motion.div>

      </div>
    </section>
  );
}