"use client";

import { usePathname } from "next/navigation";
import { Navbar, Footer, ScrollToTop } from "@/components";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Daftar route yang tidak ingin memakai layout utama
  const noLayoutRoutes = ["/login"];

  const hideLayout = noLayoutRoutes.includes(pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && (
        <>
          <Footer />
          <ScrollToTop />
        </>
      )}
    </>
  );
}
