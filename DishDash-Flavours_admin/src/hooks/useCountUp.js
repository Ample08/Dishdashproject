import { useEffect, useRef, useState } from 'react'

// Smoothly animates a number from 0 -> target on mount.
// Falls back to the final value instantly if motion is reduced or rAF is throttled.
export function useCountUp(target, { duration = 1100 } = {}) {
  const end = Number(target) || 0
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const [value, setValue] = useState(prefersReduced ? end : 0)
  const raf = useRef(null)
  const fallback = useRef(null)

  useEffect(() => {
    if (prefersReduced) { setValue(end); return }
    let start = null
    const ease = (t) => 1 - Math.pow(1 - t, 3) // easeOutCubic

    const step = (ts) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(end * ease(progress))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    // Guarantee the final value even if rAF never progresses (background tab, headless)
    fallback.current = setTimeout(() => setValue(end), duration + 120)

    return () => { cancelAnimationFrame(raf.current); clearTimeout(fallback.current) }
  }, [end, duration, prefersReduced])

  return value
}
