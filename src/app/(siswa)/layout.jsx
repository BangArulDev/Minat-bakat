
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";

import {
  LayoutDashboard,
  Menu,
  UserCircle,
  LogOut,
  X,
  Sparkles,
  ClipboardList,
  Trophy,
  ChevronDown,
} from "lucide-react";

export default function SiswaLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userName = session?.user?.name || "Siswa";

  // ============================================
  // RESPONSIVE SIDEBAR
  // ============================================

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ============================================
  // TUTUP MENU SETELAH BERPINDAH HALAMAN
  // ============================================

  useEffect(() => {
    setIsProfileOpen(false);

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // ============================================
  // FUNGSI LOGOUT
  // ============================================

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setIsProfileOpen(false);

    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    } catch (error) {
      console.error("Gagal logout:", error);
      setIsLoggingOut(false);
      alert("Gagal keluar akun. Silakan coba lagi.");
    }
  };

  // ============================================
  // MENU NAVIGASI SISWA
  // ============================================

  const navItems = [
    {
      name: "Dashboard",
      href: "/siswa/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Tes RIASEC",
      href: "/siswa/tes-riasec",
      icon: ClipboardList,
    },
    {
      name: "Hasil Tes",
      href: "/siswa/hasil-riasec",
      icon: Trophy,
    },
  ];

  // ============================================
  // TAMPILAN LAYOUT
  // ============================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f3f6ff]">

      {/* OVERLAY MOBILE */}

      {isMobile && isSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40"
        />
      )}

      {/* SIDEBAR */}

      <motion.aside
        initial={false}
        animate={{
          width: isMobile
            ? isSidebarOpen
              ? "min(85vw, 280px)"
              : "0px"
            : isSidebarOpen
            ? "260px"
            : "80px",
        }}
        transition={{
          duration: 0.2,
        }}
        className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-sm ${
          isMobile
            ? "fixed inset-y-0 left-0 z-50"
            : "relative z-20"
        }`}
      >

        {/* HEADER SIDEBAR */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-5">

          {isSidebarOpen ? (
            <div className="flex items-center gap-2 whitespace-nowrap text-xl font-bold tracking-tight text-gray-900">
              <Sparkles
                className="text-blue-600"
                size={22}
              />

              <span>
                Siswa
                <span className="text-blue-600">
                  Panel
                </span>
              </span>
            </div>
          ) : (
            <Sparkles
              className="mx-auto text-blue-600"
              size={25}
            />
          )}

          {isMobile && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Tutup sidebar"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* NAVIGASI */}

        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-6">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={
                  !isSidebarOpen
                    ? item.name
                    : undefined
                }
                onClick={() => {
                  if (isMobile) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`group flex items-center rounded-xl p-3 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                } ${
                  isSidebarOpen
                    ? "gap-3"
                    : "justify-center"
                }`}
              >
                <Icon
                  size={22}
                  className={`shrink-0 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-blue-600"
                  }`}
                />

                {isSidebarOpen && (
                  <span className="whitespace-nowrap text-sm font-semibold">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT SIDEBAR */}

        <div className="shrink-0 border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={
              !isSidebarOpen
                ? "Keluar Akun"
                : undefined
            }
            className={`flex w-full items-center rounded-xl p-3 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 ${
              isSidebarOpen
                ? "gap-3"
                : "justify-center"
            }`}
          >
            <LogOut
              size={22}
              className="shrink-0"
            />

            {isSidebarOpen && (
              <span className="whitespace-nowrap text-sm font-semibold">
                {isLoggingOut
                  ? "Sedang Keluar..."
                  : "Keluar Akun"}
              </span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* KONTEN UTAMA */}

      <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER ATAS */}

        <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">

          {/* TOGGLE SIDEBAR */}

          <button
            type="button"
            onClick={() =>
              setIsSidebarOpen((prev) => !prev)
            }
            aria-label={
              isSidebarOpen
                ? "Tutup menu navigasi"
                : "Buka menu navigasi"
            }
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>

          {/* PROFIL SISWA */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsProfileOpen((prev) => !prev)
              }
              aria-expanded={isProfileOpen}
              aria-label="Menu profil siswa"
              className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-gray-50"
            >
              <div className="hidden text-right sm:block">
                <p className="max-w-[170px] truncate text-sm font-bold text-gray-900">
                  {userName}
                </p>

                <p className="text-xs text-gray-500">
                  Siswa Aktif
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                <UserCircle size={27} />
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  isProfileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {/* DROPDOWN PROFIL */}

            {isProfileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Tutup menu profil"
                  onClick={() =>
                    setIsProfileOpen(false)
                  }
                  className="fixed inset-0 z-30 cursor-default"
                />

                <div className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 px-4 py-4">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {userName}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Akun Siswa CARE Indonesia
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <LogOut size={19} />

                      {isLoggingOut
                        ? "Sedang Keluar..."
                        : "Keluar Akun"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ISI HALAMAN */}

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#f3f6ff] p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
