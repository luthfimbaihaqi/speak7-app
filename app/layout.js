import { Analytics } from "@vercel/analytics/react";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
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
  metadataBase: new URL("https://www.ielts4our.net"),
  title: "IELTS4our | Your Speaking Partner to Band 8.0",
  description: "Master IELTS Speaking with real-time AI feedback, mock interviews, and band 8.0 model answers. Practice daily with instant scoring and grammar correction.",
  keywords: ["IELTS Speaking", "IELTS practice", "IELTS AI", "speaking test", "band 8.0", "IELTS simulation", "IELTS mock test"],
  authors: [{ name: "IELTS4our" }],
  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    url: "https://www.ielts4our.net",
    title: "IELTS4our | Your Speaking Partner to Band 8.0",
    description: "Master IELTS Speaking with real-time AI feedback, mock interviews, and band 8.0 model answers.",
    siteName: "IELTS4our",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IELTS4our - Your Speaking Partner to Band 8.0",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS4our | Your Speaking Partner to Band 8.0",
    description: "Master IELTS Speaking with real-time AI feedback, mock interviews, and band 8.0 model answers.",
    images: ["/og-image.png"],
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