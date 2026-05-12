import { useState } from 'react'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon-Sun display order

const TAG_COLORS = { A: '#e8ff47', B: '#60a5fa', C: '#f472b6' }

export default function ScheduleConfig({ schedule, onUpdate, onClose }) {
  const [local, setLocal] = useState({ ...schedule })

  function setDay(day, val) {
    const next = { ...local, [day]: val }
    setLocal(next)
    onUpdate(next)
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border2)',
      borderRadius: 12,
      padding: '18px 16px',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <p className="label" style={{ marginBottom: 2 }}>Weekly Schedule</p>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Assign A, B, C, or Rest to each day</p>
        </div>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', color: 'var(--muted)',
          fontSize: 18, padding: '2px 6px', cursor: 'pointer',
        }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {DAY_ORDER.map(day => {
          const val = local[day]
          const col = val ? (TAG_COLORS[val] || 'var(--text2)') : null
          return (
            <div key={day} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 10, fontFamily: 'DM Mono', color: 'var(--muted)', marginBottom: 5 }}>
                {DAY_NAMES[day]}
              </p>
              {/* Cycle through: null → A → B → C → null */}
              {['A', 'B', 'C', null].map(opt => {
                const isSel = val === opt
                const optCol = opt ? TAG_COLORS[opt] : null
                if (opt === null) {
                  return (
                    <button key="rest" onClick={() => setDay(day, null)} style={{
                      width: '100%', padding: '6px 2px', fontSize: 10, fontFamily: 'DM Mono',
                      background: !val ? 'var(--surface3)' : 'transparent',
                      color: !val ? 'var(--text2)' : 'var(--muted)',
                      border: `1px solid ${!val ? 'var(--border2)' : 'var(--border)'}`,
                      borderRadius: 5, marginTop: 3,
                    }}>—</button>
                  )
                }
                return (
                  <button key={opt} onClick={() => setDay(day, opt)} style={{
                    width: '100%', padding: '6px 2px', fontSize: 13, fontFamily: 'DM Mono', fontWeight: 700,
                    background: isSel ? `${optCol}20` : 'var(--surface2)',
                    color: isSel ? optCol : 'var(--muted)',
                    border: `1px solid ${isSel ? optCol : 'var(--border)'}`,
                    borderRadius: 5, marginTop: 3,
                  }}>{opt}</button>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
        {['A', 'B', 'C'].map(tag => (
          <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 14, height: 14, borderRadius: 3,
              background: `${TAG_COLORS[tag]}25`,
              border: `1px solid ${TAG_COLORS[tag]}`,
              display: 'inline-block',
            }}/>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>
              {tag} = {Object.entries(local).filter(([,v]) => v === tag).map(([d]) => DAY_NAMES[d]).join(', ') || 'not assigned'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
