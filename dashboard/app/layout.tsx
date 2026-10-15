import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "California Spiny Lobster: Investor Dashboard", description: "Audited figures, Oct 15 2026" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="antialiased font-sans">{children}</body></html>;
}
