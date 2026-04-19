import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Chart } from 'chart.js/auto'
import {
  loadCardio, saveCardio,
  paceToSeconds, secondsToPace,
  rowSplitToSeconds,
  runLoadScore, rowLoadScore,
  fmtCardioDate, daysSinceCardio,
} from '../cardioUtils'

// ── Storage ──────────────────────────────────────────────────────

function useCardioStore() {
  const [store, setStore] = useState(() => {
    const d = loadCardio()
    return { runs: d.runs || [], rows: d.rows || [] }
  })

  const persist = useCallback((next) => {
    setStore(next)
    saveCardio(next)
  }, [])

  function addRun(entry) {
    persist({ ...store, runs: [...store.runs, entry].sort((a, b) => a.date.localeCompare(b.date)) })
  }
  function deleteRun(id) {
    if (!confirm('Delete this run?')) return
    persist({ ...store, runs: store.runs.filter(r => r.id !== id) })
  }
  function editRun(id, updates) {
    persist({ ...store, runs: store.runs.map(r => r.id === id ? { ...r, ...updates } : r) })
  }

  function addRow(entry) {
    persist({ ...store, rows: [...store.rows, entry].sort((a, b) => a.date.localeCompare(b.date)) })
  }
  function deleteRow(id) {
    if (!confirm('Delete this row?')) return
    persist({ ...store, rows: store.rows.filter(r => r.id !== id) })
  }
  function editRow(id, updates) {
    persist({ ...store, rows: store.rows.map(r => r.id === id ? { ...r, ...updates } : r) })
  }

  return { store, addRun, deleteRun, editRun, addRow, deleteRow, editRow }
}

// ── Helpers ───────────────────────────────────────────────────────

function today() { return new Date().toISOString().split('T')[0] }

function fmtK(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(v)
}

// ── Tiny UI components ────────────────────────────────────────────

function StatTile({ label, value, sub, accent, color }) {
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
      <p style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 500, fontFamily: 'DM Mono', color: color || (accent ? 'var(--accent)' : 'var(--text)'), lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{sub}</p>}
    </div>
  )
}

function Label({ children }) {
  return <p style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, marginTop: 20 }}>{children}</p>
}

function FieldLabel({ children }) {
  return <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{children}</label>
}

function RPEPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button key={n} onClick={() => onChange(n === value ? null : n)} style={{
          width: 36, height: 36, borderRadius: 6, fontSize: 13, fontFamily: 'DM Mono',
          background: value === n
            ? n <= 4 ? '#47ffb8' : n <= 7 ? '#e8ff47' : '#ff8080'
            : 'var(--surface2)',
          color: value === n ? '#0b0b0d' : 'var(--muted)',
          border: `1px solid ${value === n ? 'transparent' : 'var(--border)'}`,
        }}>{n}</button>
      ))}
    </div>
  )
}

// ── Dual-dataset progression chart ───────────────────────────────

