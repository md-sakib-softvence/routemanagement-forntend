import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
