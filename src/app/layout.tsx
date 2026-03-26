import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});
import "./globals.css";


export const metadata: Metadata = {
  title: "Buff — Round up. Invest. Grow onchain.",
  description:
    "Buff rounds up your onchain transaction fees and auto-invests the difference into crypto assets. A drop-in SDK for any platform.",
  openGraph: {
    title: "Buff — Round up. Invest. Grow onchain.",
    description:
      "Round up transaction fees. Auto-invest the spare change into crypto assets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('buff-theme');
            const d = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (d) document.documentElement.classList.add('dark');
          } catch {}
        `}} />
      </head>
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
