import { useState, useMemo } from 'react'
import Icon from '../components/Icon'
import ExerciseRow from '../components/ExerciseRow'
import { daysSince, fmtDate, today } from '../utils'

/* ── helpers ── */
function isoToday() { return today() }

function startOfWeek() {
  const d = new Date()
  const day = d.getDay() // 0=Sun
  const diff = d.getDate() - (day === 0 ? 6 : day - 1) // Mon start
  const mon = new Date(d.setDate(diff))
  return mon.toISOString().split('T')[0]
}

function daysOfCurrentWeek() {
  const base = new Date(startOfWeek() + 'T12:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function totalVolume(sets) {
  return sets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0)
}

/* ── tiny components ── */
function StatTile({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '13px 14px',
    }}>
      <p style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 500, fontFamily: 'DM Mono', color: accent ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function SectionHeader({ children }) {
  return (
    <p style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10, marginTop: 24 }}>
      {children}
    </p>
  )
}

function EmptyState({ msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)', fontSize: 13, background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 10 }}>
      {msg}
    </div>
  )
}

/* ── load bar ── */
function LoadBar({ label, value, max, color = 'var(--accent)' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: 'DM Mono', color: 'var(--muted)' }}>{value.toLocaleString()}</span>
      </div>
      <div style={{ height: 5, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

/* ── week heatmap strip ── */
function WeekStrip({ weekDays, logsByDate }) {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const todayStr = isoToday()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
      {weekDays.map((d, i) => {
        const sessions = logsByDate[d] || []
        const hasActivity = sessions.length > 0
        const isToday = d === todayStr
        const isPast = d < todayStr
        return (
          <div key={d} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, fontFamily: 'DM Mono', color: isToday ? 'var(--accent)' : 'var(--muted)', marginBottom: 5 }}>{dayLabels[i]}</p>
            <div style={{
              height: 32,
              borderRadius: 6,
              background: hasActivity ? 'var(--accent)' : isToday ? 'var(--surface3)' : 'var(--surface2)',
              border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !hasActivity && !isPast && !isToday ? 0.4 : 1,
            }}>
              {hasActivity && (
                <span style={{ fontSize: 10, fontFamily: 'DM Mono', fontWeight: 500, color: '#0b0b0d' }}>
                  {sessions.length}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── session mini card ── */
function SessionCard({ exName, session, unit, onGo }) {
  const vol = totalVolume(session.sets)
  const maxW = Math.max(...session.sets.map(s => s.weight || 0))
  return (
    <div
      onClick={onGo}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 9,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontWeight: 500, fontSize: 14 }}>{exName}</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--muted)' }}>
          {session.sets.length} set{session.sets.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {maxW > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>
            Top: <span style={{ color: 'var(--accent)', fontFamily: 'DM Mono' }}>{maxW}{unit}</span>
          </span>
        )}
        {vol > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>
            Vol: <span style={{ fontFamily: 'DM Mono', color: 'var(--text2)' }}>{vol.toLocaleString()}</span>
          </span>
        )}
      </div>
      {session.note && (
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, fontStyle: 'italic' }}>"{session.note}"</p>
      )}
    </div>
  )
}

/* ── My Day ── */
function MyDay({ exercises, logs, onSelect }) {
  const todayStr = isoToday()

  const todaySessions = useMemo(() => {
    const out = []
    exercises.forEach(ex => {
      const exLogs = logs[ex.id] || []
      exLogs.forEach(session => {
        if (session.date === todayStr) out.push({ ex, session })
      })
    })
    return out
  }, [exercises, logs, todayStr])

  const totalVol = useMemo(() =>
    todaySessions.reduce((a, { session }) => a + totalVolume(session.sets), 0)
  , [todaySessions])

  const totalSets = useMemo(() =>
    todaySessions.reduce((a, { session }) => a + session.sets.length, 0)
  , [todaySessions])

  const patterns = useMemo(() => {
    const seen = {}
    todaySessions.forEach(({ ex }) => {
      if (ex.pattern) seen[ex.pattern] = (seen[ex.pattern] || 0) + 1
    })
    return Object.entries(seen).sort((a, b) => b[1] - a[1])
  }, [todaySessions])

  const staleToday = useMemo(() =>
    exercises.filter(ex => {
      const ls = logs[ex.id] || []
      return daysSince(ls.length ? ls[ls.length - 1].date : null) >= 5
    })
  , [exercises, logs])

  return (
    <div>
      {/* Date header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          {new Date(todayStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
        <StatTile label="Sessions" value={todaySessions.length} accent={todaySessions.length > 0} />
        <StatTile label="Sets" value={totalSets} />
        <StatTile label="Volume" value={totalVol > 0 ? totalVol.toLocaleString() : '—'} sub={totalVol > 0 ? 'lbs moved' : undefined} />
      </div>

      {/* Pattern breakdown */}
      {patterns.length > 0 && (
        <>
          <SectionHeader>Movement Patterns Today</SectionHeader>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
            {patterns.map(([p, count]) => (
              <span key={p} style={{
                background: 'rgba(232,255,71,0.1)',
                border: '1px solid rgba(232,255,71,0.25)',
                color: 'var(--accent)',
                borderRadius: 5,
                padding: '4px 10px',
                fontSize: 12,
                fontFamily: 'DM Mono',
              }}>
                {p} ×{count}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Today's sessions */}
      <SectionHeader>Today's Work</SectionHeader>
      {todaySessions.length === 0 ? (
        <EmptyState msg="No sessions logged today. Go lift something." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {todaySessions.map(({ ex, session }) => (
            <SessionCard
              key={session.id}
              exName={ex.name}
              session={session}
              unit={ex.unit}
              onGo={() => onSelect(ex)}
            />
          ))}
        </div>
      )}

      {/* Stale alerts */}
      {staleToday.length > 0 && (
        <>
          <SectionHeader>Needs Attention</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {staleToday.slice(0, 4).map(ex => {
              const ls = logs[ex.id] || []
              const days = daysSince(ls.length ? ls[ls.length - 1].date : null)
              return (
                <div key={ex.id} onClick={() => onSelect(ex)} style={{
                  background: 'var(--surface)',
                  border: '1px solid rgba(255,77,77,0.3)',
                  borderRadius: 9,
                  padding: '11px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</span>
                  <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: '#ff8080' }}>
                    {days === Infinity ? 'never' : `${days}d ago`}
                  </span>
                </div>
              )
            })}
            {staleToday.length > 4 && (
              <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>+{staleToday.length - 4} more</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/* ── My Week ── */
function MyWeek({ exercises, logs, onSelect }) {
  const weekDays = useMemo(() => daysOfCurrentWeek(), [])
  const todayStr = isoToday()
  const weekStart = weekDays[0]

  // Build a date → [{ex, session}] map for this week
  const logsByDate = useMemo(() => {
    const map = {}
    exercises.forEach(ex => {
      ;(logs[ex.id] || []).forEach(session => {
        if (session.date >= weekStart && session.date <= weekDays[6]) {
          if (!map[session.date]) map[session.date] = []
          map[session.date].push({ ex, session })
        }
      })
    })
    return map
  }, [exercises, logs, weekStart, weekDays])

  // Weekly totals
  const weekSessions = useMemo(() =>
    Object.values(logsByDate).flat()
  , [logsByDate])

  const weekVol = useMemo(() =>
    weekSessions.reduce((a, { session }) => a + totalVolume(session.sets), 0)
  , [weekSessions])

  const weekSets = useMemo(() =>
    weekSessions.reduce((a, { session }) => a + session.sets.length, 0)
  , [weekSessions])

  const activeDays = Object.keys(logsByDate).length

  // Pattern load breakdown this week
  const patternLoad = useMemo(() => {
    const map = {}
    weekSessions.forEach(({ ex, session }) => {
      const p = ex.pattern || 'Other'
      if (!map[p]) map[p] = 0
      map[p] += totalVolume(session.sets)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [weekSessions])

  const maxPatternLoad = patternLoad.length ? patternLoad[0][1] : 1

  // Muscle group frequency
  const muscleFreq = useMemo(() => {
    const map = {}
    weekSessions.forEach(({ ex }) => {
      ;(ex.muscles || []).forEach(m => { map[m] = (map[m] || 0) + 1 })
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [weekSessions])

  const maxMuscleFreq = muscleFreq.length ? muscleFreq[0][1] : 1

  // Per-exercise PRs hit this week
  const weekPRs = useMemo(() => {
    const prs = []
    exercises.forEach(ex => {
      const allLogs = logs[ex.id] || []
      const allMax = allLogs.length ? Math.max(...allLogs.flatMap(l => l.sets.map(s => s.weight))) : 0
      const weekMax = weekSessions
        .filter(w => w.ex.id === ex.id)
        .flatMap(w => w.session.sets.map(s => s.weight))
      if (weekMax.length && Math.max(...weekMax) >= allMax && allMax > 0) {
        prs.push({ ex, weight: allMax })
      }
    })
    return prs
  }, [exercises, logs, weekSessions])

  // Compare to last week volume
  const lastWeekStart = useMemo(() => {
    const d = new Date(weekStart + 'T12:00:00')
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  }, [weekStart])

  const lastWeekEnd = useMemo(() => {
    const d = new Date(weekStart + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }, [weekStart])

  const lastWeekVol = useMemo(() => {
    let vol = 0
    exercises.forEach(ex => {
      ;(logs[ex.id] || []).forEach(session => {
        if (session.date >= lastWeekStart && session.date <= lastWeekEnd)
          vol += totalVolume(session.sets)
      })
    })
    return vol
  }, [exercises, logs, lastWeekStart, lastWeekEnd])

  const volDelta = lastWeekVol > 0 ? Math.round(((weekVol - lastWeekVol) / lastWeekVol) * 100) : null

  // Days with sessions sorted for display
  const activeDaysSorted = Object.keys(logsByDate).sort().reverse()

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Week of {fmtDate(weekStart)}
        </p>
      </div>

      {/* Week strip */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
        <WeekStrip weekDays={weekDays} logsByDate={logsByDate} />
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 4 }}>
        <StatTile label="Active Days" value={activeDays} sub="of 7 days" accent={activeDays >= 4} />
        <StatTile label="Total Sessions" value={weekSessions.length} />
        <StatTile
          label="Total Volume"
          value={weekVol > 0 ? weekVol.toLocaleString() : '—'}
          sub={volDelta !== null ? `${volDelta >= 0 ? '+' : ''}${volDelta}% vs last week` : 'no prior week'}
          accent={weekVol > 0}
        />
        <StatTile label="Total Sets" value={weekSets} />
      </div>

      {/* PRs this week */}
      {weekPRs.length > 0 && (
        <>
          <SectionHeader>PRs This Week</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {weekPRs.map(({ ex, weight }) => (
              <div key={ex.id} onClick={() => onSelect(ex)} style={{
                background: 'rgba(232,255,71,0.06)',
                border: '1px solid rgba(232,255,71,0.25)',
                borderRadius: 9,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>🏆 {ex.name}</span>
                <span style={{ fontFamily: 'DM Mono', fontSize: 13, color: 'var(--accent)' }}>{weight}{ex.unit}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Load by pattern */}
      {patternLoad.length > 0 && (
        <>
          <SectionHeader>Load by Movement Pattern</SectionHeader>
          <div className="card" style={{ padding: '16px' }}>
            {patternLoad.map(([pattern, vol]) => (
              <LoadBar key={pattern} label={pattern} value={vol} max={maxPatternLoad} />
            ))}
          </div>
        </>
      )}

      {/* Muscle frequency */}
      {muscleFreq.length > 0 && (
        <>
          <SectionHeader>Muscle Group Frequency</SectionHeader>
          <div className="card" style={{ padding: '16px' }}>
            {muscleFreq.map(([muscle, freq]) => (
              <LoadBar
                key={muscle}
                label={muscle}
                value={freq}
                max={maxMuscleFreq}
                color="#60a5fa"
              />
            ))}
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Number of sessions that trained each group</p>
          </div>
        </>
      )}

      {/* Session log by day */}
      {activeDaysSorted.length > 0 && (
        <>
          <SectionHeader>This Week's Sessions</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeDaysSorted.map(d => (
              <div key={d}>
                <p style={{ fontSize: 12, color: d === todayStr ? 'var(--accent)' : 'var(--text2)', fontWeight: 500, marginBottom: 6 }}>
                  {d === todayStr ? 'Today' : new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {logsByDate[d].map(({ ex, session }) => (
                    <SessionCard
                      key={session.id}
                      exName={ex.name}
                      session={session}
                      unit={ex.unit}
                      onGo={() => onSelect(ex)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {weekSessions.length === 0 && (
        <EmptyState msg="No sessions logged this week yet." />
      )}
    </div>
  )
}

/* ── Dashboard root ── */
export default function Dashboard({ exercises, logs, onSelect, onDelete, onAdd }) {
  const [tab, setTab] = useState('day')

  const staleCount = useMemo(() =>
    exercises.filter(ex => {
      const ls = logs[ex.id] || []
      return daysSince(ls.length ? ls[ls.length - 1].date : null) >= 5
    }).length
  , [exercises, logs])

  const tabs = [
    { key: 'day',       label: 'My Day' },
    { key: 'week',      label: 'My Week' },
    { key: 'exercises', label: 'All Exercises' },
  ]

  return (
    <section style={{ paddingTop: 24 }}>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '6px 14px',
            fontSize: 12,
            fontFamily: 'DM Mono',
            letterSpacing: '0.04em',
            background: tab === t.key ? 'var(--surface2)' : 'transparent',
            color: tab === t.key ? 'var(--text)' : 'var(--muted)',
            border: `1px solid ${tab === t.key ? 'var(--border2)' : 'transparent'}`,
            borderRadius: 6,
          }}>
            {t.label}
            {t.key === 'exercises' && staleCount > 0 && (
              <span style={{ marginLeft: 5, background: 'var(--danger)', color: '#fff', borderRadius: 8, padding: '1px 5px', fontSize: 9 }}>
                {staleCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'day' && (
        <MyDay exercises={exercises} logs={logs} onSelect={onSelect} />
      )}

      {tab === 'week' && (
        <MyWeek exercises={exercises} logs={logs} onSelect={onSelect} />
      )}

      {tab === 'exercises' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} tracked
            </p>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={onAdd}>
              <Icon name="plus" size={13} /> Add
            </button>
          </div>
          {exercises.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', borderStyle: 'dashed' }}>
              <div style={{ marginBottom: 12, opacity: 0.4 }}><Icon name="dumbbell" size={28} color="var(--accent)" /></div>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>No exercises yet.</p>
              <button className="btn-primary" onClick={onAdd}>Add Your First Exercise</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exercises.map(ex => (
                <ExerciseRow
                  key={ex.id}
                  ex={ex}
                  logs={logs[ex.id] || []}
                  onClick={() => onSelect(ex)}
                  onDelete={() => onDelete(ex.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
