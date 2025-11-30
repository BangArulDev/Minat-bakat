"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Status: Apakah navbar terlihat?

  // 1. Panggil "Mata-mata" Scroll
  const { scrollY } = useScroll();

  // 2. Pasang logika pendeteksi arah scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    
    // Jika sedang buka menu di HP, jangan sembunyikan navbar
    if (isOpen) return;

    if (latest > previous && latest > 150) {
      // Kalau scroll ke BAWAH dan sudah melewati 150px
      setIsVisible(false); // Sembunyi!
    } else {
      // Kalau scroll ke ATAS
      setIsVisible(true); // Muncul!
    }
  });

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Tes Minat", href: "/tes" },
    { name: "Artikel", href: "/artikel" },
    { name: "Tentang", href: "/tentang" },
  ];

  return (
    <motion.nav
      // 3. Ini Animasinya:
      variants={{
        visible: { y: 0 },         // Posisi normal
        hidden: { y: "-100%" },    // Geser ke atas sampai hilang
      }}
      animate={isVisible ? "visible" : "hidden"} // Berubah sesuai status
      transition={{ duration: 0.35, ease: "easeInOut" }} // Kecepatan animasi
      
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>Talenta<span className="text-blue-600">Ku</span></span>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="/login"
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Masuk
          </Link>
        </div>

        {/* Tombol Hamburger HP */}
        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-600 font-medium hover:text-blue-600 block py-2"
                >
                  {link.name}
                </Link>
              ))}
              <hr />
              <Link 
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-center w-full py-3 bg-gray-100 rounded-lg font-bold text-sm"
              >
                Masuk Akun
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}