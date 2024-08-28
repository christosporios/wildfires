import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wildfire Tracker",
  description: "A visualization tool for tracking wildfires",
  openGraph: {
    images: [
      {
        url: "/summary.png",
      }
    ],
    title: "Wildfire Tracker",
    description: "A visualization tool for tracking wildfires",
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/summary.png",
      }
    ],
    title: "Wildfire Tracker",
    description: "A visualization tool for tracking wildfires",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
