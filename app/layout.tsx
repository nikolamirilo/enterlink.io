import { ClientLayout } from "@/components/ClientLayout";
import { Sidebar } from "@/components/Sidebar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enterlink",
  description: "AI powered document search and chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 w-full pt-16 lg:pt-0">
              {children}
            </main>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
