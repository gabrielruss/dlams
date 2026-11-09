import { Link } from "react-router-dom"

import Wordmark from "@/components/Wordmark"
import { routes } from "@/lib/routes"

interface HomeLinkProps {
  className: string
  wordmarkClassName: string
}

function HomeLink({ className, wordmarkClassName }: HomeLinkProps) {
  return (
    <Link className={className} to={routes.home} aria-label="D.L.A.M.S. home">
      <Wordmark className={wordmarkClassName} />
    </Link>
  )
}

export default HomeLink
