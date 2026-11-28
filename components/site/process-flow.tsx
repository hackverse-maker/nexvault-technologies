'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Code2,
  Palette,
  Rocket,
  Search,
  TrendingUp,
} from 'lucide-react'
import { DEFAULT_PROCESS_STEPS, type ProcessStep } from '@/lib/process-steps'

const STEP_ICONS = [Search, ClipboardList, Palette, Code2, Rocket, TrendingUp]

// ---- Animation timing (adjust here) ----
const HOLD_MS = 1800 // how long each step stays highlighted
const TRAVEL_MS = 650 // how long the light takes to travel a connector
// ----------------------------------------

/**
 * Continuous workflow animation.
 * Desktop snake: Discover → Plan → Design ↓ Development → Launch → Grow ↺ Discover
 * Connector index i travels from step i to step (i+1) % 6.
 * Mobile: same sequence stacked vertically.
 */
export function ProcessFlow({ steps = DEFAULT_PROCESS_STEPS }: { steps?: ProcessStep[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(-1)
  const [travel, setTravel] = useState<number | null>(null)

  // Reveal on scroll
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Sequential highlight + traveling light loop
  useEffect(() => {
    if (!visible) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(0)
      return
    }
    let cancelled = false
    const timers: number[] = []
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(() => { if (!cancelled) fn() }, ms))
    }
    const run = (i: number) => {
      setActive(i)
      later(() => {
        setTravel(i)
        later(() => {
          setTravel(null)
          run((i + 1) % steps.length)
        }, TRAVEL_MS)
      }, HOLD_MS)
    }
    run(0)
    return () => {
      cancelled = true
      timers.forEach((t) => clearTimeout(t))
    }
  }, [visible, steps.length])

  return (
    <div ref={ref} className={`process-flow ${visible ? 'in-view' : ''}`}>
      {/* Desktop / tablet: connected snake grid */}
      <div className="process-grid">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i % STEP_ICONS.length]
          const row = i < 3 ? 1 : 2
          // Snake: row 2 occupies columns right→left (Development under Design).
          const col = row === 1 ? i + 1 : 3 - (i - 3)
          const isActive = active === i
          return (
            <article
              key={step.title}
              className={`process-card ${isActive ? 'active' : ''}`}
              style={{ gridRow: row, gridColumn: col, ['--rd' as string]: `${i * 90}ms` } as React.CSSProperties}
            >
              <div className="process-card-top">
                <span className={`process-num ${isActive ? 'lit' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
                <div className={`process-icon ${isActive ? 'lit' : ''}`}><Icon size={23} strokeWidth={2} /></div>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>

              {/* Direction chevrons */}
              {i === 0 || i === 1 ? (
                <span className="process-arrow process-arrow-right" aria-hidden="true"><ChevronRight size={18} /></span>
              ) : null}
              {i === 3 || i === 4 ? (
                <span className="process-arrow process-arrow-left" aria-hidden="true"><ChevronLeft size={18} /></span>
              ) : null}
              {i === 2 && <span className="process-arrow process-arrow-down" aria-hidden="true"><ChevronDown size={20} /></span>}
              {i === 5 && <span className="process-arrow process-arrow-up" aria-hidden="true"><ChevronUp size={20} /></span>}

              {/* Traveling light connector from this step to the next */}
              <Connector i={i} live={travel === i} />
            </article>
          )
        })}
      </div>

      {/* Mobile: vertical stack */}
      <div className="process-rail">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i % STEP_ICONS.length]
          const isActive = active === i
          return (
            <div key={step.title} className={`process-rail-item ${isActive ? 'active' : ''}`}>
              <div className="process-rail-node">
                <span className={`process-num ${isActive ? 'lit' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
                <div className={`process-icon ${isActive ? 'lit' : ''}`}><Icon size={23} strokeWidth={2} /></div>
              </div>
              <div className="process-rail-body">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <span className={`process-conn-m ${travel === i ? 'live' : ''}`} aria-hidden="true">
                  <ChevronDown size={16} className="process-arrow-v" />
                  <span className="conn-dot conn-dot-m" />
                </span>
              )}
              {i === steps.length - 1 && travel === i && (
                <span className="process-conn-m process-conn-m-end" aria-hidden="true"><span className="conn-dot conn-dot-m" /></span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Desktop connector track + traveling dot, positioned per transition index. */
function Connector({ i, live }: { i: number; live: boolean }) {
  // 0,1 → right; 2 → down; 3,4 → left; 5 → up (return to Discover)
  const cls =
    i === 2 ? 'conn conn-v conn-v-down' :
    i === 5 ? 'conn conn-v conn-v-up' :
    i === 3 || i === 4 ? 'conn conn-h conn-h-left' :
    'conn conn-h'
  return (
    <span className={`${cls} ${live ? 'live' : ''}`} aria-hidden="true">
      <span className="conn-dot" />
    </span>
  )
}
