const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

/** Formats an API local-date value without introducing a UTC timezone shift. */
export function formatDate(value) {
  if (!value) return '—'

  const [year, month, day] = value.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

/** Formats report metadata timestamps into a concise reader-friendly value. */
export function formatDateTime(value) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
