import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CV Yaratmaq | AI ilə CV Yarat | CVERA - Azerbaycanca CV",
  description: "AI ilə CV yaratmaq artıq daha asan! CVERA ilə online cv yaratmaq, azerbaycanca cv yazmaq və resume yarat. LinkedIn məlumatlarınızla dəqiqələrdə!",
  keywords: "cv yaratmaq, cv yarat, cv yaz, ai ilə cv, ai ilə cv yaratmaq, cvera, resume yarat, azerbaycanca cv, cv yazmaq proqramı, online cv yaratmaq",
  robots: "index, follow",
  authors: [{ name: "CVERA Team" }],
  creator: "CVERA",
  publisher: "CVERA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cvera.az'),
  alternates: {
    canonical: '/',
    languages: {
      'az': '/az',
      'en': '/en',
    },
  },
  openGraph: {
    title: "AI ilə CV Yaratmaq | CVERA - Azerbaycanca CV Platforması",
    description: "Süni intellekt dəstəyi ilə professional CV yaradın. LinkedIn məlumatlarınızı idxal edin və dəqiqələrdə hazırda iş axtarışına başlayın.",
    url: 'https://cvera.az',
    siteName: 'CVERA',
    locale: 'az_AZ',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CVERA - AI ilə CV Yaratmaq Platforması',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI ilə CV Yaratmaq | CVERA",
    description: "Süni intellekt dəstəyi ilə professional CV yaradın. LinkedIn məlumatlarınızla dəqiqələrdə hazırda iş axtarışına başlayın.",
    images: ['/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <main>
            {children}
          </main>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
