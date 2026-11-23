import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { MotionProvider } from "@/components/shared/motion-provider";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const title = "BraceMotion · A wrist-worn prototype for studying tremor";
const description =
  "BraceMotion is a student research prototype: an ESP32-C3, an MPU6050 motion sensor and a coin vibration motor in a small case on a textile strap, with a companion app demo.";

export const metadata: Metadata = {
  metadataBase: new URL("https://bracemotion.netlify.app"),
  title,
  description,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "BraceMotion",
    images: [{ url: "/images/prototype-v4-closed.webp", width: 864, height: 867, alt: "BraceMotion V4 on its textile strap" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/prototype-v4-closed.webp"] },
  other: { "page-type": "product", "site-kind": "tech" },
};

export const viewport: Viewport = {
  themeColor: "#18191b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-type="product" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
