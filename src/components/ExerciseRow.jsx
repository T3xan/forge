import { useState } from 'react'
import Icon from './Icon'
import { daysSince, fmtDate } from '../utils'

export default function ExerciseRow({ ex, logs, onClick, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false)
  const last = logs.length ? logs[logs.length - 1] : null
  const days = daysSince(last?.date)
  const stale = days >= 5
  const pr = logs.length ? Math.max(...logs.flatMap(l => l.sets.map(s => s.weight))) : null

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
      <div style={{ flex: 1 }} onClick={onClick}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 500, fontSize: 15 }}>{ex.name}</span>
          <span className="badge badge-muted">{ex.unit}</span>
          {stale && (
            <span className="badge badge-danger">
              {days === Infinity ? 'NEVER' : '5+ DAYS'}
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {last
            ? `Last session ${days}d ago · ${fmtDate(last.date)}`
            : 'No sessions logged yet'}
          {pr !== null && ` · PR ${pr}${ex.unit}`}
        </span>
      </div>

      {onEdit && (
        <button
          className="btn-danger"
          style={{ color: 'var(--muted)' }}
          onClick={e => { e.stopPropagation(); onEdit() }}
          title="Edit exercise"
        >
          <Icon name="pencil" size={13} />
        </button>
      )}

      {onDelete && (
        <button
          className="btn-danger"
          onClick={e => { e.stopPropagation(); onDelete() }}
          title="Delete exercise"
        >
          <Icon name="trash" size={14} />
        </button>
      )}

      <div style={{ color: 'var(--muted)' }} onClick={onClick}>
        <Icon name="chart" size={14} />
      </div>
    </div>
  )
}
