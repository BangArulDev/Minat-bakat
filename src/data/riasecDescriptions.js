// Deskripsi lengkap setiap tipe Holland RIASEC
// Digunakan di halaman hasil tes

import { Wrench, FlaskConical, Palette, HeartHandshake, Briefcase, Calculator } from "lucide-react";

export const riasecDescriptions = {
  R: {
    name: "Realistic",
    label: "Realistis",
    color: "#ef4444",
    colorLight: "#fef2f2",
    emoji: "🔧",
    icon: Wrench,
    shortDesc: "Praktis & Teknis",
    description:
      "Kamu menyukai aktivitas fisik dan pekerjaan nyata yang menghasilkan sesuatu. Kamu lebih suka bekerja dengan tangan, alat, mesin, atau benda konkret daripada duduk di meja. Kamu memiliki keterampilan teknis dan mekanik yang baik.",
    keywords: ["Praktis", "Mekanik", "Teknis", "Fisik", "Terampil", "Konkret"],
    careers: [
      "Engineer / Insinyur",
      "Teknisi Mesin",
      "Arsitek",
      "Pilot",
      "Ahli Robotika",
      "Teknisi Elektronik",
    ],
  },
  I: {
    name: "Investigative",
    label: "Investigatif",
    color: "#8b5cf6",
    colorLight: "#f5f3ff",
    emoji: "🔬",
    icon: FlaskConical,
    shortDesc: "Analitis & Ilmiah",
    description:
      "Kamu senang berpikir, menganalisis, dan memecahkan masalah. Kamu tertarik pada ilmu pengetahuan, data, dan penelitian. Kamu lebih suka mengamati, belajar, dan menyelidiki daripada bertindak langsung.",
    keywords: ["Analitis", "Intelektual", "Ilmiah", "Presisi", "Kritis", "Penyelidik"],
    careers: [
      "Peneliti / Ilmuwan",
      "Dokter",
      "Data Scientist",
      "Ahli Biologi",
      "Ahli Farmasi",
      "Analis Riset",
    ],
  },
  A: {
    name: "Artistic",
    label: "Artistik",
    color: "#f59e0b",
    colorLight: "#fffbeb",
    emoji: "🎨",
    icon: Palette,
    shortDesc: "Kreatif & Ekspresif",
    description:
      "Kamu memiliki jiwa kreatif dan suka mengekspresikan diri melalui seni, desain, musik, atau tulisan. Kamu menyukai kebebasan, orisinalitas, dan lingkungan yang tidak terlalu terstruktur.",
    keywords: ["Kreatif", "Imajinatif", "Ekspresif", "Orisinal", "Independen", "Artistik"],
    careers: [
      "Desainer Grafis",
      "Musisi",
      "Penulis / Jurnalis",
      "Animator",
      "Fotografer",
      "Arsitek Interior",
    ],
  },
  S: {
    name: "Social",
    label: "Sosial",
    color: "#10b981",
    colorLight: "#ecfdf5",
    emoji: "🤝",
    icon: HeartHandshake,
    shortDesc: "Suka Membantu & Mengajar",
    description:
      "Kamu senang berinteraksi, membantu, mengajar, dan membimbing orang lain. Kamu memiliki empati tinggi dan kemampuan komunikasi yang baik. Kamu paling bersemangat saat bisa membuat perbedaan positif bagi orang lain.",
    keywords: ["Empatik", "Komunikatif", "Peduli", "Membantu", "Sabar", "Ramah"],
    careers: [
      "Guru / Dosen",
      "Psikolog / Konselor",
      "Pekerja Sosial",
      "Perawat",
      "HRD",
      "Terapis",
    ],
  },
  E: {
    name: "Enterprising",
    label: "Enterprising",
    color: "#3b82f6",
    colorLight: "#eff6ff",
    emoji: "💼",
    icon: Briefcase,
    shortDesc: "Pemimpin & Persuasif",
    description:
      "Kamu suka memimpin, memengaruhi, dan meyakinkan orang lain. Kamu ambisius, percaya diri, dan berani mengambil risiko. Kamu tertarik pada dunia bisnis, manajemen, dan kewirausahaan.",
    keywords: ["Ambisius", "Persuasif", "Kompetitif", "Energik", "Percaya Diri", "Pemimpin"],
    careers: [
      "Pengusaha / CEO",
      "Manajer",
      "Marketing Manager",
      "Pengacara",
      "Sales Executive",
      "Event Organizer",
    ],
  },
  C: {
    name: "Conventional",
    label: "Konvensional",
    color: "#06b6d4",
    colorLight: "#ecfeff",
    emoji: "📊",
    icon: Calculator,
    shortDesc: "Terstruktur & Terorganisir",
    description:
      "Kamu menyukai pekerjaan yang terstruktur, teratur, dan detail. Kamu teliti, terorganisir, dan suka bekerja dengan data, angka, atau dokumen. Kamu lebih nyaman dengan sistem dan prosedur yang jelas.",
    keywords: ["Teliti", "Terorganisir", "Sistematis", "Detail", "Akurat", "Terstruktur"],
    careers: [
      "Akuntan",
      "Analis Keuangan",
      "Administrator",
      "Auditor",
      "Data Entry Specialist",
      "Staf Perpajakan",
    ],
  },
};

// Urutan default hexagonal RIASEC
export const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"];

// Matriks konsistensi Holland
// Pasangan yang berdekatan di hexagon = Tinggi, selisih 1 = Sedang, berlawanan = Rendah
export const consistencyMatrix = {
  R: { R: 3, I: 3, A: 1, S: 1, E: 2, C: 3 },
  I: { R: 3, I: 3, A: 3, S: 1, E: 1, C: 2 },
  A: { R: 1, I: 3, A: 3, S: 3, E: 1, C: 2 },
  S: { R: 1, I: 1, A: 3, S: 3, E: 3, C: 2 },
  E: { R: 2, I: 1, A: 1, S: 3, E: 3, C: 3 },
  C: { R: 3, I: 2, A: 2, S: 1, E: 3, C: 3 },
};
