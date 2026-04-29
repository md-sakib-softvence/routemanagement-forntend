import type { Metadata } from "next";
import "./globals.css";
import GlobalAlert from "@/components/GlobalAlert";

export const metadata: Metadata = {
  title: "Routing Management Dashboard",
  description: "Premium routing management system with automated persistent alerts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <GlobalAlert />
        {children}
      </body>
    </html>
  );
}
