
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-12">
        <div className="container px-4 py-6 md:px-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
