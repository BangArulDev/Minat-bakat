import { Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Kolom 1: Brand */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-xl mb-4">TalentaKu</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Platform untuk membantu kamu menemukan potensi tersembunyi melalui tes psikologi modern dan analisis minat bakat yang akurat.
            </p>
          </div>

          {/* Kolom 2: Link */}
          <div>
            <h4 className="font-bold mb-4">Menu</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-blue-600">Beranda</a></li>
              <li><a href="#" className="hover:text-blue-600">Tes Minat</a></li>
              <li><a href="#" className="hover:text-blue-600">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-blue-600">Kontak</a></li>
            </ul>
          </div>

          {/* Kolom 3: Sosmed */}
          <div>
            <h4 className="font-bold mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-black transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} TalentaKu Indonesia. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}