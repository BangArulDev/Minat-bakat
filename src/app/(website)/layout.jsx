import LayoutWrapper from "@/components/layout/LayoutWrapper";

export default function WebsiteLayout({ children }) {
  return (
    // LayoutWrapper hanya akan membungkus halaman yang ada di dalam folder (website)
    <LayoutWrapper>
      {children}
    </LayoutWrapper>
  );
}