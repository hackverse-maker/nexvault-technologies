import Link from 'next/link'
import { Mail, MessageCircle } from 'lucide-react'
import { Logo } from './logo'
import { getFooterData } from '@/lib/chrome'

function InstagramIcon() {
  return (
    <svg className="instagram-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.7V11H8v3h2.8v7h2.7z" />
    </svg>
  )
}

function SocialIcon({ label }: { label: string }) {
  const l = label.toLowerCase()
  if (l.includes('instagram') || l.includes('insta')) return <InstagramIcon />
  if (l.includes('facebook') || l === 'f' || l.includes('fb')) return <FacebookIcon />
  if (l.includes('whatsapp') || l.includes('wa')) return <MessageCircle size={17} />
  if (l.includes('linkedin')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.5 8.8H3.6V21h2.9V8.8zM5 7.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zm6.4 1.4h-2.8V21h2.9v-6.1c0-1.6.7-2.6 1.9-2.6 1.2 0 1.8.8 1.8 2.6V21h2.9v-6.8c0-3-1.6-4.4-3.8-4.4-1.7 0-2.6.9-3 1.6h-.1V8.8z" />
      </svg>
    )
  }
  if (l.includes('twitter') || l.includes('x.com')) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.8l-5.3-7-6.1 7H2l8.2-9.3L1 2h7l4.8 6.3L18.9 2zm-1.2 18h1.9L7.1 3.9H5L17.7 20z" />
      </svg>
    )
  }
  if (l.includes('youtube')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23 12s0-3.9-.5-5.6c-.3-1-1-1.7-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4c-1 .3-1.7 1-2 2C1 8.1 1 12 1 12s0 3.9.5 5.6c.3 1 1 1.7 2 2 1.8.4 8.5.4 8.5.4s6.7 0 8.5-.4c1-.3 1.7-1 2-2 .5-1.7.5-5.6.5-5.6zM9.8 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    )
  }
  return <Mail size={16} />
}

export async function SiteFooter() {
  const data = await getFooterData()

  return (
    <>
      <footer className="site-footer">
        <div
          className="container footer-main"
          style={{ gridTemplateColumns: `1.1fr repeat(${Math.max(data.columns.length, 1)}, minmax(130px, 1fr))` }}
        >
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoUrl} alt="NexVault Technologies" style={{ height: 44, width: 'auto', maxWidth: 180, objectFit: 'contain' }} />
            ) : (
              <Logo />
            )}
            <div className="footer-tag" style={{ marginTop: 18 }}>
              {data.description}
            </div>
            {data.heading && data.heading !== 'Build. Rank. Grow.' && (
              <p className="eyebrow" style={{ marginTop: 14 }}>{data.heading}</p>
            )}
            {data.contactLine && (
              <a href={`mailto:${data.contactLine}`} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--cyan)', fontSize: 12, marginTop: 14 }}>
                <Mail size={14} /> {data.contactLine}
              </a>
            )}
          </div>
          {data.columns.map((column) => (
            <div key={column.id}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>{column.title}</p>
              <div className="footer-links" style={{ justifyContent: 'flex-start', flexDirection: 'column', gap: 10 }}>
                {column.links.map((link) => (
                  <Link key={link.href + link.label} href={link.href}>{link.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="container footer-bottom">
          <span>{data.copyrightText}</span>
          <span>BUILD <i>•</i> RANK <i>•</i> GROW</span>
          {data.showSocialLinks && (
            <div className="socials">
              {data.socials.map((social) => (
                <a key={social.label + social.href} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                  <SocialIcon label={social.label} />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="container" style={{ paddingBottom: 28, display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          <Link href="/privacy-policy" style={{ color: '#6f8297', fontSize: 11 }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#6f8297', fontSize: 11 }}>Terms &amp; Conditions</Link>
        </div>
      </footer>
      <a className="whatsapp-float" href={data.whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
        <MessageCircle size={24} />
      </a>
    </>
  )
}
