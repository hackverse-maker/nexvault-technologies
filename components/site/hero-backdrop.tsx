'use client'

import { useEffect, useState } from 'react'
import { MediaImg } from './media-image'
import type { PublicSlide } from '@/lib/sliders'

const ROTATE_MS = 7000

/**
 * Rotating photographic backdrop for the homepage hero. Slides crossfade
 * behind the hero copy; renders nothing when no slides have images.
 */
export function HeroBackdrop({ slides }: { slides: PublicSlide[] }) {
  const withImages = slides.filter((s) => s.image)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (withImages.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % withImages.length), ROTATE_MS)
    return () => clearInterval(timer)
  }, [withImages.length])

  if (withImages.length === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }} aria-hidden="true">
      {withImages.map((slide, i) => (
        <MediaImg
          key={slide.id}
          src={slide.image!}
          alt=""
          sizes="100vw"
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : 'auto'}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === index ? 0.4 : 0,
            transition: 'opacity 1.4s ease',
            filter: 'saturate(.85)',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(4,13,29,.55) 0%, rgba(4,13,29,.25) 45%, rgba(4,13,29,.9) 100%), radial-gradient(circle at 75% 20%, rgba(0,140,255,.12), transparent 55%)',
        }}
      />
    </div>
  )
}
