import { useCallback, useRef } from "react"

import { MEASURE_SIZE, useFitOnResize } from "./useFitOnResize"

const SIDE_WORD = "DON'T"
const LINES = ["LOOK", "AT MY", "STUFF"]
const MAX_SIDE_SHARE = 0.25
const LINE_HEIGHT = 0.9

interface BrandLogoProps {
  className?: string
  sideClassName?: string
}

function BrandLogo({ className = "", sideClassName = "" }: BrandLogoProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const sideRef = useRef<HTMLSpanElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])

  const fit = useCallback((root: HTMLElement) => {
    const side = sideRef.current
    if (!side) return
    const lines = lineRefs.current.filter(
      (line): line is HTMLSpanElement => line !== null,
    )
    const { clientWidth: width, clientHeight: height } = root

    side.style.fontSize = `${MEASURE_SIZE}px`
    const sideBox = side.getBoundingClientRect()
    const sideSize = Math.min(
      (height / sideBox.height) * MEASURE_SIZE,
      ((width * MAX_SIDE_SHARE) / sideBox.width) * MEASURE_SIZE,
    )
    side.style.fontSize = `${sideSize}px`
    const sideWidth = (sideBox.width * sideSize) / MEASURE_SIZE

    const available = width - sideWidth
    const sizes = lines.map((line) => {
      line.style.fontSize = `${MEASURE_SIZE}px`
      return (available / line.getBoundingClientRect().width) * MEASURE_SIZE
    })
    const stackHeight = sizes.reduce((sum, size) => sum + size * LINE_HEIGHT, 0)
    const scale = Math.min(1, height / stackHeight)
    lines.forEach((line, index) => {
      line.style.fontSize = `${sizes[index] * scale}px`
    })
  }, [])

  useFitOnResize(rootRef, fit)

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`flex select-none items-center justify-center overflow-hidden font-logo font-bold ${className}`}
    >
      <span
        ref={sideRef}
        className={`shrink-0 rotate-180 whitespace-nowrap leading-none [text-orientation:mixed] [writing-mode:vertical-rl] ${sideClassName}`}
      >
        {SIDE_WORD}
      </span>
      <div className="flex min-w-0 flex-col">
        {LINES.map((line, index) => (
          <span
            key={line}
            ref={(element) => {
              lineRefs.current[index] = element
            }}
            className="block w-max whitespace-nowrap"
            style={{ lineHeight: LINE_HEIGHT }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  )
}

export default BrandLogo
