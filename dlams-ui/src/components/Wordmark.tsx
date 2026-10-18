import { useCallback, useRef } from "react"

import { MEASURE_SIZE, useFitOnResize } from "./useFitOnResize"

interface WordmarkProps {
  className?: string
}

function Wordmark({ className = "" }: WordmarkProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  const fit = useCallback((root: HTMLElement) => {
    const text = textRef.current
    if (!text) return
    text.style.fontSize = `${MEASURE_SIZE}px`
    const box = text.getBoundingClientRect()
    const size = Math.min(
      (root.clientWidth / box.width) * MEASURE_SIZE,
      (root.clientHeight / box.height) * MEASURE_SIZE,
    )
    text.style.fontSize = `${size}px`
  }, [])

  useFitOnResize(rootRef, fit)

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`flex select-none items-center justify-center overflow-hidden font-logo font-bold ${className}`}
    >
      <span ref={textRef} className="whitespace-nowrap leading-none">
        <span className="text-red">D.</span>L.A.M.S.
      </span>
    </div>
  )
}

export default Wordmark
