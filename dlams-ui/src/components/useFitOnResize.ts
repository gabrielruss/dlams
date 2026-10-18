import { useLayoutEffect, type RefObject } from "react"

export const MEASURE_SIZE = 100

export function useFitOnResize(
  rootRef: RefObject<HTMLElement | null>,
  fit: (root: HTMLElement) => void,
) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const run = () => fit(root)
    run()
    const observer = new ResizeObserver(run)
    observer.observe(root)
    document.fonts.addEventListener("loadingdone", run)
    return () => {
      observer.disconnect()
      document.fonts.removeEventListener("loadingdone", run)
    }
  }, [rootRef, fit])
}
