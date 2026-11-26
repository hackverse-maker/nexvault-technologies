import Link from 'next/link'

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3" aria-label="NexVault Technologies home">
      <div className="logo-mark">
        <span>N</span>
      </div>
      <div>
        <div className="logo-word">
          NEX<span>VAULT</span>
        </div>
        <div className="logo-sub">TECHNOLOGIES</div>
      </div>
    </Link>
  )
}
