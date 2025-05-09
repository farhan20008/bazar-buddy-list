
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isEnglish } = useLanguage();
  const isMobile = useIsMobile();
  const fontClass = isEnglish ? "font-inter" : "font-hind-siliguri";

  return (
    <div className={`flex min-h-screen w-full bg-background ${fontClass}`}>
      <Sidebar className="flex-shrink-0" />
      <main className="flex-1 overflow-y-auto">
        <div className={`container ${isMobile ? "px-3 py-4" : "px-6 py-8"} max-w-7xl`}>
          {children}
        </div>
      </main>
    </div>
  );
}
