/**
 * Utilidades de formato de fecha y hora.
 * Formato fecha: dd/MM/yyyy (25/03/2026)
 * Formato hora: hh:mm am/pm (02:30 pm)
 */

export function formatDate(value) {
  if (!value) return "-"
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return "-"
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function formatTime(value) {
  if (!value) return "-"
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return "-"
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? "pm" : "am"
  hours = hours % 12 || 12
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`
}

export function formatDateTime(value) {
  if (!value) return "-"
  return `${formatDate(value)} ${formatTime(value)}`
}
