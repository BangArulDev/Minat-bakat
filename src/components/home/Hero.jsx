"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Wrench,
  Search,
  Paintbrush,
  Users,
  BarChart3,
  FileText,
  ArrowRight,
  PlayCircle,
  GraduationCap,
  Handshake,
} from "lucide-react";

import { cn } from "@/lib/utils";

const types = [
  { letter: "R", label: "Realistic", icon: Wrench, hex: "text-green-200", fg: "text-green-900", pos: "left-1/2 top-0 -translate-x-1/2" },
  { letter: "I", label: "Investigative", icon: Search, hex: "text-blue-200", fg: "text-blue-900", pos: "top-[21%] right-0" },
  { letter: "A", label: "Artistic", icon: Paintbrush, hex: "text-purple-200", fg: "text-purple-900", pos: "right-0 bottom-[21%]" },
  { letter: "S", label: "Social", icon: Users, hex: "text-pink-200", fg: "text-pink-900", pos: "bottom-0 left-1/2 -translate-x-1/2" },
  { letter: "E", label: "Enterprising", icon: BarChart3, hex: "text-orange-200", fg: "text-orange-900", pos: "bottom-[21%] left-0" },
  { letter: "C", label: "Conventional", icon: FileText, hex: "text-amber-200", fg: "text-amber-900", pos: "top-[21%] left-0" },
];

function Hex({ hex, className, children }) {
  return (
    <div className={cn("relative flex items-center justify-center transition-transform hover:scale-105 duration-200", hex, className)}>
      <svg viewBox="0 0 100 112" className="absolute inset-0 h-full w-full pointer-events-none drop-shadow-sm" aria-hidden="true">
        <polygon
          points="50,6 90,29 90,83 50,106 10,83 10,29"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-0.5">
        {children}
      </div>
    </div>
  );
}

const trust = [
  { icon: GraduationCap, text: "Untuk siswa SMP/SMA/SMK" },
  { icon: Handshake, text: "Ilmiah & terpercaya (teori Holland)" },
  { icon: BarChart3, text: "Langkah nyata menuju masa depan" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center">
      {/* Background illustration */}
      <Image
        src="/hero-bg.jpeg"
        alt="Latar belakang tes RIASEC Care Minat Bakat"
        fill
        priority
        className="object-cover object-bottom"
      />

      {/* Main content grid */}
      <div className="relative z-10 mx-auto grid max-w-7xl w-full gap-8 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-14">
        {/* Left Column: Headline, Description, CTAs, Trust items */}
        <div>
          <p className="inline-block rounded-full bg-[#6d5cff]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#6d5cff] backdrop-blur-xs">
            Temukan Arah, Wujudkan Masa Depan
          </p>
          <h1 className="mt-4 text-4xl leading-[1.15] font-extrabold tracking-tight text-[#141b3d] sm:text-5xl lg:text-[46px] xl:text-5xl">
            Kenali Potensi Dirimu dengan <span className="text-[#6d5cff]">Tes RIASEC</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
            Care Minat Bakat membantu siswa memahami minat, bakat, kecocokan jurusan, dan arah karier melalui tes
            RIASEC yang ilmiah, mudah, dan terpercaya.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#6d5cff] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#6d5cff]/25 transition-all hover:bg-[#5b4aee] hover:shadow-lg hover:shadow-[#6d5cff]/35 active:scale-[0.98]"
            >
              Mulai Tes
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#tentang-riasec"
              className="inline-flex items-center gap-2 rounded-xl border border-white/90 bg-white/80 px-6 py-3 text-sm font-semibold text-[#141b3d] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-[0.98]"
            >
              <PlayCircle size={18} className="text-[#6d5cff]" />
              Pelajari RIASEC
            </Link>
          </div>

          <ul className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {trust.map((t) => (
              <li
                key={t.text}
                className="flex items-center gap-2.5 rounded-xl border border-white/80 bg-white/70 p-2.5 text-xs font-medium leading-snug text-slate-700 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md"
              >
                <span className="shrink-0 rounded-lg bg-[#6d5cff]/10 p-1.5 text-[#6d5cff]">
                  <t.icon size={16} />
                </span>
                <span>{t.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: RIASEC Hexagon Ring and Slogan */}
        <div className="relative flex flex-col items-center lg:items-end justify-center min-h-[440px]">
          {/* Handwritten slogan placed cleanly in the open sky without colliding with the ring */}
          <div
            className="hidden md:block absolute -top-12 right-0 lg:right-4 xl:right-8 text-right select-none z-20 pointer-events-none"
            style={{ fontFamily: "var(--font-hand, cursive)" }}
          >
            <p className="text-2xl lg:text-[26px] leading-tight font-semibold text-[#1b2352]">
              Kenali diri
              <br />
              Raih peluang
              <br />
              Buat masa depanmu!
            </p>
          </div>

          {/* Desktop RIASEC Hexagon Ring */}
          <div className="relative hidden h-[350px] w-[320px] md:block select-none mt-14 lg:mt-12 lg:mr-8 xl:mr-12">
            {/* Subtle connecting dotted ring */}
            <svg viewBox="0 0 320 350" className="absolute inset-0 h-full w-full pointer-events-none -z-0 opacity-25" aria-hidden="true">
              <polygon
                points="160,49 277,122 277,227 160,301 43,227 43,122"
                fill="none"
                stroke="#6d5cff"
                strokeWidth="2"
                strokeDasharray="4 6"
              />
            </svg>

            {/* Center RIASEC Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
              <p className="text-2xl font-extrabold tracking-tight text-[#141b3d]">RIASEC</p>
              <p className="mt-1 text-[11px] leading-snug font-medium text-slate-500">
                6 Tipe Kepribadian
                <br />
                6 Arah Potensi
                <br />
                Tak Terbatas
              </p>
            </div>

            {/* 6 Holland Badges in Hexagonal Symmetry */}
            {types.map((t) => (
              <Hex
                key={t.letter}
                hex={t.hex}
                className={cn("absolute h-[98px] w-[86px]", t.pos)}
              >
                <span className={cn("text-lg font-extrabold leading-none", t.fg)}>{t.letter}</span>
                <span className={cn("my-0.5", t.fg)}>
                  <t.icon size={18} />
                </span>
                <span className={cn("px-1 text-center text-[10px] leading-tight font-semibold", t.fg)}>
                  {t.label}
                </span>
              </Hex>
            ))}
          </div>

          {/* Mobile RIASEC Grid */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm md:hidden mt-6">
            {types.map((t) => (
              <Hex key={t.letter} hex={t.hex} className="h-24 w-full">
                <span className={cn("text-base font-extrabold leading-none", t.fg)}>{t.letter}</span>
                <span className={cn("my-0.5", t.fg)}>
                  <t.icon size={16} />
                </span>
                <span className={cn("text-center text-[10px] leading-tight font-semibold", t.fg)}>
                  {t.label}
                </span>
              </Hex>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
