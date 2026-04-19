export const CARDIO_KEY = 'forge_cardio_v1'

export function loadCardio() {
  try { return JSON.parse(localStorage.getItem(CARDIO_KEY) || '{}') }
  catch { return {} }
}

export function saveCardio(data) {
  localStorage.setItem(CARDIO_KEY, JSON.stringify(data))
}

// ── Pace helpers ──────────────────────────────────────────────────

// "9:30" → 570 seconds
export function paceToSeconds(str) {
  if (!str || !str.includes(':')) return null
  const [m, s] = str.split(':').map(Number)
  if (isNaN(m) || isNaN(s) || s >= 60) return null
  return m * 60 + s
}

// 570 → "9:30"
export function secondsToPace(secs) {
  if (!secs || secs <= 0) return '—'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// "1:45.2" → total seconds (rower split, mm:ss.t format)
export function rowSplitToSeconds(str) {
  if (!str) return null
  const clean = str.trim()
  // Accept "1:45", "1:45.2", "105" (raw seconds)
  if (!clean.includes(':')) {
    const n = parseFloat(clean)
    return isNaN(n) ? null : n
  }
  const [m, rest] = clean.split(':')
  const s = parseFloat(rest)
  if (isNaN(Number(m)) || isNaN(s)) return null
  return Number(m) * 60 + s
}

// ── Load score formulas ───────────────────────────────────────────

// Running: normalized to 10:00/mi = 1.0 pace multiplier
// Score = miles × (600 / pace_secs) × RPE
export function runLoadScore(miles, paceSecs, rpe) {
  if (!miles || !paceSecs || !rpe) return 0
  const paceMultiplier = 600 / paceSecs   // 10:00/mi baseline
  return Math.round(miles * paceMultiplier * rpe * 10) / 10
}

// Rowing: normalized to 2:00/500m = 1.0 split multiplier
// Score = (meters/1000) × (120 / split_secs) × RPE
export function rowLoadScore(meters, splitSecs, rpe) {
  if (!meters || !splitSecs || !rpe) return 0
  const splitMultiplier = 120 / splitSecs  // 2:00/500m baseline
  return Math.round((meters / 1000) * splitMultiplier * rpe * 10) / 10
}

// ── Formatting ────────────────────────────────────────────────────

export function fmtCardioDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function daysSinceCardio(dateStr) {
  if (!dateStr) return Infinity
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}
