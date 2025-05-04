
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isEnglish } = useLanguage();
  const fontClass = isEnglish ? "font-inter" : "font-hind-siliguri";

  return (
    <div className={`flex min-h-screen w-full flex-col md:flex-row ${fontClass}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto pb-12">
        <div className="container px-4 py-6 md:px-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
