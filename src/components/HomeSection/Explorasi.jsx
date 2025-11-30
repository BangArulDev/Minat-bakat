"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, BookOpen, Briefcase, ArrowRight } from "lucide-react";

const exploreItems = [
  {
    id: 1,
    title: "Cari Kampus",
    desc: "Temukan universitas terbaik di Indonesia maupun luar negeri lengkap dengan info beasiswa.",
    icon: GraduationCap,
    color: "bg-blue-50 text-blue-600",
    hoverBorder: "hover:border-blue-300",
    link: "/kampus",
  },
  {
    id: 2,
    title: "Ensiklopedia Jurusan",
    desc: "Bingung bedanya Teknik Informatika dan Sistem Informasi? Pelajari detail ratusan jurusan di sini.",
    icon: BookOpen,
    color: "bg-purple-50 text-purple-600",
    hoverBorder: "hover:border-purple-300",
    link: "/jurusan",
  },
  {
    id: 3,
    title: "Prospek Karir",
    desc: "Intip masa depanmu. Lihat gaji, jenjang karir, dan skill yang dibutuhkan industri saat ini.",
    icon: Briefcase,
    color: "bg-green-50 text-green-600",
    hoverBorder: "hover:border-green-300",
    link: "/karir",
  },
];

export default function Explorasi() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">
              Database Lengkap
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Eksplorasi Masa Depanmu
            </h3>
            <p className="text-gray-500 mt-4 text-lg">
              Kami telah mengumpulkan data lengkap untuk membantumu merencanakan langkah selanjutnya.
            </p>
          </div>

          {/* Tombol Lihat Semua (Opsional) */}
          <Link href="/explore" className="text-gray-900 font-bold flex items-center gap-2 hover:gap-4 transition-all">
            Lihat Semua Data <ArrowRight size={20} />
          </Link>
        </div>

        {/* Grid Kartu Explorasi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {exploreItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Link href={item.link} className="block h-full">
                <div className={`h-full p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 group ${item.hoverBorder}`}>
                  
                  {/* Header Kartu: Ikon & Arrow */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center`}>
                      <item.icon size={28} />
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all transform group-hover:-rotate-45">
                      <ArrowRight size={18} />
                    </div>
                  </div>

                  {/* Isi Kartu */}
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {item.desc}
                  </p>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}