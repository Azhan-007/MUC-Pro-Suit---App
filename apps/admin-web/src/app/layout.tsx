import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "MUC Pro Suite - Administrative Console",
  description: "Mazharul Uloom College Autonomous ERP administrative console. Manage students, faculty, timetables, and academic operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-on-surface">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
