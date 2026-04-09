import { useState } from 'react'
import Icon from './Icon'
import { daysSince, fmtDate } from '../utils'

const DIFFICULTY_STYLE = {
  Beginner:     { color: '#47ffb8', bg: 'rgba(71,255,184,0.12)', border: 'rgba(71,255,184,0.25)' },
  Intermediate: { color: '#e8ff47', bg: 'rgba(232,255,71,0.12)',  border: 'rgba(232,255,71,0.25)' },
  Advanced:     { color: '#ff8080', bg: 'rgba(255,77,77,0.12)',   border: 'rgba(255,77,77,0.25)' },
}

const EQUIPMENT_COLOR = {
  Barbell:     '#a78bfa',
  Dumbbell:    '#60a5fa',
  Cable:       '#f472b6',
  Machine:     '#fb923c',
  Bodyweight:  '#4ade80',
  Kettlebell:  '#facc15',
  Band:        '#38bdf8',
  Other:       '#94a3b8',
}

function MetaTag({ label, color, bg, border }) {
  return (
    <span style={{
      fontSize: 10,
      fontFamily: 'DM Mono',
      color: color || 'var(--text2)',
      background: bg || 'var(--surface3)',
      border: `1px solid ${border || 'var(--border)'}`,
      borderRadius: 4,
      padding: '1px 6px',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

export default function ExerciseRow({ ex, logs, onClick, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false)
  const last = logs.length ? logs[logs.length - 1] : null
  const days = daysSince(last?.date)
  const stale = days >= 5
  const pr = logs.length ? Math.max(...logs.flatMap(l => l.sets.map(s => s.weight))) : null

  const diffStyle = ex.difficulty ? DIFFICULTY_STYLE[ex.difficulty] : null
  const equipColor = ex.equipment ? (EQUIPMENT_COLOR[ex.equipment] || '#94a3b8') : null

  return (
    <div
      style={{
        background: hovered ? 'var(--surface2)' : 'var(--surface)',
        border: `1px solid ${stale ? 'rgba(255,77,77,0.35)' : 'var(--border)'}`,
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ flex: 1, minWidth: 0 }} onClick={onClick}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
          <span style={{ fontWeight: 500, fontSize: 15 }}>{ex.name}</span>
          {stale && (
            <span className="badge badge-danger">
              {days === Infinity ? 'NEVER' : '5+ DAYS'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
          <MetaTag label={ex.unit} />
          {ex.pattern && <MetaTag label={ex.pattern} color="var(--accent)" bg="rgba(232,255,71,0.08)" border="rgba(232,255,71,0.2)" />}
          {ex.equipment && equipColor && (
            <MetaTag label={ex.equipment} color={equipColor} bg={`${equipColor}18`} border={`${equipColor}30`} />
          )}
          {ex.difficulty && diffStyle && (
            <MetaTag label={ex.difficulty} color={diffStyle.color} bg={diffStyle.bg} border={diffStyle.border} />
          )}
          {(ex.muscles || []).slice(0, 3).map(m => (
            <MetaTag key={m} label={m} />
          ))}
          {(ex.muscles || []).length > 3 && (
            <MetaTag label={`+${ex.muscles.length - 3} more`} />
          )}
        </div>

        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {last ? `Last session ${days}d ago · ${fmtDate(last.date)}` : 'No sessions logged yet'}
          {pr !== null && ` · PR ${pr}${ex.unit}`}
        </span>
      </div>

      {onEdit && (
        <button className="btn-danger" style={{ color: 'var(--muted)' }}
          onClick={e => { e.stopPropagation(); onEdit() }} title="Edit exercise">
          <Icon name="pencil" size={13} />
        </button>
      )}
      {onDelete && (
        <button className="btn-danger"
          onClick={e => { e.stopPropagation(); onDelete() }} title="Delete exercise">
          <Icon name="trash" size={14} />
        </button>
      )}
      <div style={{ color: 'var(--muted)', flexShrink: 0 }} onClick={onClick}>
        <Icon name="chart" size={14} />
      </div>
    </div>
  )
}
