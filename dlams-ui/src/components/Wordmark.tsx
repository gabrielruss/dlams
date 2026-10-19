import FitText from "./FitText"

interface WordmarkProps {
  className?: string
}

function Wordmark({ className }: WordmarkProps) {
  return (
    <FitText className={className}>
      <span className="text-red">D.</span>L.A.M.S.
    </FitText>
  )
}

export default Wordmark
