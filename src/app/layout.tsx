import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Varnava Wildfire 2024",
  description: "A visualization of the Varnava Wildifire",
  openGraph: {
    images: [
      {
        url: "/summary.png",

      }
    ],
    title: "Varnava Wildfire 2024",
    description: "A visualization of the Varnava Wildifire",
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/summary.png",
      }
    ],
    title: "Varnava Wildfire 2024",
    description: "A visualization of the Varnava Wildifire",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
