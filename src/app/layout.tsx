import type { Metadata } from "next";
import { Open_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import { Toaster } from "sonner";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HealthManager - Modern Healthcare SaaS",
  description: "Comprehensive multi-tenant healthcare management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased bg-mesh bg-noise",
          openSans.variable,
          poppins.variable
        )}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
