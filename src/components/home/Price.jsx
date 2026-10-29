"use client";
import { Target, GraduationCap, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Target,
    tile: "bg-blue-50 text-blue-600",
    title: "Memahami minat dominan",
    desc: "Kenali kekuatan dan potensi unik dalam dirimu.",
  },
  {
    icon: GraduationCap,
    tile: "bg-indigo-50 text-indigo-600",
    title: "Rekomendasi jurusan",
    desc: "Dapatkan saran jurusan yang sesuai dengan hasil tes.",
  },
  {
    icon: TrendingUp,
    tile: "bg-rose-50 text-rose-600",
    title: "Arah karier lebih terarah",
    desc: "Jelajahi peluang karier yang sesuai dengan minat dan bakatmu.",
  },
];

export default function Price() {
  return (
    <section id="mengapa-talenta" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">
        <p className="inline-block rounded-full bg-[#6d5cff]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#6d5cff]">
          Mengapa Care Minat Bakat?
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141b3d] sm:text-4xl">
          Lebih dari Sekadar Tes
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600">
          Care Minat Bakat hadir untuk membantumu mengenali diri, merencanakan pendidikan, dan
          menyiapkan masa depan.
        </p>

        <div className="mt-8 rounded-3xl p-4 sm:p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white p-5 text-left shadow-sm">
                <span className={`inline-block rounded-xl p-2.5 ${f.tile}`}>
                  <f.icon size={26} />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-[#141b3d]">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}