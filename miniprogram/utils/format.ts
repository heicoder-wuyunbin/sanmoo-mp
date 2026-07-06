export function formatDate(input: string): string {
  if (!input) {
    return ''
  }
  const normalized = input.replace(/-/g, '/')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) {
    return input
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
