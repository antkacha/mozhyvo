import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";
import PageTransition from "@/components/PageTransition";
import { SavedProvider } from "@/contexts/SavedContext";
import { ToastProvider } from "@/contexts/ToastContext";

const BASE_URL = "https://mozhyvo.ua";
const TITLE = "Моживо — Всі можливості в одному місці";
const DESCRIPTION =
  "Гранти, стажування, обміни, волонтерство та стипендії для молоді України. Знайди свою можливість на Моживо — безкоштовно.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: TITLE,
    template: "%s | Моживо",
  },
  description: DESCRIPTION,

  keywords: [
    "гранти для молоді", "стипендії Україна", "стажування за кордоном",
    "програми обміну студентів", "волонтерство Україна", "Erasmus Ukraine",
    "DAAD стипендія", "Фулбрайт Україна", "можливості для студентів",
    "міжнародні програми молодь", "можливості Ukraine youth", "mozhyvo",
  ],

  authors: [{ name: "Команда Моживо", url: BASE_URL }],
  creator: "Моживо",
  publisher: "Моживо",

  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: BASE_URL,
    siteName: "Моживо",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Моживо — Всі можливості в одному місці",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${BASE_URL}/opengraph-image`],
    creator: "@mozhyvo",
    site: "@mozhyvo",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },


  alternates: {
    canonical: BASE_URL,
    languages: { "uk-UA": BASE_URL },
  },

  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B4FE8" },
    { media: "(prefers-color-scheme: dark)",  color: "#3B4FE8" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <ToastProvider>
          <SavedProvider>
            <Header />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <ConditionalFooter />
          </SavedProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
