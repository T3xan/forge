export const STORAGE_KEY = 'forge_v2'

export function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function daysSince(dateStr) {
  if (!dateStr) return Infinity
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

export function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

// ── Day schedule config ──────────────────────────────────────────
export const SCHEDULE_KEY = 'forge_day_schedule'
export const DEFAULT_SCHEDULE = { 1:'A', 2:'B', 3:'A', 4:'B', 5:'A', 6:'B', 0:null } // Mon-Sat A/B, Sun rest

export function loadSchedule() {
  try { return JSON.parse(localStorage.getItem(SCHEDULE_KEY) || 'null') || DEFAULT_SCHEDULE }
  catch { return DEFAULT_SCHEDULE }
}
export function saveSchedule(s) { localStorage.setItem(SCHEDULE_KEY, JSON.stringify(s)) }

export function todayTag() {
  const day = new Date().getDay()
  return loadSchedule()[day] || null
}
