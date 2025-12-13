import { Analytics } from "@vercel/analytics/react";
import { Geist, Geist_Mono, Caveat } from "next/font/google"; // Import Caveat
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Font Tanda Tangan
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata = {
  title: "IELTS4our | Your Speaking Partner to Band 8.0",
  description: "Master IELTS Speaking with real-time AI feedback, mock interviews, and band 8.0 model answers.",
  icons: {
    icon: '/icon.png', // Pastikan file favicon.ico sudah ada di folder public
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}