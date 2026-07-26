import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  CommandPalette,
  type SearchItem,
} from "@/components/search/CommandPalette";
import { ToastProvider } from "@/components/editor/ToastProvider";

export function SiteShell({
  children,
  searchItems,
}: {
  children: ReactNode;
  searchItems: SearchItem[];
}) {
  return (
    <ToastProvider>
      <Navbar />
      <CommandPalette items={searchItems} />
      <main className="flex-1">{children}</main>
      <Footer />
    </ToastProvider>
  );
}
