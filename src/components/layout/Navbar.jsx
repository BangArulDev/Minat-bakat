
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";

const links = [
  { label: "Beranda", href: "/", active: true },
  { label: "Tentang RIASEC", href: "#tentang-riasec" },
  { label: "Konsistensi", href: "#konsistensi-holland" },
  {
    label: "Mengapa Penelusuran Minat Karier",
    href: "#mengapa-penelusuran-minat-karier",
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 rounded-b-3xl bg-white/95 shadow-[0_1px_24px_rgba(109,92,255,0.08)] backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        
<Link
  href="/"
  className="flex shrink-0 items-center gap-2"
  aria-label="Asesmen Minat Karier"
>
  <Image
    src="/logo.svg"
    alt="Asesmen Minat Karier"
    width={28}
    height={28}
  />
  <span className="text-xl font-extrabold tracking-tight text-[#1b2352]">
    Asesmen Minat Karier
  </span>
</Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                aria-current={l.active ? "page" : undefined}
                className={
                  l.active
                    ? "text-sm font-semibold text-gray-900"
                    : "text-sm text-gray-500 transition-colors hover:text-gray-900"
                }
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Cari">
            <Search size={18} />
          </button>

          <Link
            href="/login"
            className="hidden rounded-lg border border-[#6d5cff] px-4 py-2 text-sm font-medium text-[#6d5cff] transition-colors hover:bg-[#6d5cff]/5 sm:inline-flex"
          >
            Masuk
          </Link>

          <Link
            href="/login"
            className="hidden rounded-lg bg-[#6d5cff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d5cff]/80 sm:inline-flex"
          >
            Daftar
          </Link>

          <button
            className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-gray-100 px-4 pt-2 pb-4 lg:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-2 py-2.5 text-sm ${l.active ? "font-semibold text-gray-900" : "text-gray-500"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex gap-2 sm:hidden">
            <Link href="/login" className="flex-1 rounded-lg border border-[#6d5cff] px-4 py-2 text-center text-sm font-medium text-[#6d5cff] transition-colors hover:bg-[#6d5cff]/5">
              Masuk
            </Link>

            <Link href="/login" className="flex-1 rounded-lg bg-[#6d5cff] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#6d5cff]/80">
              Daftar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
