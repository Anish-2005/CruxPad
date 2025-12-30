import './globals.css'; // adjust path if needed

export const metadata = {
  title: {
    default: 'CruxPad - AI-Powered Cheatsheet Generator',
    template: '%s | CruxPad'
  },
  description: 'Transform lengthy documents into concise, beautiful cheatsheets using advanced AI. Upload PDFs or paste text to create professional study materials instantly.',
  keywords: ['cheatsheet', 'AI', 'study notes', 'PDF processing', 'knowledge condensation', 'learning tool', 'educational technology'],
  authors: [{ name: 'CruxPad Team' }],
  creator: 'CruxPad',
  publisher: 'CruxPad',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cruxpad.vercel.app'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/cruxpad.png', sizes: 'any' },
      { url: '/cruxpad.png', sizes: '16x16', type: 'image/png' },
      { url: '/cruxpad.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/cruxpad.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'CruxPad - AI-Powered Cheatsheet Generator',
    description: 'Transform lengthy documents into concise, beautiful cheatsheets using advanced AI. Create professional study materials instantly.',
    url: 'https://cruxpad.vercel.app',
    siteName: 'CruxPad',
    images: [
      {
        url: '/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'CruxPad - AI-Powered Cheatsheet Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CruxPad - AI-Powered Cheatsheet Generator',
    description: 'Transform lengthy documents into concise, beautiful cheatsheets using advanced AI.',
    images: ['/og-image.png'],
    creator: '@cruxpad', // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code', // Add your Google verification code
    yandex: 'your-yandex-verification-code', // Add your Yandex verification code
    bing: 'your-bing-verification-code', // Add your Bing verification code
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" type="image/png" href="/cruxpad.png" />
        <link rel="apple-touch-icon" href="/cruxpad.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script src="https://js.puter.com/v2/"></script>

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "CruxPad",
              "description": "AI-powered cheatsheet generator that transforms lengthy documents into concise, beautiful study materials",
              "url": "https://cruxpad.vercel.app",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "CruxPad Team"
              },
              "featureList": [
                "PDF text extraction",
                "AI-powered summarization",
                "Beautiful PDF export",
                "Dark/Light theme support",
                "Real-time processing"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 print:bg-white">
        {children}
        <div className="hidden print:block fixed inset-0 bg-white z-50"></div>
      </body>
    </html>
  );
}
