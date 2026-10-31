
"use client";

import {
  Users,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

// Daftar Harga Resmi Asesmen Minat Karier
const packages = [
  {
    name: "PERSONAL",
    quota: 1,
    price: 15000,
  },
  {
    name: "SPARK",
    quota: 35,
    price: 110000,
  },
  {
    name: "RISE",
    quota: 100,
    price: 140000,
  },
  {
    name: "PRIME",
    quota: 150,
    price: 185000,
  },
  {
    name: "ADVANCE",
    quota: 300,
    price: 260000,
  },
  {
    name: "GROW",
    quota: 500,
    price: 440000,
  },
  {
    name: "PRESTIGE",
    quota: 650,
    price: 540000,
  },
  {
    name: "PROFESSIONAL",
    quota: 1000,
    price: 830000,
  },
  {
    name: "ULTIMATE",
    quota: 1500,
    price: 980000,
  },
  {
    name: "ACADEMY",
    quota: 3000,
    price: 1400000,
  },
  {
    name: "REGIONAL",
    quota: 5000,
    price: 2400000,
  },
  {
    name: "ENTERPRISE",
    quota: 12500,
    price: 4800000,
  },
  {
    name: "ENTERPRISE MAX",
    quota: 15000,
    price: 5900000,
  },
];

// Format angka Rupiah
const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format kuota peserta
const formatNumber = (value) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

export default function Pricing() {
  return (
    <section
      id="harga-asesmen"
      className="scroll-mt-20 bg-[#f3f6ff] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#6d5cff]/10 px-4 py-2 text-xs font-bold tracking-wide text-[#6d5cff]">
            <Sparkles size={15} />
            PAKET ASESMEN MINAT KARIER
          </div>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#141b3d] sm:text-4xl">
            Pilih Paket Sesuai Kebutuhan
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Tersedia berbagai pilihan paket Asesmen Minat Karier
            Holland (RIASEC) untuk kebutuhan individu, sekolah,
            lembaga pendidikan, dan institusi.
          </p>
        </div>

        {/* Informasi Singkat */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
            <ShieldCheck size={16} className="text-[#6d5cff]" />
            Harga Resmi
          </div>

          <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
            <Users size={16} className="text-[#6d5cff]" />
            Pilihan Kuota Peserta
          </div>

          <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
            <GraduationCap size={16} className="text-[#6d5cff]" />
            Berbasis Holland RIASEC
          </div>
        </div>

        {/* Daftar Kartu Harga */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_4px_20px_rgba(20,27,61,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#6d5cff]/40 hover:shadow-[0_14px_35px_rgba(109,92,255,0.13)]"
            >

              {/* Hiasan */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#6d5cff]/5 transition-transform duration-300 group-hover:scale-125" />

              {/* Nama Paket */}
              <div className="relative">
                <div className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold tracking-wide text-[#6d5cff]">
                  {pkg.name}
                </div>

                <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Harga Resmi
                </p>

                {/* Harga */}
                <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#141b3d] sm:text-[27px]">
                  {formatRupiah(pkg.price)}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Per paket asesmen
                </p>
              </div>

              {/* Pemisah */}
              <div className="my-5 h-px w-full bg-slate-100" />

              {/* Informasi Kuota */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6d5cff]/10 text-[#6d5cff]">
                  <Users size={22} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Kuota Asesmen
                  </p>

                  <p className="text-base font-bold text-[#141b3d]">
                    {formatNumber(pkg.quota)} Peserta
                  </p>
                </div>
              </div>

              {/* Rincian */}
              <div className="mt-6 flex flex-1 flex-col gap-3">
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[#6d5cff]"
                  />
                  <span>
                    Asesmen Minat Karier RIASEC
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[#6d5cff]"
                  />
                  <span>
                    Kuota sesuai paket
                  </span>
                </div>
              </div>

              {/* Tombol Pemesanan */}
              <a
                href="https://care-indonesia.com/#contact"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Konsultasikan paket ${pkg.name}`}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d5cff] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#5847e8] hover:shadow-md"
              >
                Pilih Paket
                <ArrowUpRight size={17} />
              </a>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
