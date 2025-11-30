"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

// Data Pura-pura (Mockup) Testimoni Pengguna
const reviews = [
  {
    id: 1,
    name: "Sarah Amalia",
    role: "Siswa SMA Kelas 12",
    content: "Awalnya bingung mau ambil jurusan apa kuliah nanti. Setelah ikut tes di sini, aku jadi yakin ambil DKV karena ternyata skor Artistic aku tinggi banget!",
    rating: 5,
    initial: "S",
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: 2,
    name: "Rudi Hartono",
    role: "Mahasiswa Tingkat Akhir",
    content: "Platform ini sangat membantu untuk validasi passion. Desainnya simpel, tidak bikin pusing, dan hasilnya sangat detail menjelaskan kekuatan saya.",
    rating: 5,
    initial: "R",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    name: "Bu Indah",
    role: "Guru BK",
    content: "Saya sering merekomendasikan website ini ke murid-murid saya. Fitur RIASEC-nya sangat akurat dan mudah dipahami oleh anak-anak sekolah.",
    rating: 4, // Bintang 4 biar terlihat jujur/realistis
    initial: "I",
    color: "bg-green-100 text-green-600",
  },
];

export default function Testimoni() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      
      {/* Hiasan Latar Belakang (Quote Besar Samar) */}
      <div className="absolute top-10 left-10 text-gray-100 -z-10">
        <Quote size={200} />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3"
          >
            Kata Mereka
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Cerita Sukses Pengguna
          </motion.h3>
        </div>

        {/* Grid Kartu Testimoni */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }} // Animasi bergantian (Stagger)
              className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-blue-200 transition-colors relative group"
            >
              {/* Ikon Quote Kecil */}
              <Quote className="absolute top-8 right-8 text-gray-300 w-8 h-8 group-hover:text-blue-200 transition-colors" />

              {/* Bintang Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} 
                  />
                ))}
              </div>

              {/* Isi Review */}
              <p className="text-gray-600 leading-relaxed mb-8 italic">
                "{review.content}"
              </p>

              {/* Profil User */}
              <div className="flex items-center gap-4">
                {/* Avatar Inisial (Biar gak ribet cari gambar) */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${review.color}`}>
                  {review.initial}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}