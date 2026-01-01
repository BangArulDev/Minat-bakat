"use client"; // Ini wajib kalau pakai animasi
import { motion } from "framer-motion";

export default function Button({ children, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer"
    >
      {children}
    </motion.button>
  );
}