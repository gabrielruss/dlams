import { Link } from "react-router-dom"

import Wordmark from "@/components/Wordmark"

interface HomeLinkProps {
  className: string
  wordmarkClassName: string
}

function HomeLink({ className, wordmarkClassName }: HomeLinkProps) {
  return (
    <Link className={className} to="/" aria-label="D.L.A.M.S. home">
      <Wordmark className={wordmarkClassName} />
    </Link>
  )
}

export default HomeLink
