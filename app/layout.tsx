import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DEFAULT_DESCRIPTION, pageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo'
import { designCss, getDesignValues } from '@/lib/design'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'NexVault Technologies | Build. Rank. Grow.',
  description: DEFAULT_DESCRIPTION,
  generator: 'NexVault Technologies',
  alternates: { canonical: '/' },
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const design = await getDesignValues()
  const { css, fonts } = designCss(design)
  return (
    <html lang="en">
      <body className="antialiased">
        {fonts.map((family) => (
          <link
            key={family}
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=${family}&display=swap`}
          />
        ))}
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
        {design.faviconUrl && <link rel="icon" href={design.faviconUrl} />}
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
