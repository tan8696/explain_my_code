import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#06060c",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://explainmycode.dev"),
  title: {
    default: "Explain My Code — Understand Any Code in Simple English",
    template: "%s | Explain My Code",
  },
  description:
    "Paste code in Python, JavaScript, TypeScript, C++, Rust, Go, SQL or any language. Get instant simple English line-by-line breakdowns, narrative logic, and bug detection powered by AI.",
  keywords: [
    "code explainer",
    "ai code tutor",
    "understand code",
    "learn programming",
    "code bug detector",
    "python explainer",
    "javascript explainer",
    "simple english code",
    "gemini code analysis",
  ],
  authors: [{ name: "Explain My Code" }],
  creator: "Explain My Code",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://explainmycode.dev",
    title: "Explain My Code — Understand Any Code in Simple English",
    description:
      "Instant line-by-line breakdowns, narrative logic, and bug detection for any programming language with zero jargon.",
    siteName: "Explain My Code",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Explain My Code Logo & Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explain My Code — Understand Any Code in Simple English",
    description:
      "Instant line-by-line breakdowns, narrative logic, and bug detection for any programming language with zero jargon.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} dark`}
    >
      <body>{children}</body>
    </html>
  );
}
