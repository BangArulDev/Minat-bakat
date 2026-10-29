import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Youtube, Mail } from "lucide-react";

const nav = [
  { label: "Beranda", href: "/" },
  { label: "Tentang RIASEC", href: "#tentang-riasec" },
  { label: "Konsistensi Holland Code", href: "#konsistensi-holland" },
  { label: "Lebih dari Sekadar Tes", href: "#mengapa-talenta" },
];

const social = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Youtube, label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-[#141b3d] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={28} height={28} />
              <span className="text-xl font-extrabold tracking-tight text-white">
                Care Minat Bakat
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed">
              Tes RIASEC untuk membantu siswa memahami minat, bakat, kecocokan jurusan, dan arah
              karier.
            </p>
            <ul className="mt-4 flex gap-2">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href="#"
                    aria-label={s.label}
                    className="inline-block rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <s.icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Halaman">
            <h3 className="text-sm font-bold text-white">Halaman</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {nav.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-bold text-white">Kontak</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-[#6d5cff]">
                  <Mail size={18} />
                </span>
                <a href="mailto:halo@caminatbakat.id" className="transition-colors hover:text-white">
                  halo@caminatbakat.id
                </a>
              </li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          © 2026 Care Minat Bakat. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}