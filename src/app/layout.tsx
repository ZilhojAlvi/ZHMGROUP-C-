import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Providers } from "./providers";

// Note: next/font/google requires fetching webfonts at *build* time, which
// breaks in fully offline/restricted-network build environments. Instead,
// SRMS loads "Fraunces" (display) + "Inter" (body) via a plain CSS @import
// in globals.css — a *runtime* fetch made by the visitor's browser, so it
// never touches the Next.js build. Swap in next/font/google freely once
// you have open network access at build time.
const fontVariables = "";

export const metadata: Metadata = {
  title: "SRMS — Smart Real Estate Management System",
  description:
    "Search, book and manage residential and commercial properties with a modern, role-based real estate platform.",
};

export const viewport: Viewport = {
  themeColor: "#12190d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased">
        <Providers>
          <Navbar />
          <ErrorBoundary fallbackTitle="This page hit a snag">
            <main className="flex-1">{children}</main>
          </ErrorBoundary>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
