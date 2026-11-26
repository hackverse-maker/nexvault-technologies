'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { MediaImg } from './media-image'
import type { PublicSlide } from '@/lib/sliders'

const AUTOPLAY_MS = 6000

export function ImageSlider({
  slides,
  autoplay = true,
  showCaptions = true,
}: {
  slides: PublicSlide[]
  autoplay?: boolean
  showCaptions?: boolean
}) {
  const visible = slides.filter((s) => s.image)
  const [index, setIndex] = useState(0)

  const count = visible.length
  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + count) % count)
  }, [count])

  useEffect(() => {
    if (!autoplay || count < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [autoplay, count])

  if (count === 0) return null

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: '#061329' }}>
      <div style={{ position: 'relative', aspectRatio: '21 / 9', minHeight: 280 }}>
        {visible.map((slide, i) => (
          <div
            key={slide.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === index ? 1 : 0,
              transition: 'opacity .8s ease',
              pointerEvents: i === index ? 'auto' : 'none',
            }}
          >
            {slide.image && (
              <MediaImg
                src={slide.image}
                alt={slide.title || 'Slider image'}
                sizes="100vw"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(4,13,29,.82) 0%, rgba(4,13,29,.35) 55%, transparent 100%)' }} />
            {showCaptions && (slide.title || slide.caption || slide.ctaLabel) && (
              <div style={{ position: 'absolute', left: 28, bottom: 28, maxWidth: 560, color: 'white' }}>
                {slide.title && <p className="eyebrow" style={{ marginBottom: 8 }}>{slide.title}</p>}
                {slide.caption && <p style={{ margin: '0 0 14px', color: '#d7e4f2', fontSize: 14, lineHeight: 1.6 }}>{slide.caption}</p>}
                {slide.ctaLabel && slide.ctaHref && (
                  <Link className="button primary" href={slide.ctaHref} style={{ fontSize: 12, padding: '10px 18px' }}>
                    {slide.ctaLabel} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => go(-1)}
            style={navBtn}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => go(1)}
            style={{ ...navBtn, right: 14 }}
          >
            <ArrowRight size={16} />
          </button>
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7 }}>
            {visible.map((slide, i) => (
              <button
                key={slide.id}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 99,
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  background: i === index ? 'var(--cyan)' : 'rgba(255,255,255,.35)',
                  transition: 'all .3s ease',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const navBtn: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: 14,
  transform: 'translateY(-50%)',
  width: 38,
  height: 38,
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,.25)',
  background: 'rgba(4,13,29,.55)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backdropFilter: 'blur(4px)',
}
