'use client'

import { useEffect, useRef, useState } from 'react'

const STAGES = ['Strategy', 'Design', 'Development', 'Visibility', 'Growth']

const SEGMENT_MS = 1600 // time for the line to travel between two markers
const HOLD_MS = 550 // beat at each stage before the line moves on

/**
 * Left-to-right animated process timeline for the homepage.
 * The progress line fills toward each marker; a stage activates as the
 * line reaches it, in order: Strategy → Design → Development →
 * Visibility → Growth. Plays when scrolled into view, replays after the
 * section has been left and re-entered, and respects prefers-reduced-motion.
 */
export function ProcessTimeline() {
  const ref = useRef<HTMLElement>(null)
  const [activeCount, setActiveCount] = useState(0) // stages reached so far
  const [progress, setProgress] = useState(0) // 0..1 fill across the whole track
  const [started, setStarted] = useState(false)
  const playedRef = useRef(false)
  const finishedRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced || typeof IntersectionObserver === 'undefined') {
      setActiveCount(STAGES.length)
      setProgress(1)
      setStarted(true)
      return
    }

    let cancelled = false
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { if (!cancelled) fn() }, ms)
      timersRef.current.push(t)
    }

    const reset = () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      setActiveCount(0)
      setProgress(0)
      setStarted(false)
      playedRef.current = false
      finishedRef.current = false
    }

    const run = () => {
      if (cancelled || playedRef.current) return
      playedRef.current = true
      setStarted(true)
      setActiveCount(1) // Strategy is active from the start

      // For each next stage: move the line to its marker, then activate it
      // when the transition lands.
      for (let i = 1; i < STAGES.length; i++) {
        const departAt = i * (SEGMENT_MS + HOLD_MS)
        later(() => setProgress(i / (STAGES.length - 1)), departAt)
        later(() => setActiveCount(i + 1), departAt + SEGMENT_MS)
      }
      later(() => { finishedRef.current = true }, STAGES.length * SEGMENT_MS + (STAGES.length - 1) * HOLD_MS)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run()
          } else if (finishedRef.current) {
            // Fully left the viewport after completing — reset so the
            // timeline replays on the next visit.
            reset()
          }
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(el)

    return () => {
      cancelled = true
      timersRef.current.forEach(clearTimeout)
      observer.disconnect()
    }
  }, [])

  const stageState = (i: number) => {
    if (!started) return 'upcoming'
    if (i < activeCount - 1) return 'done'
    if (i === activeCount - 1) return 'active'
    return 'upcoming'
  }

  return (
    <section ref={ref} className="trust-strip" aria-label="Our process">
      <div className="container trust-inner timeline">
        <div className="timeline-track" aria-hidden="true">
          <div className="timeline-line">
            <div
              className="timeline-fill"
              style={{
                transform: `scaleX(${progress})`,
                transition: `transform ${SEGMENT_MS}ms cubic-bezier(.22,.61,.36,1)`,
              }}
            />
          </div>
          {STAGES.map((stage, i) => {
            const state = stageState(i)
            return (
              <div
                key={stage}
                className={`timeline-stage ${state}`}
                style={{ left: `${(i / (STAGES.length - 1)) * 100}%` }}
              >
                <span className="timeline-dot" />
                <span className="timeline-label">{stage}</span>
              </div>
            )
          })}
        </div>
        <span className="timeline-caption">Our process</span>
      </div>
    </section>
  )
}
