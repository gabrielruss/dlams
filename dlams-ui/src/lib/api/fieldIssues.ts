export type ValidationIssue = {
  type: string
  loc: (string | number)[]
  msg: string
  ctx?: Record<string, unknown>
}

export type FieldIssue = { field: string; message: string }

const ownValidatorPrefix = "Value error, "

function friendlyMessageForIssue(issue: ValidationIssue) {
  const minLength = Number(issue.ctx?.min_length)
  const maxLength = Number(issue.ctx?.max_length)
  switch (issue.type) {
    case "missing":
      return "This field is required"
    case "string_too_short":
      if (minLength > 1) return `Must be at least ${minLength} characters`
      return "This field is required"
    case "string_too_long":
      if (Number.isFinite(maxLength)) {
        return `Must be ${maxLength} characters or fewer`
      }
      return undefined
    case "enum":
    case "literal_error":
      return "Choose one of the listed options"
    case "date_from_datetime_parsing":
    case "date_parsing":
    case "date_type":
      return "Enter a valid date"
    case "value_error":
      if (issue.msg.startsWith(ownValidatorPrefix)) {
        return issue.msg.slice(ownValidatorPrefix.length)
      }
      return undefined
    default:
      return undefined
  }
}

export function fieldIssuesFromValidationErrors(
  issues: ValidationIssue[],
): FieldIssue[] {
  return issues.flatMap((issue) => {
    const [source, field] = issue.loc
    const message = friendlyMessageForIssue(issue)
    if (source !== "body" || typeof field !== "string" || !message) return []
    return [{ field, message }]
  })
}
