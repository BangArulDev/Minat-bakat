"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Pantau posisi scroll pengguna
  useEffect(() => {
    const toggleVisibility = () => {
      // Tombol muncul jika pengguna sudah scroll lebih dari 400px (kira-kira tinggi Hero)
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Bersihkan listener saat komponen dilepas
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Fungsi untuk scroll mulus ke paling atas (Hero Section)
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }} // Muncul dari bawah kecil
          animate={{ opacity: 1, scale: 1, y: 0 }}    // Ukuran normal
          exit={{ opacity: 0, scale: 0.5, y: 20 }}    // Hilang mengecil ke bawah
          whileHover={{ scale: 1.1 }}                 // Membesar saat di-hover
          whileTap={{ scale: 0.9 }}                   // Mengecil saat diklik
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 p-3.5 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors focus:outline-none border-2 border-white/20 backdrop-blur-sm cursor-pointer"
          aria-label="Kembali ke atas"
        >
          <ArrowUp size={24} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}