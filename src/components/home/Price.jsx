"use client";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

// Data Paket Harga
const plans = [
  {
    id: 1,
    name: "Starter",
    price: "Gratis",
    desc: "Untuk siswa yang ingin mencoba tes minat bakat dasar.",
    quota: "1 Siswa",
    unlimitedClasses: false,
    analysis: "Laporan Dasar",
    features: [
      "Akses Tes RIASEC Dasar",
      "Hasil Garis Besar",
      "Rekomendasi 3 Jurusan",
    ],
    recommended: false,
    color: "border-gray-200",
    btnColor: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  },
  {
    id: 2,
    name: "Pro Student",
    price: "Rp 49.000",
    period: "/tahun",
    desc: "Paket paling populer untuk analisis mendalam dan konsultasi.",
    quota: "1 Siswa",
    unlimitedClasses: true,
    analysis: "Laporan Lengkap + PDF",
    features: [
      "Semua Fitur Starter",
      "Analisis Detail 20 Halaman",
      "Roadmap Karir 5 Tahun",
      "Konsultasi Chat 1x",
    ],
    recommended: true,
    color: "border-blue-500 ring-2 ring-blue-500 shadow-xl", // Highlight
    btnColor: "bg-blue-600 text-white hover:bg-blue-700",
  },
  {
    id: 3,
    name: "Sekolah / Guru",
    price: "Rp 1.500.000",
    period: "/tahun",
    desc: "Solusi lengkap untuk sekolah memetakan minat bakat siswa.",
    quota: "Up to 50 Siswa",
    unlimitedClasses: true,
    analysis: "Dashboard Guru",
    features: [
      "Akses Dashboard Admin",
      "Rekap Data Satu Kelas",
      "Export Data Excel/PDF",
      "Prioritas Support 24/7",
    ],
    recommended: false,
    color: "border-gray-200",
    btnColor: "bg-gray-900 text-white hover:bg-gray-800",
  },
];

export default function Price() {
  // Variabel Animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Kartu muncul bergantian
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    },
  };

  return (
    <section id="harga" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 1 }}
            transition={{ duration: 0.5 }}
            className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3"
          >
            Investasi Masa Depan
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          >
            Pilih Paket Sesuai Kebutuhanmu
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg"
          >
            Transparan, tanpa biaya tersembunyi. Batalkan kapan saja.
          </motion.p>
        </div>

        {/* GRID KARTU HARGA */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }} // Animasi berulang saat scroll
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              className={`relative bg-white rounded-3xl p-8 border ${plan.color} transition-transform hover:-translate-y-2 duration-300 flex flex-col h-full`}
            >
              {/* Badge Populer (Hanya untuk paket Recommended) */}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                  <Sparkles size={14} /> Paling Laris
                </div>
              )}

              {/* Nama & Deskripsi Paket */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <p className="text-gray-500 text-sm leading-relaxed min-h-[40px]">
                  {plan.desc}
                </p>
              </div>

              {/* Harga */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-gray-400 text-sm font-medium">{plan.period}</span>}
              </div>

              {/* Tombol Pilih */}
              <button className={`w-full py-3 rounded-xl font-bold transition-all mb-8 ${plan.btnColor}`}>
                Pilih Paket {plan.name}
              </button>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-8" />

              {/* Fitur Utama (Sesuai Request) */}
              <div className="space-y-4 mb-8 grow">
                {/* Kuota Siswa */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Kuota Siswa</span>
                  <span className="font-bold text-gray-900">{plan.quota}</span>
                </div>

                {/* Unlimited Kelas */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Unlimited Kelas</span>
                  {plan.unlimitedClasses ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <X size={18} className="text-gray-300" />
                  )}
                </div>

                {/* Analisis & Laporan */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Analisis & Laporan</span>
                  <span className="font-bold text-gray-900 text-right max-w-[50%]">{plan.analysis}</span>
                </div>
              </div>

              {/* List Fitur Tambahan */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fitur Lainnya</p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}