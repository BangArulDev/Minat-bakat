"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, Search, Palette, Heart, TrendingUp, Clipboard } from "lucide-react";

// 1. Database Mini untuk Konten RIASEC
const riasecData = [
  {
    id: "realistic",
    label: "Realistic",
    icon: Hammer,
    color: "bg-red-100 text-red-600",
    title: "Si Praktisi (The Doers)",
    desc: "Kamu suka bekerja dengan benda, alat, mesin, tanaman, atau hewan. Kamu lebih suka bekerja di luar ruangan dan menggunakan tanganmu daripada duduk di balik meja.",
    traits: ["Praktis", "Mandiri", "Stabil", "Suka Alam"],
    careers: ["Teknik Sipil", "Pertanian", "Otomotif", "Polisi"],
  },
  {
    id: "investigative",
    label: "Investigative",
    icon: Search,
    color: "bg-blue-100 text-blue-600",
    title: "Si Pemikir (The Thinkers)",
    desc: "Kamu suka mengamati, belajar, menyelidiki, menganalisis, mengevaluasi, atau memecahkan masalah. Kamu sangat menghargai ilmu pengetahuan.",
    traits: ["Analitis", "Kritis", "Rasional", "Ingin Tahu"],
    careers: ["Programmer", "Ilmuwan", "Dokter", "Analis Data"],
  },
  {
    id: "artistic",
    label: "Artistic",
    icon: Palette,
    color: "bg-orange-100 text-orange-600",
    title: "Si Kreatif (The Creators)",
    desc: "Kamu memiliki kemampuan artistik, inovatif, dan intuisi yang kuat. Kamu suka bekerja dalam situasi yang tidak terstruktur menggunakan imajinasi.",
    traits: ["Imajinatif", "Ekspresif", "Intuitif", "Bebas"],
    careers: ["Desainer Grafis", "Penulis", "Musisi", "Arsitek"],
  },
  {
    id: "social",
    label: "Social",
    icon: Heart,
    color: "bg-pink-100 text-pink-600",
    title: "Si Penolong (The Helpers)",
    desc: "Kamu suka bekerja dengan orang lain untuk mencerahkan, menginformasikan, menyembuhkan, atau melatih. Kamu sangat peduli pada kesejahteraan orang lain.",
    traits: ["Ramah", "Sabar", "Empati", "Suka Mengajar"],
    careers: ["Guru", "Perawat", "Psikolog", "Konselor"],
  },
  {
    id: "enterprising",
    label: "Enterprising",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-600",
    title: "Si Penggerak (The Persuaders)",
    desc: "Kamu suka bekerja dengan orang lain untuk mempengaruhi, membujuk, memimpin, atau mengelola demi tujuan organisasi atau keuntungan ekonomi.",
    traits: ["Ambisius", "Percaya Diri", "Energik", "Kepemimpinan"],
    careers: ["Pengusaha", "Sales/Marketing", "Pengacara", "Manajer"],
  },
  {
    id: "conventional",
    label: "Conventional",
    icon: Clipboard,
    color: "bg-green-100 text-green-600",
    title: "Si Pengorganisir (The Organizers)",
    desc: "Kamu suka bekerja dengan data, angka, memiliki ketelitian tinggi, dan menyukai struktur atau aturan yang jelas dalam bekerja.",
    traits: ["Teliti", "Teratur", "Efisiensi", "Detail"],
    careers: ["Akuntan", "Admin", "Bankir", "Sekretaris"],
  },
];

export default function RIASEC() {
  // State: Default yang aktif adalah "realistic"
  const [activeTab, setActiveTab] = useState(riasecData[0]);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            6 Tipe Kepribadian (RIASEC)
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Teori John Holland membagi minat karier menjadi enam area. Kamu yang mana?
          </p>
        </div>

        {/* 2. Menu Navigasi Tab */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {riasecData.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
                activeTab.id === item.id
                  ? "bg-black text-white border-black shadow-lg scale-105" // Gaya saat Aktif
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100 hover:border-gray-300" // Gaya saat Tidak Aktif
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 3. Konten yang Berubah-ubah */}
        {/* AnimatePresence memungkinkan animasi saat komponen Keluar/Masuk */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id} // Key penting agar React tahu ini konten baru
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              {/* Kiri: Ikon Besar */}
              <div className={`aspect-square rounded-3xl ${activeTab.color} flex flex-col items-center justify-center p-8`}>
                <activeTab.icon size={120} strokeWidth={1} className="opacity-80" />
              </div>

              {/* Kanan: Penjelasan */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {activeTab.title}
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                  {activeTab.desc}
                </p>

                {/* Sifat Utama */}
                <div className="mb-8">
                  <h4 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">Karakteristik</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeTab.traits.map((trait) => (
                      <span key={trait} className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contoh Karier */}
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">Contoh Karier</h4>
                  <ul className="grid grid-cols-2 gap-2 text-gray-600">
                    {activeTab.careers.map((career) => (
                      <li key={career} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {career}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}