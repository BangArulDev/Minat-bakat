"use client";
import { motion } from "framer-motion";
import { ClipboardList, Cpu, Trophy, ArrowRight } from "lucide-react";

// Data langkah-langkahnya (Biar kodenya rapi)
const steps = [
  {
    id: 1,
    title: "Isi Tes Kepribadian",
    desc: "Jawab pertanyaan sederhana tentang apa yang kamu sukai dan tidak kamu sukai. Jujur saja, tidak ada jawaban salah!",
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "Analisis Mendalam",
    desc: "Sistem cerdas kami akan mencocokkan jawabanmu dengan ribuan data karier dan jurusan menggunakan metode RIASEC.",
    icon: Cpu,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 3,
    title: "Dapatkan Hasilnya",
    desc: "Terima laporan lengkap tentang tipe kepribadianmu, rekomendasi kampus, dan prospek karier masa depan.",
    icon: Trophy,
    color: "bg-green-100 text-green-600",
  },
];

export default function HowItWorks() {
  // Variabel animasi untuk container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Muncul satu per satu (selisih 0.3 detik)
      },
    },
  };

  // Variabel animasi untuk tiap item
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Judul */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3"
          >
            Alur Proses
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Hanya 3 Langkah Sederhana
          </motion.h3>
        </div>

        {/* Grid Langkah-Langkah */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Garis Penghubung (Hanya muncul di Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-gray-200 -z-10" />

          {steps.map((step) => (
            <motion.div 
              key={step.id} 
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group text-center relative"
            >
              {/* Tempat Gambar/Ikon */}
              <div className={`w-24 h-24 mx-auto ${step.color} rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner relative z-10`}>
                <step.icon size={40} />
                
                {/* Badge Nomor Kecil */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-white">
                  {step.id}
                </div>
              </div>

              {/* Teks */}
              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h4>
              <p className="text-gray-500 leading-relaxed text-sm">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}