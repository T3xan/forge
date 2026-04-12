import { useState, useMemo } from 'react'
import Icon from '../components/Icon'
import ExerciseRow from '../components/ExerciseRow'
import ExerciseForm from '../components/ExerciseForm'
import { today } from '../utils'

// Quick-log modal: prefilled from last session, editable before saving
function QuickLogModal({ ex, lastSession, onSave, onCancel }) {
  const prefillSets = lastSession
    ? lastSession.sets.map(s => ({ weight: String(s.weight), reps: String(s.reps) }))
    : [{ weight: '', reps: '' }]

  const [sets, setSets] = useState(prefillSets)
  const [note, setNote] = useState('')

  function addSet() { setSets(s => [...s, { weight: sets[sets.length - 1]?.weight || '', reps: sets[sets.length - 1]?.reps || '' }]) }
  function removeSet(i) { setSets(s => s.filter((_, idx) => idx !== i)) }
  function updateSet(i, field, val) { setSets(s => s.map((x, idx) => idx === i ? { ...x, [field]: val } : x)) }

  function handleSave() {
    const valid = sets
      .filter(s => s.reps !== '')
      .map(s => ({ weight: s.weight !== '' ? parseFloat(s.weight) : 0, reps: parseInt(s.reps) }))
    if (!valid.length) return
    const entry = { id: Date.now().toString(), date: today(), sets: valid, note }
    onSave(entry)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 200, padding: '0 0 0 0'
    }} onClick={onCancel}>
      <div style={{
        background: 'var(--surface)', borderRadius: '16px 16px 0 0',
        border: '1px solid var(--border)', padding: '24px 20px 32px',
        width: '100%', maxWidth: 520,
      }} onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'var(--border2)', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p className="label" style={{ marginBottom: 4 }}>Log for Today</p>
            <p style={{ fontWeight: 500, fontSize: 16 }}>{ex.name}</p>
            {lastSession && (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                Pre-filled from last session — adjust as needed
              </p>
            )}
          </div>
          <button className="btn-danger" onClick={onCancel}><Icon name="x" size={14} /></button>
        </div>

        {/* Sets */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)' }}>Sets</label>
            <span className="label">{sets.length} set{sets.length !== 1 ? 's' : ''}</span>
          </div>
          {sets.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', minWidth: 20, textAlign: 'right' }}>{i + 1}</span>
              <input
                type="number"
                placeholder={ex.unit === 'none' ? '—' : `Weight (${ex.unit})`}
                value={s.weight}
                onChange={e => updateSet(i, 'weight', e.target.value)}
                style={{ flex: 2 }}
                disabled={ex.unit === 'none'}
              />
              <input
                type="number"
                placeholder="Reps"
                value={s.reps}
                onChange={e => updateSet(i, 'reps', e.target.value)}
                style={{ flex: 1 }}
              />
              {sets.length > 1 && (
                <button className="btn-danger" onClick={() => removeSet(i)}><Icon name="x" size={12} /></button>
              )}
            </div>
          ))}
          <button className="btn-ghost" style={{ fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }} onClick={addSet}>
            <Icon name="plus" size={12} /> Add Set
          </button>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
            Note <span style={{ color: 'var(--muted)' }}>(optional)</span>
          </label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            placeholder="e.g. RPE 8, felt strong" style={{ resize: 'none' }} />
        </div>

        <button className="btn-primary" style={{ width: '100%', padding: 13, fontSize: 15 }} onClick={handleSave}>
          Save to Today
        </button>
      </div>
    </div>
  )
}

export default function Exercises({ exercises, logs, onAdd, onEdit, onDelete, onSelect, onLogToday }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId]     = useState(null)
  const [quickLogEx, setQuickLogEx]   = useState(null)
  const [search, setSearch]           = useState('')

  function handleAdd(exData) { onAdd(exData); setShowAddForm(false) }
  function handleEdit(id, exData) { onEdit(id, exData); setEditingId(null) }

  const editingEx = editingId ? exercises.find(e => e.id === editingId) : null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return exercises
    return exercises.filter(ex =>
      ex.name.toLowerCase().includes(q) ||
      (ex.pattern || '').toLowerCase().includes(q) ||
      (ex.equipment || '').toLowerCase().includes(q) ||
      (ex.difficulty || '').toLowerCase().includes(q) ||
      (ex.muscles || []).some(m => m.toLowerCase().includes(q))
    )
  }, [exercises, search])

  const quickLogLastSession = quickLogEx
    ? (logs[quickLogEx.id] || []).slice(-1)[0] || null
    : null

  return (
    <section style={{ paddingTop: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500 }}>My Exercises</h2>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => { setShowAddForm(!showAddForm); setEditingId(null) }}
        >
          <Icon name={showAddForm ? 'x' : 'plus'} size={13} />
          {showAddForm ? 'Cancel' : 'New'}
        </button>
      </div>

      {/* New exercise form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p className="label" style={{ marginBottom: 14 }}>New Exercise</p>
          <ExerciseForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} saveLabel="Add Exercise" />
        </div>
      )}

      {/* Search bar */}
      {exercises.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.4 }}>
            <Icon name="search" size={14} />
          </div>
          <input
            placeholder="Search by name, muscle, pattern, equipment…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      )}

      {/* Results */}
      {exercises.length === 0 && !showAddForm ? (
        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem', fontSize: 13 }}>
          No exercises yet. Add one above or browse the Library tab.
        </p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem', fontSize: 13 }}>
          No exercises match "{search}"
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(ex => (
            <div key={ex.id}>
              {editingId === ex.id ? (
                <div className="card" style={{ marginBottom: 4, borderColor: 'var(--border2)' }}>
                  <p className="label" style={{ marginBottom: 14 }}>Edit Exercise</p>
                  <ExerciseForm
                    initial={editingEx}
                    onSave={data => handleEdit(ex.id, data)}
                    onCancel={() => setEditingId(null)}
                    saveLabel="Save Changes"
                  />
                </div>
              ) : (
                <ExerciseRow
                  ex={ex}
                  logs={logs[ex.id] || []}
                  onClick={() => onSelect(ex)}
                  onEdit={() => { setEditingId(ex.id); setShowAddForm(false) }}
                  onDelete={() => onDelete(ex.id)}
                  onLogToday={() => setQuickLogEx(ex)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick-log modal */}
      {quickLogEx && (
        <QuickLogModal
          ex={quickLogEx}
          lastSession={quickLogLastSession}
          onSave={entry => { onLogToday(quickLogEx.id, entry); setQuickLogEx(null) }}
          onCancel={() => setQuickLogEx(null)}
        />
      )}
    </section>
  )
}
