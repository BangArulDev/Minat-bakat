"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

// Data Pertanyaan & Jawaban
const faqs = [
  {
    question: "Apa itu Tes Minat Bakat?",
    answer: "Tes ini adalah alat psikologi yang dirancang untuk membantumu memahami preferensi kerja dan potensi tersembunyi. Hasilnya bukan berupa 'Lulus/Gagal', melainkan peta kepribadian yang cocok dengan karier tertentu.",
  },
  {
    question: "Berapa lama waktu pengerjaannya?",
    answer: "Tes ini dirancang agar cepat dan efisien. Rata-rata pengguna menyelesaikannya dalam waktu 10-15 menit saja. Tidak perlu persiapan khusus, cukup jawab dengan jujur.",
  },
  {
    question: "Apakah hasilnya 100% akurat?",
    answer: "Tidak ada tes psikologi yang 100% mutlak, namun tes ini menggunakan metode RIASEC yang sudah teruji secara ilmiah di seluruh dunia untuk memberikan gambaran yang sangat mendekati potensi aslimu.",
  },
  {
    question: "Apakah tes ini berbayar?",
    answer: "Untuk saat ini, fitur dasar tes minat bakat dapat diakses secara GRATIS. Kami percaya setiap orang berhak mengenali potensinya tanpa halangan biaya.",
  },
  {
    question: "Apa bedanya dengan Tes IQ?",
    answer: "Tes IQ mengukur kecerdasan intelektual (logika, angka, bahasa), sedangkan Tes Minat Bakat mengukur preferensi dan kecenderungan kepribadian. IQ melihat 'Seberapa pintar kamu', Minat Bakat melihat 'Apa yang kamu sukai'.",
  },
];

export default function FAQ() {
  // State untuk menyimpan nomor laci mana yang sedang terbuka
  // null artinya semua laci tertutup
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    // Kalau laci yang diklik sudah terbuka, tutup (set jadi null).
    // Kalau belum, buka laci tersebut (set jadi index).
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <MessageCircleQuestion className="text-blue-600" size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pertanyaan Umum
          </h2>
          <p className="text-gray-500">
            Masih bingung? Berikut adalah jawaban dari pertanyaan yang paling sering ditanyakan teman-temanmu.
          </p>
        </div>

        {/* List FAQ */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:border-blue-300"
            >
              {/* Tombol Pertanyaan (Header Laci) */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className={`font-bold text-lg transition-colors ${openIndex === index ? "text-blue-600" : "text-gray-800"}`}>
                  {faq.question}
                </span>
                
                {/* Ikon Panah yang Berputar */}
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }} // Putar 180 derajat kalau aktif
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="text-gray-400" />
                </motion.div>
              </button>

              {/* Isi Jawaban (Isi Laci) */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}