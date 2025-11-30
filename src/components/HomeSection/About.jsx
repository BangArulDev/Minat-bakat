"use client";
import { motion } from "framer-motion";
import { CheckCircle, ArrowUpRight } from "lucide-react";
import Image from "next/image"; // Kita siapkan import ini

export default function About() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* BAGIAN KIRI: ILUSTRASI GAMBAR */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Hiasan Kotak di Belakang (Biar estetik) */}
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-blue-200 rounded-3xl -z-10" />
            
            {/* Placeholder Gambar */}
            {/* Nanti ganti src="..." dengan gambar aslimu */}
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-xl relative">
               {/* Karena kita belum punya gambar, kita pakai kotak warna sebagai contoh */}
               <div className="w-full h-full bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <span className="text-blue-200 font-bold text-6xl opacity-20">ILUSTRASI</span>
               </div>
               
               {/* Contoh kalau mau pakai gambar asli (Hapus komentar ini nanti):
               <Image 
                 src="/gambar-about.jpg" 
                 alt="Ilustrasi Minat Bakat" 
                 fill 
                 className="object-cover"
               /> 
               */}
            </div>

            {/* Kartu Floating Kecil */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 max-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs font-bold text-gray-500">Akurasi Tinggi</span>
              </div>
              <p className="text-sm font-bold text-gray-800">Mengenali Potensi sejak dini.</p>
            </motion.div>
          </motion.div>


          {/* BAGIAN KANAN: PENJELASAN TEKS */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">
              Tentang Minat & Bakat
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Kenapa Penting Mengenali <br /> Diri Sendiri?
            </h3>
            <p className="text-gray-500 text-lg mb-6 leading-relaxed">
              Banyak orang terjebak di jurusan atau pekerjaan yang salah karena hanya mengikuti tren. 
              Padahal, <strong className="text-gray-900">Minat</strong> adalah apa yang kamu sukai, dan <strong className="text-gray-900">Bakat</strong> adalah kemampuan alamimu.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Minat (Interest)</h4>
                  <p className="text-sm text-gray-500">Ketertarikan kuat terhadap suatu aktivitas yang membuatmu bersemangat.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-purple-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Bakat (Talent)</h4>
                  <p className="text-sm text-gray-500">Potensi bawaan yang membuatmu mudah mempelajari skill tertentu.</p>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all group">
              Baca Selengkapnya 
              <ArrowUpRight className="w-5 h-5 group-hover:-mt-1 group-hover:ml-1 transition-all" />
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}