import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning>
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
        className={`${poppins.variable} ${poppins.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
