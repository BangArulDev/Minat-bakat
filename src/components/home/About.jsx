"use client";
import {
  Wrench,
  Search,
  Paintbrush,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";

const items = [
  { letter: "R", label: "Realistic", desc: "Suka aktivitas praktis dan teknis.", icon: Wrench, card: "bg-green-50", fg: "text-green-900" },
  { letter: "I", label: "Investigative", desc: "Suka menganalisis dan memecahkan masalah.", icon: Search, card: "bg-sky-50", fg: "text-sky-900" },
  { letter: "A", label: "Artistic", desc: "Suka kreativitas dan ekspresi.", icon: Paintbrush, card: "bg-violet-50", fg: "text-violet-900" },
  { letter: "S", label: "Social", desc: "Suka membantu, mengajar, dan berinteraksi.", icon: Users, card: "bg-pink-50", fg: "text-pink-900" },
  { letter: "E", label: "Enterprising", desc: "Suka memimpin, memengaruhi, dan berwirausaha.", icon: BarChart3, card: "bg-orange-50", fg: "text-orange-900" },
  { letter: "C", label: "Conventional", desc: "Suka keteraturan, data, dan administrasi.", icon: FileText, card: "bg-amber-50", fg: "text-amber-900" },
];

export default function About() {
  return (
    <section id="tentang-riasec" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">
        <p className="inline-block rounded-full bg-[#6d5cff]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#6d5cff]">
          TENTANG RIASEC
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141b3d] sm:text-4xl">
          Apa itu Tes RIASEC?
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600">
          Tes RIASEC adalah asesmen minat karier berdasarkan teori John Holland yang memetakan
          kecenderungan minat seseorang ke dalam enam tipe kepribadian dan lingkungan kerja:
          Realistic, Investigative, Artistic, Social, Enterprising, dan Conventional. Hasil tes
          membantu memahami kecocokan jurusan, pekerjaan, dan pengembangan diri.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 text-left sm:grid-cols-3 lg:grid-cols-6">
          {items.map((t) => (
            <div key={t.letter} className={`rounded-2xl p-4 ${t.card}`}>
              <div className="flex items-center gap-2">
                <span className={t.fg}>
                  <t.icon size={28} />
                </span>
                <span>
                  <span className={`block text-lg leading-none font-extrabold ${t.fg}`}>
                    {t.letter}
                  </span>
                  <span className={`block text-xs font-semibold ${t.fg}`}>{t.label}</span>
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}