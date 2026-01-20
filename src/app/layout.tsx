import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Money Made Simple | Learn Finance the Fun Way",
  description: "A friendly place to learn about stocks, money, and investing. Everything explained so simply, even a 10-year-old can understand!",
  keywords: ["finance", "stocks", "investing", "education", "kids", "learning", "money"],
  authors: [{ name: "Money Made Simple" }],
  openGraph: {
    title: "Money Made Simple | Learn Finance the Fun Way",
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
    <html lang="en">
      <body className="gradient-bg">
        {children}
      </body>
    </html>
  );
}
