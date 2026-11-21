import type { ReactNode } from "react"

interface PageHeadingProps {
  children: ReactNode
}

function PageHeading({ children }: PageHeadingProps) {
  return <h1 className="text-2xl font-semibold md:text-3xl">{children}</h1>
}

export default PageHeading
