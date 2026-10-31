
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, ExternalLink } from "lucide-react";

// Navigasi halaman Asesmen Minat Karier
const nav = [
  {
    label: "Beranda",
    href: "/",
  },
  {
    label: "Tentang RIASEC",
    href: "/#tentang-riasec",
  },
  {
    label: "Konsistensi Holland Code",
    href: "/#konsistensi-holland",
  },
  {
    label: "Mengapa Penelusuran Minat Karier",
    href: "/#mengapa-penelusuran-minat-karier",
  },
];

// Informasi dan Kebijakan CARE Indonesia
const policies = [
  {
    label: "Syarat dan Ketentuan",
    href: "https://care-indonesia.com/terms",
  },
  {
    label: "Kebijakan Refund",
    href: "https://care-indonesia.com/refund",
  },
  {
    label: "FAQ - Pertanyaan yang Sering Diajukan",
    href: "https://care-indonesia.com/faq",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#141b3d] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">

        {/* Konten Utama Footer */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Identitas Aplikasi */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Asesmen Minat Karier"
            >
              <Image
                src="/logo.svg"
                alt="Logo Asesmen Minat Karier"
                width={32}
                height={32}
              />

              <span className="text-xl font-extrabold tracking-tight text-white">
                Asesmen Minat Karier
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Asesmen minat karier berdasarkan teori Holland
              (RIASEC) untuk membantu individu mengenali
              kecenderungan minat vokasional, mengeksplorasi
              pilihan pendidikan, dan merencanakan arah karier.
            </p>

            <div className="mt-5">
              <p className="text-sm font-semibold text-white">
                Dikembangkan oleh
              </p>

              <a
                href="https://care-indonesia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#a9a0ff] transition-colors hover:text-white"
              >
                CARE Indonesia
                <ExternalLink size={14} />
              </a>

              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Counseling, Assessment, Research and Education Center
              </p>
            </div>
          </div>

          {/* Navigasi Halaman */}
          <nav aria-label="Navigasi Footer">
            <h3 className="text-sm font-bold text-white">
              Halaman
            </h3>

            <ul className="mt-4 space-y-3 text-sm">
              {nav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Informasi dan Kebijakan */}
          <nav aria-label="Informasi dan Kebijakan">
            <h3 className="text-sm font-bold text-white">
              Informasi & Kebijakan
            </h3>

            <ul className="mt-4 space-y-3 text-sm">
              {policies.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1 transition-colors hover:text-white"
                  >
                    <span>{item.label}</span>
                    <ExternalLink
                      size={13}
                      className="mt-0.5 shrink-0"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontak CARE Indonesia */}
          <div>
            <h3 className="text-sm font-bold text-white">
              Kontak CARE Indonesia
            </h3>

            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-2">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-[#a9a0ff]"
                />

                <a
                  href="mailto:admincareindonesia@gmail.com"
                  className="break-all transition-colors hover:text-white"
                >
                  admincareindonesia@gmail.com
                </a>
              </li>

              <li className="flex items-start gap-2">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-[#a9a0ff]"
                />

                <span>
                  Wonosalam, Demak,
                  Jawa Tengah, Indonesia
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Hak Cipta */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-slate-400 md:flex-row md:text-left">

            <p>
              © {new Date().getFullYear()} CARE Indonesia.
              Seluruh hak cipta dilindungi.
            </p>

            <p>
              Asesmen Minat Karier Holland (RIASEC)
            </p>

          </div>
        </div>

      </div>
    </footer>
  );
}
