export function isoDateToMonthDayYear(isoDate: string) {
  const [year, month, day] = isoDate.split("-")
  return `${month}-${day}-${year}`
}

export function todayAsIsoDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}
