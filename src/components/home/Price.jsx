
"use client";

import { Target, GraduationCap, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Target,
    tile: "bg-blue-50 text-blue-600",
    title: "Mengenali Minat Karier",
    desc: "Mengidentifikasi kecenderungan minat individu berdasarkan enam tipe kepribadian vokasional Holland (RIASEC), yaitu Realistic, Investigative, Artistic, Social, Enterprising, dan Conventional.",
  },
  {
    icon: GraduationCap,
    tile: "bg-indigo-50 text-indigo-600",
    title: "Mendukung Perencanaan Pendidikan",
    desc: "Memberikan gambaran mengenai bidang studi dan pilihan jurusan yang dapat dipertimbangkan berdasarkan profil minat karier individu.",
  },
  {
    icon: TrendingUp,
    tile: "bg-rose-50 text-rose-600",
    title: "Mengarahkan Eksplorasi Karier",
    desc: "Membantu individu mengeksplorasi lingkungan kerja dan alternatif pilihan karier yang selaras dengan kecenderungan minat, karakteristik pribadi, serta aspirasi masa depan.",
  },
];

export default function Price() {
  return (
    <section
      id="mengapa-penelusuran-minat-karier"
      className="scroll-mt-16 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">

        {/* Judul Bagian */}
        <p className="inline-block rounded-full bg-[#6d5cff]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#6d5cff]">
          Mengapa Penelusuran Minat Karier?
        </p>

        {/* Judul Utama */}
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141b3d] sm:text-4xl">
          Kenali Minat, Rencanakan Masa Depan
        </h2>

        {/* Deskripsi Utama */}
        <p className="mx-auto mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600">
          Penelusuran minat karier berdasarkan teori Holland (RIASEC)
          membantu individu memahami kecenderungan minat vokasional,
          mengeksplorasi pilihan pendidikan, serta merencanakan arah
          karier secara lebih terarah sesuai dengan karakteristik dirinya.
        </p>

        {/* Kartu Manfaat */}
        <div className="mt-8 rounded-3xl p-4 sm:p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-5 text-left shadow-sm"
              >
                <span
                  className={`inline-block rounded-xl p-2.5 ${f.tile}`}
                >
                  <f.icon size={26} />
                </span>

                <h3 className="mt-4 text-base font-extrabold text-[#141b3d]">
                  {f.title}
                </h3>

                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
