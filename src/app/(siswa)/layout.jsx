"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Menu, 
  UserCircle, 
  LogOut, 
  X,
  Sparkles 
} from "lucide-react";

export default function SiswaLayout({ children }) {
  // --- STATE & LOGIC (Sama persis dengan Guru) ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- MENU NAVIGASI SISWA (Hanya Dashboard) ---
  const navItems = [
    { name: "Dashboard", href: "/siswa/dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* === SIDEBAR === */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? (isSidebarOpen ? "100%" : "0px") : (isSidebarOpen ? "260px" : "80px") 
        }}
        className={`bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300
          ${isMobile ? "fixed inset-0" : "relative"} 
          ${isMobile && !isSidebarOpen ? "hidden" : "flex"}
        `}
      >
        {/* Header Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          {(isSidebarOpen || isMobile) ? (
            <div className="flex items-center gap-2 text-xl font-bold text-gray-900 tracking-tight">
               <Sparkles className="text-blue-600" size={20} />
               <span>Siswa<span className="text-blue-600">Panel</span></span>
            </div>
          ) : (
            <Sparkles className="text-blue-600 mx-auto" size={24} />
          )}

          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)}>
              <X className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center p-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }
                  ${!isSidebarOpen && !isMobile ? "justify-center" : "gap-3"}
                `}
              >
                <item.icon size={22} className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-900"} />
                
                {(isSidebarOpen || isMobile) && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer Sidebar (Logout) */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <Link href="/" className={`flex items-center w-full p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors
             ${!isSidebarOpen && !isMobile ? "justify-center" : "gap-3"}
          `}>
            <LogOut size={22} />
            {(isSidebarOpen || isMobile) && <span className="font-medium">Keluar</span>}
          </Link>
        </div>
      </motion.aside>


      {/* === KONTEN UTAMA === */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header Atas */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={24} />
          </button>

          {/* Profil Siswa */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Ahmad Rizki</p>
              <p className="text-xs text-gray-500">Kelas X MIPA 1</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
              <UserCircle size={28} />
            </div>
          </div>
        </header>

        {/* Area Isi Halaman */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          {children}
        </main>

      </div>
    </div>
  );
}