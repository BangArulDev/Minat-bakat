"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Sparkles, ChevronDown } from "lucide-react";
import { ButtonLink } from "..";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Fitur", href: "/#fitur" },
  { name: "Harga", href: "/#harga" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Logika Scroll (Navbar hilang saat scroll ke bawah)
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (isOpen) return;
    if (latest > previous && latest > 150) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={isVisible ? "visible" : "hidden"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* --- BAGIAN KIRI: LOGO --- */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <Sparkles size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Talenta<span className="text-blue-600">Ku</span>
          </span>
        </Link>

        {/* --- BAGIAN TENGAH: NAVIGASI DESKTOP --- */}
        <div className="hidden lg:flex items-center gap-1">
          {/* Link Biasa */}
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-full transition-all"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* --- BAGIAN KANAN: TOMBOL LOGIN --- */}
        <div className="hidden lg:flex items-center gap-4">
           {/* Menggunakan ButtonLink yang sudah Anda buat */}
           <Link href="/login" className="group px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800">
             Daftar
           </Link>
        </div>

        {/* --- TOMBOL HAMBURGER (MOBILE) --- */}
        <button 
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MENU MOBILE --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 overflow-hidden shadow-lg"
          >
            <div className="flex flex-col px-6 py-6 gap-2 max-h-[80vh] overflow-y-auto">
              
              {/* Mobile Links */}
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-gray-600 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Dropdowns (Ditampilkan Terbuka/Flat agar mudah diakses) */}
              {DROPDOWNS.map((dropdown) => (
                <div key={dropdown.label} className="flex flex-col gap-1 mt-2">
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {dropdown.label}
                  </div>
                  {dropdown.items.map((item) => (
                     <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="ml-4 px-4 py-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-l-2 border-transparent hover:border-blue-200"
                     >
                       {item.name}
                     </Link>
                  ))}
                </div>
              ))}

              <hr className="border-gray-100 my-4" />
              
              <div className="px-4 pb-4">
                 <ButtonLink href="/login" variant="primary" className="w-full justify-center">
                    Masuk Sekarang
                 </ButtonLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}