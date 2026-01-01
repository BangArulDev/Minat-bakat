"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Menu,
  UserCircle,
  LogOut,
  Users,
  School,
  X,
  Database,
  GraduationCap,
  FileBarChart,
  Table,
  FileText,
  ShoppingCart,
  Receipt,
  User,
  ChevronDown,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

export default function GuruLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // State untuk menyimpan menu mana yang sedang dibuka (misal: 'analisis')
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const pathname = usePathname();

  // === 1. DATA NAVIGASI (Dikelompokkan) ===
  const navGroups = [
    {
      groupLabel: "Main",
      items: [
        { name: "Dashboard", href: "/guru/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      groupLabel: "Data Master",
      items: [
        { name: "Instrumen", href: "/guru/instrumen", icon: ClipboardList },
        { name: "Kelas", href: "/guru/kelas", icon: School },
        { name: "Siswa", href: "/guru/siswa", icon: Users },
      ],
    },
    {
      groupLabel: "Hasil Bakat Minat",
      items: [
        {
          name: "Analisis Bakat Minat",
          id: "analisis", // ID unik untuk logika buka tutup
          icon: FileBarChart,
          // Ini adalah Sub-Menu (Anak)
          subItems: [
            { name: "Data Hasil Pilihan", href: "/guru/analisis/pilihan" },
            { name: "Profil Individu", href: "/guru/analisis/individu" },
            { name: "Profil Kelompok", href: "/guru/analisis/kelompok" },
            { name: "Data Siswa", href: "/guru/analisis/data-siswa" },
          ],
        },
        { name: "Tabulasi Pilihan", href: "/guru/tabulasi", icon: Table },
        { name: "Cover Laporan", href: "/guru/cover", icon: FileText },
      ],
    },
    {
      groupLabel: "Transaksi",
      items: [
        {
          name: "Pembelian Kuota",
          href: "/guru/beli-kuota",
          icon: ShoppingCart,
        },
        { name: "Daftar Transaksi", href: "/guru/transaksi", icon: Receipt },
      ],
    },
    {
      groupLabel: "Profil",
      items: [
        { name: "Profil Saya", href: "/guru/profil", icon: User },
        { name: "Sekolah", href: "/guru/sekolah", icon: Database },
      ],
    },
  ];

  // === 2. LOGIKA RESIZE LAYAR ===
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

  // Fungsi toggle sub-menu
  const handleSubMenuClick = (menuId) => {
    // Jika sidebar sedang tertutup, buka dulu sidebarnya biar kelihatan anaknya
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      setOpenSubMenu(menuId);
    } else {
      // Toggle buka tutup biasa
      setOpenSubMenu(openSubMenu === menuId ? null : menuId);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* === SIDEBAR === */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile
            ? isSidebarOpen
              ? "50%"
              : "0px"
            : isSidebarOpen
            ? "280px"
            : "80px",
        }}
        className={`bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300
          ${isMobile ? "fixed inset-0" : "relative"} 
          ${isMobile && !isSidebarOpen ? "hidden" : "flex"}
        `}
      >
        {/* Header Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
          {isSidebarOpen || isMobile ? (
            <span className="font-bold text-xl text-blue-600 tracking-tight flex-1">
              Guru<span className="text-gray-900">Panel</span>
            </span>
          ) : (
            <span className="font-bold text-xl text-blue-600 mx-auto">G</span>
          )}
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)}>
              <X className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Menu Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-hide">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Judul Group (Hanya muncul kalau Sidebar Terbuka) */}
              {(isSidebarOpen || isMobile) && (
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {group.groupLabel}
                </p>
              )}

              {/* Loop Item dalam Group */}
              <ul className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  const isActive = pathname === item.href;
                  const hasSubItems = !!item.subItems; // Cek apakah punya anak?
                  const isSubMenuOpen = openSubMenu === item.id;

                  // --- RENDER ITEM YANG PUNYA SUB-MENU ---
                  if (hasSubItems) {
                    return (
                      <li key={itemIndex}>
                        <button
                          onClick={() => handleSubMenuClick(item.id)}
                          className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group
                            ${
                              isSubMenuOpen
                                ? "bg-gray-50 text-gray-900"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }
                            ${
                              !isSidebarOpen && !isMobile
                                ? "justify-center"
                                : "justify-between"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              size={22}
                              className={
                                isSubMenuOpen
                                  ? "text-blue-600"
                                  : "text-gray-400 group-hover:text-blue-600"
                              }
                            />
                            {(isSidebarOpen || isMobile) && (
                              <span className="font-medium text-sm">
                                {item.name}
                              </span>
                            )}
                          </div>

                          {/* Panah Kecil (Chevron) */}
                          {(isSidebarOpen || isMobile) &&
                            (isSubMenuOpen ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            ))}
                        </button>

                        {/* Area Anak Sub-Menu */}
                        <AnimatePresence>
                          {isSubMenuOpen && (isSidebarOpen || isMobile) && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-11 pr-2 space-y-1 pt-1"
                            >
                              {item.subItems.map((sub, subIndex) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <li key={subIndex}>
                                    <Link
                                      href={sub.href}
                                      className={`block py-2 px-3 rounded-lg text-sm transition-colors
                                        ${
                                          isSubActive
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                        }
                                      `}
                                    >
                                      {sub.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  }

                  // --- RENDER ITEM BIASA (TANPA SUB-MENU) ---
                  return (
                    <li key={itemIndex}>
                      <Link
                        href={item.href}
                        className={`flex items-center p-3 rounded-xl transition-all duration-200 group
                          ${
                            isActive
                              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          }
                          ${
                            !isSidebarOpen && !isMobile
                              ? "justify-center"
                              : "gap-3"
                          }
                        `}
                      >
                        <item.icon
                          size={22}
                          className={
                            isActive
                              ? "text-white"
                              : "text-gray-400 group-hover:text-gray-900"
                          }
                        />

                        {(isSidebarOpen || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-medium text-sm whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Garis Pemisah antar Group (Kecuali group terakhir) */}
              {groupIndex !== navGroups.length - 1 &&
                (isSidebarOpen || isMobile) && (
                  <div className="my-4 border-t border-gray-100 mx-3" />
                )}
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <Link
            href="/"
            className={`flex items-center w-full p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors
             ${!isSidebarOpen && !isMobile ? "justify-center" : "gap-3"}
          `}
          >
            <LogOut size={22} />
            {(isSidebarOpen || isMobile) && (
              <span className="font-medium text-sm">Keluar Akun</span>
            )}
          </Link>
        </div>
      </motion.aside>

      {/* === KONTEN UTAMA === */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50">
        {/* Header Atas */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">
                Budi Santoso, S.Pd
              </p>
              <p className="text-xs text-gray-500">Guru BK</p>
            </div>
            <Link href="/guru/profil">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200">
                <UserCircle size={24} />
              </div>
            </Link>
          </div>
        </header>

        {/* Area Isi Halaman */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
