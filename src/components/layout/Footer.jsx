import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        
        {/* --- LOGO & BRAND --- */}
        <Link href="/" className="flex items-center gap-2 group mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <Sparkles size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Talenta<span className="text-blue-600">Ku</span>
          </span>
        </Link>

        {/* --- KETERANGAN WEBSITE --- */}
        <p className="text-gray-500 text-sm leading-relaxed max-w-md mb-10">
          Platform tes minat bakat modern yang dirancang untuk membantumu mengenali potensi diri, 
          memilih jurusan yang tepat, dan merancang karier masa depan dengan percaya diri.
        </p>

        {/* --- COPYRIGHT --- */}
        <div className="w-full border-t border-gray-100 pt-8">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} TalentaKu Indonesia. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}