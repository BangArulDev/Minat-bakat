"use client";
import { motion } from "framer-motion";
import { 
  BrainCircuit, 
  Zap, 
  GraduationCap, 
  Compass, 
  MessageCircleHeart, 
  ShieldCheck 
} from "lucide-react";

// Data Fitur
const featuresData = [
  {
    id: 1,
    title: "Metode Ilmiah Teruji",
    desc: "Menggunakan standar psikologi RIASEC (Holland Code) yang diakui secara internasional untuk akurasi tinggi.",
    icon: BrainCircuit,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "Hasil Instan & Detail",
    desc: "Tidak perlu menunggu berhari-hari. Dapatkan laporan analisis kepribadian lengkap segera setelah tes selesai.",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 3,
    title: "Rekomendasi Kampus",
    desc: "Database ribuan jurusan dan universitas yang dicocokkan langsung dengan profil minat bakatmu.",
    icon: GraduationCap,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 4,
    title: "Roadmap Karier",
    desc: "Panduan langkah demi langkah merancang masa depan, mulai dari pemilihan jurusan hingga profesi impian.",
    icon: Compass,
    color: "bg-red-100 text-red-600",
  },
  {
    id: 5,
    title: "Konsultasi Ahli",
    desc: "Masih bingung dengan hasilnya? Fitur chat dengan konselor pendidikan profesional siap membantumu.",
    icon: MessageCircleHeart,
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: 6,
    title: "Privasi Terjamin",
    desc: "Data hasil tesmu adalah privasimu. Kami menjamin keamanan data dengan enkripsi standar industri.",
    icon: ShieldCheck,
    color: "bg-green-100 text-green-600",
  },
];

export default function Features() {
  // Animasi Container (Mengatur anak-anaknya)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Jeda muncul antar kartu
        delayChildren: 0.2,
      },
    },
  };

  // Animasi Item (Kartu)
  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    },
  };

  return (
    <section id="fitur" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 1 }} // Reset saat keluar layar
            transition={{ duration: 0.5 }}
            className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3"
          >
            Kenapa Memilih Kami?
          </motion.h2>
          
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          >
            Fitur Lengkap untuk <br /> Masa Depanmu
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 text-lg leading-relaxed"
          >
            Kami menggabungkan teknologi modern dan psikologi untuk memberikan pengalaman tes minat bakat terbaik.
          </motion.p>
        </div>

        {/* GRID FITUR */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }} // 20% terlihat -> mulai animasi
        >
          {featuresData.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
            >
              {/* Icon Container */}
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={28} />
              </div>

              {/* Text Content */}
              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h4>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}