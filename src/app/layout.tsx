import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Flynn | Learn Finance the Fun Way",
  description: "A friendly place to learn about stocks, money, and investing. Everything explained so simply, even a 10-year-old can understand!",
  keywords: ["finance", "stocks", "investing", "education", "kids", "learning", "money"],
  authors: [{ name: "Flynn" }],
  openGraph: {
    title: "Flynn | Learn Finance the Fun Way",
    description: "A friendly place to learn about stocks, money, and investing. Everything explained so simply, even a 10-year-old can understand!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF8F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="gradient-bg">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