function CardioChart({ sessions, mainKey, mainLabel, mainColor, loadKey, unit }) {
  const ref = useRef()
  const loadRef = useRef()
  const chartRef = useRef()
  const loadChartRef = useRef()

  useEffect(() => {
    if (!ref.current || sessions.length < 2) return

    const sliced = sessions.slice(-30)
    const labels = sliced.map(s => fmtCardioDate(s.date))
    const mainData = sliced.map(s => s[mainKey])
    const loadData = sliced.map(s => s[loadKey] || 0)

    const baseOpts = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c1c22', borderColor: '#2a2a34', borderWidth: 1,
          titleColor: '#f0ede6', bodyColor: '#a0a0b4', padding: 10,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#666676', font: { size: 11, family: 'DM Mono' }, maxTicksLimit: 8, maxRotation: 0 },
        },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#666676', font: { size: 11, family: 'DM Mono' } } },
      },
    }

    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: mainData,
          borderColor: mainColor,
          backgroundColor: `${mainColor}12`,
          pointBackgroundColor: mainColor,
          pointBorderColor: '#0b0b0d',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.35,
          fill: true,
        }],
      },
      options: {
        ...baseOpts,
        plugins: {
          ...baseOpts.plugins,
          tooltip: { ...baseOpts.plugins.tooltip, callbacks: { label: ctx => `  ${ctx.raw} ${unit}` } },
        },
      },
    })

    if (loadRef.current) {
      if (loadChartRef.current) loadChartRef.current.destroy()
      loadChartRef.current = new Chart(loadRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: loadData,
            backgroundColor: 'rgba(167,139,250,0.25)',
            borderColor: '#a78bfa',
            borderWidth: 1,
            borderRadius: 3,
          }],
        },
        options: {
          ...baseOpts,
          plugins: {
            ...baseOpts.plugins,
            tooltip: { ...baseOpts.plugins.tooltip, callbacks: { label: ctx => `  load ${ctx.raw}` } },
          },
          scales: {
            ...baseOpts.scales,
            y: { ...baseOpts.scales.y, ticks: { ...baseOpts.scales.y.ticks, callback: v => fmtK(v) } },
          },
        },
      })
    }

    return () => {
      if (chartRef.current) chartRef.current.destroy()
      if (loadChartRef.current) loadChartRef.current.destroy()
    }
  }, [sessions, mainKey, mainColor, loadKey, unit])

  if (sessions.length < 2) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 13 }}>
      Log at least 2 sessions to see your progression
    </div>
  )

  return (
    <div>
      <p style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: mainColor, marginBottom: 6 }}>{mainLabel}</p>
      <div style={{ height: 160, marginBottom: 20 }}><canvas ref={ref} /></div>
      <p style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 6 }}>Load Score</p>
      <div style={{ height: 120 }}><canvas ref={loadRef} /></div>
    </div>
  )
}

// ── Run section ───────────────────────────────────────────────────

function RunForm({ onSave, onCancel, initial }) {
  const [date, setDate]     = useState(initial?.date || today())
  const [miles, setMiles]   = useState(initial?.miles != null ? String(initial.miles) : '')
  const [pace, setPace]     = useState(initial?.paceSecs ? secondsToPace(initial.paceSecs) : '')
  const [rpe, setRpe]       = useState(initial?.rpe ?? null)
  const [note, setNote]     = useState(initial?.note || '')

  function handleSave() {
    const mi = parseFloat(miles)
    const ps = paceToSeconds(pace)
    if (!mi || mi <= 0) return alert('Enter a valid distance')
    if (!ps) return alert('Enter pace as M:SS (e.g. 9:30)')
    if (!rpe) return alert('Select an RPE')
    const score = runLoadScore(mi, ps, rpe)
    onSave({ id: initial?.id || Date.now().toString(), date, miles: mi, paceSecs: ps, rpe, loadScore: score, note })
  }

  const previewScore = useMemo(() => {
    const mi = parseFloat(miles)
    const ps = paceToSeconds(pace)
    if (!mi || !ps || !rpe) return null
    return runLoadScore(mi, ps, rpe)
  }, [miles, pace, rpe])

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <p className="label" style={{ marginBottom: 16 }}>{initial ? 'Edit Run' : 'Log Run'}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <FieldLabel>Date</FieldLabel>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Distance (miles)</FieldLabel>
          <input type="number" step="0.01" placeholder="3.1" value={miles} onChange={e => setMiles(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <FieldLabel>Pace (min/mile) — format M:SS</FieldLabel>
        <input placeholder="9:30" value={pace} onChange={e => setPace(e.target.value)} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <FieldLabel>RPE (1–10)</FieldLabel>
        <RPEPicker value={rpe} onChange={setRpe} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <FieldLabel>Note (optional)</FieldLabel>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          placeholder="e.g. Easy aerobic, humid, felt good at mile 2" style={{ resize: 'none' }} />
      </div>

      {previewScore !== null && (
        <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Load score preview</span>
          <span style={{ fontFamily: 'DM Mono', fontSize: 15, color: '#a78bfa' }}>{previewScore}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {onCancel && <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>}
        <button className="btn-primary" style={{ flex: 2, padding: 12 }} onClick={handleSave}>
          {initial ? 'Save Changes' : 'Save Run'}
        </button>
      </div>
    </div>
  )
}

function RunHistory({ runs, onDelete, onEdit }) {
  const [editingId, setEditingId] = useState(null)

  const bestPace   = runs.length ? Math.min(...runs.map(r => r.paceSecs)) : null
  const bestDist   = runs.length ? Math.max(...runs.map(r => r.miles)) : null
  const bestLoad   = runs.length ? Math.max(...runs.map(r => r.loadScore || 0)) : null
  const lastRun    = runs.length ? runs[runs.length - 1] : null
  const daysAgo    = daysSinceCardio(lastRun?.date)

  return (
    <div>
      {/* Summary stats */}
      {runs.length > 0 && (
        <>
          <Label>Personal Bests</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
            <StatTile label="Fastest Pace" value={bestPace ? secondsToPace(bestPace) : '—'} sub="/mile" color="#4ade80" />
            <StatTile label="Longest Run"  value={bestDist ? `${bestDist}mi` : '—'} accent />
            <StatTile label="Peak Load"    value={bestLoad || '—'} color="#a78bfa" />
          </div>
          <Label>Last Run</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
            <StatTile label="When"     value={daysAgo === 0 ? 'Today' : daysAgo === Infinity ? 'Never' : `${daysAgo}d ago`} />
            <StatTile label="Distance" value={lastRun ? `${lastRun.miles}mi` : '—'} />
            <StatTile label="Pace"     value={lastRun ? secondsToPace(lastRun.paceSecs) : '—'} sub="/mile" />
          </div>
        </>
      )}

      {/* Chart */}
      {runs.length >= 2 && (
        <>
          <Label>Progression</Label>
          <div className="card" style={{ padding: '16px', marginBottom: 4 }}>
            <CardioChart
              sessions={runs}
              mainKey="miles"
              mainLabel="Distance (miles)"
              mainColor="#4ade80"
              loadKey="loadScore"
              unit="mi"
            />
          </div>
        </>
      )}

      {/* History */}
      <Label>Session History</Label>
      {runs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)', fontSize: 13, background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 10 }}>
          No runs logged yet. Hit the track.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...runs].reverse().map(r => (
            <div key={r.id}>
              {editingId === r.id ? (
                <RunForm
                  initial={r}
                  onSave={updates => { onEdit(r.id, updates); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <RunSessionCard run={r}
                  onEdit={() => setEditingId(r.id)}
                  onDelete={() => onDelete(r.id)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RunSessionCard({ run, onEdit, onDelete }) {
  const isPBPace = false // handled in parent
  const rpeColor = run.rpe <= 4 ? '#47ffb8' : run.rpe <= 7 ? '#e8ff47' : '#ff8080'
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{fmtCardioDate(run.date)}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>
            {daysSinceCardio(run.date) === 0 ? 'Today' : `${daysSinceCardio(run.date)}d ago`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-danger" style={{ color: 'var(--muted)', padding: '3px 7px' }} onClick={onEdit}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2l3 3-8 8H3v-3L11 2z"/></svg>
          </button>
          <button className="btn-danger" style={{ padding: '3px 7px' }} onClick={onDelete}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v6M10 7v6M4 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"/></svg>
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: run.note ? 8 : 0 }}>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>
          <span style={{ fontFamily: 'DM Mono', color: '#4ade80', fontSize: 15 }}>{run.miles}</span> mi
        </span>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>
          <span style={{ fontFamily: 'DM Mono', color: 'var(--text)', fontSize: 15 }}>{secondsToPace(run.paceSecs)}</span> /mi
        </span>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>
          RPE <span style={{ fontFamily: 'DM Mono', color: rpeColor, fontSize: 15 }}>{run.rpe}</span>
        </span>
        {run.loadScore != null && (
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
            Load <span style={{ fontFamily: 'DM Mono', color: '#a78bfa', fontSize: 15 }}>{run.loadScore}</span>
          </span>
        )}
      </div>
      {run.note && <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>"{run.note}"</p>}
    </div>
  )
}

// ── Row section ───────────────────────────────────────────────────

function RowForm({ onSave, onCancel, initial }) {
  const [date, setDate]     = useState(initial?.date || today())
  const [meters, setMeters] = useState(initial?.meters != null ? String(initial.meters) : '')
  const [split, setSplit]   = useState(initial?.splitSecs ? secondsToPace(initial.splitSecs) : '')
  const [rpe, setRpe]       = useState(initial?.rpe ?? null)
  const [note, setNote]     = useState(initial?.note || '')

  function handleSave() {
    const m = parseInt(meters)
    const ss = rowSplitToSeconds(split)
    if (!m || m <= 0) return alert('Enter a valid distance in meters')
    if (!ss) return alert('Enter split as M:SS (e.g. 1:58) or seconds (e.g. 118)')
    if (!rpe) return alert('Select an RPE')
    const score = rowLoadScore(m, ss, rpe)
    onSave({ id: initial?.id || Date.now().toString(), date, meters: m, splitSecs: ss, rpe, loadScore: score, note })
  }

  const previewScore = useMemo(() => {
    const m = parseInt(meters)
    const ss = rowSplitToSeconds(split)
    if (!m || !ss || !rpe) return null
    return rowLoadScore(m, ss, rpe)
  }, [meters, split, rpe])

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <p className="label" style={{ marginBottom: 16 }}>{initial ? 'Edit Row' : 'Log Row'}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <FieldLabel>Date</FieldLabel>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Distance (meters)</FieldLabel>
          <input type="number" step="100" placeholder="2000" value={meters} onChange={e => setMeters(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <FieldLabel>Split (/500m) — format M:SS or seconds</FieldLabel>
        <input placeholder="1:58" value={split} onChange={e => setSplit(e.target.value)} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <FieldLabel>RPE (1–10)</FieldLabel>
        <RPEPicker value={rpe} onChange={setRpe} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <FieldLabel>Note (optional)</FieldLabel>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          placeholder="e.g. 4×500m intervals, 1:56 avg split" style={{ resize: 'none' }} />
      </div>

      {previewScore !== null && (
        <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Load score preview</span>
          <span style={{ fontFamily: 'DM Mono', fontSize: 15, color: '#a78bfa' }}>{previewScore}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {onCancel && <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>}
        <button className="btn-primary" style={{ flex: 2, padding: 12 }} onClick={handleSave}>
          {initial ? 'Save Changes' : 'Save Row'}
        </button>
      </div>
    </div>
  )
}

function RowSessionCard({ row, onEdit, onDelete }) {
  const rpeColor = row.rpe <= 4 ? '#47ffb8' : row.rpe <= 7 ? '#e8ff47' : '#ff8080'
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{fmtCardioDate(row.date)}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>
            {daysSinceCardio(row.date) === 0 ? 'Today' : `${daysSinceCardio(row.date)}d ago`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-danger" style={{ color: 'var(--muted)', padding: '3px 7px' }} onClick={onEdit}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2l3 3-8 8H3v-3L11 2z"/></svg>
          </button>
          <button className="btn-danger" style={{ padding: '3px 7px' }} onClick={onDelete}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v6M10 7v6M4 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"/></svg>
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: row.note ? 8 : 0 }}>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>
          <span style={{ fontFamily: 'DM Mono', color: '#60a5fa', fontSize: 15 }}>{row.meters.toLocaleString()}</span> m
        </span>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>
          <span style={{ fontFamily: 'DM Mono', color: 'var(--text)', fontSize: 15 }}>{secondsToPace(row.splitSecs)}</span> /500m
        </span>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>
          RPE <span style={{ fontFamily: 'DM Mono', color: rpeColor, fontSize: 15 }}>{row.rpe}</span>
        </span>
        {row.loadScore != null && (
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
            Load <span style={{ fontFamily: 'DM Mono', color: '#a78bfa', fontSize: 15 }}>{row.loadScore}</span>
          </span>
        )}
      </div>
      {row.note && <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>"{row.note}"</p>}
    </div>
  )
}

function RowHistory({ rows, onDelete, onEdit }) {
  const [editingId, setEditingId] = useState(null)

  const bestSplit  = rows.length ? Math.min(...rows.map(r => r.splitSecs)) : null
  const bestDist   = rows.length ? Math.max(...rows.map(r => r.meters)) : null
  const bestLoad   = rows.length ? Math.max(...rows.map(r => r.loadScore || 0)) : null
  const lastRow    = rows.length ? rows[rows.length - 1] : null
  const daysAgo    = daysSinceCardio(lastRow?.date)

  return (
    <div>
      {rows.length > 0 && (
        <>
          <Label>Personal Bests</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
            <StatTile label="Best Split"   value={bestSplit ? secondsToPace(bestSplit) : '—'} sub="/500m" color="#60a5fa" />
            <StatTile label="Longest Row"  value={bestDist ? `${bestDist.toLocaleString()}m` : '—'} accent />
            <StatTile label="Peak Load"    value={bestLoad || '—'} color="#a78bfa" />
          </div>
          <Label>Last Row</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
            <StatTile label="When"     value={daysAgo === 0 ? 'Today' : daysAgo === Infinity ? 'Never' : `${daysAgo}d ago`} />
            <StatTile label="Distance" value={lastRow ? `${lastRow.meters.toLocaleString()}m` : '—'} />
            <StatTile label="Split"    value={lastRow ? secondsToPace(lastRow.splitSecs) : '—'} sub="/500m" />
          </div>
        </>
      )}

      {rows.length >= 2 && (
        <>
          <Label>Progression</Label>
          <div className="card" style={{ padding: '16px', marginBottom: 4 }}>
            <CardioChart
              sessions={rows}
              mainKey="meters"
              mainLabel="Distance (meters)"
              mainColor="#60a5fa"
              loadKey="loadScore"
              unit="m"
            />
          </div>
        </>
      )}

      <Label>Session History</Label>
      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)', fontSize: 13, background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 10 }}>
          No rows logged yet. Get on the erg.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...rows].reverse().map(r => (
            <div key={r.id}>
              {editingId === r.id ? (
                <RowForm
                  initial={r}
                  onSave={updates => { onEdit(r.id, updates); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <RowSessionCard row={r}
                  onEdit={() => setEditingId(r.id)}
                  onDelete={() => onDelete(r.id)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Root Cardio view ──────────────────────────────────────────────

export default function Cardio() {
  const { store, addRun, deleteRun, editRun, addRow, deleteRow, editRow } = useCardioStore()
  const [tab, setTab]         = useState('run')
  const [showRunForm, setShowRunForm] = useState(false)
  const [showRowForm, setShowRowForm] = useState(false)

  const tabs = [
    { key: 'run', label: 'Run',  count: store.runs.length },
    { key: 'row', label: 'Row',  count: store.rows.length },
  ]

  return (
    <section style={{ paddingTop: 24 }}>

      {/* Load score explainer */}
      <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>📊</span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#a78bfa', marginBottom: 2 }}>Load Score</p>
          <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            Run: <span style={{ fontFamily: 'DM Mono' }}>miles × pace_factor × RPE</span> (baseline 10:00/mi) ·
            Row: <span style={{ fontFamily: 'DM Mono' }}>km × split_factor × RPE</span> (baseline 2:00/500m).
            Higher = harder session.
          </p>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setShowRunForm(false); setShowRowForm(false) }} style={{
            padding: '7px 20px',
            fontSize: 13,
            fontFamily: 'DM Mono',
            background: tab === t.key ? 'var(--accent)' : 'var(--surface)',
            color: tab === t.key ? '#0b0b0d' : 'var(--muted)',
            border: `1px solid ${tab === t.key ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 7,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {t.key === 'run' ? '🏃' : '🚣'} {t.label}
            {t.count > 0 && (
              <span style={{
                background: tab === t.key ? 'rgba(0,0,0,0.15)' : 'var(--surface2)',
                color: tab === t.key ? '#0b0b0d' : 'var(--muted)',
                borderRadius: 8, padding: '0px 6px', fontSize: 10, fontFamily: 'DM Mono',
              }}>{t.count}</span>
            )}
          </button>
        ))}

        <button
          className="btn-primary"
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', fontSize: 13 }}
          onClick={() => { tab === 'run' ? setShowRunForm(v => !v) : setShowRowForm(v => !v) }}
        >
          {(tab === 'run' ? showRunForm : showRowForm) ? '✕ Cancel' : '+ Log'}
        </button>
      </div>

      {/* Run tab */}
      {tab === 'run' && (
        <div>
          {showRunForm && (
            <RunForm
              onSave={entry => { addRun(entry); setShowRunForm(false) }}
              onCancel={() => setShowRunForm(false)}
            />
          )}
          <RunHistory
            runs={store.runs}
            onDelete={deleteRun}
            onEdit={(id, updates) => editRun(id, updates)}
          />
        </div>
      )}

      {/* Row tab */}
      {tab === 'row' && (
        <div>
          {showRowForm && (
            <RowForm
              onSave={entry => { addRow(entry); setShowRowForm(false) }}
              onCancel={() => setShowRowForm(false)}
            />
          )}
          <RowHistory
            rows={store.rows}
            onDelete={deleteRow}
            onEdit={(id, updates) => editRow(id, updates)}
          />
        </div>
      )}
    </section>
  )
}
