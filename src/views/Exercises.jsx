import { useState } from 'react'
import Icon from '../components/Icon'
import ExerciseRow from '../components/ExerciseRow'

const UNITS = ['lbs', 'kg', '%BW', 'none']

function ExerciseEditForm({ ex, onSave, onCancel }) {
  const [name, setName] = useState(ex.name)
  const [unit, setUnit] = useState(ex.unit)

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), unit })
  }

  return (
    <div className="card" style={{ marginBottom: 8, borderColor: 'var(--border2)' }}>
      <p className="label" style={{ marginBottom: 12 }}>Edit Exercise</p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
        style={{ marginBottom: 10 }}
        autoFocus
      />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>Weight unit:</span>
        {UNITS.map(u => (
          <button key={u} onClick={() => setUnit(u)} style={{
            flex: 1, padding: '7px 4px', fontSize: 12, fontFamily: 'DM Mono',
            background: unit === u ? 'var(--accent)' : 'var(--surface2)',
            color: unit === u ? '#0b0b0d' : 'var(--text2)',
            border: `1px solid ${unit === u ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 6,
          }}>
            {u}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  )
}

export default function Exercises({ exercises, logs, onAdd, onEdit, onDelete, onSelect }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('lbs')

  function handleAdd() {
    if (!name.trim()) return
    onAdd({ name: name.trim(), unit })
    setName(''); setUnit('lbs'); setShowAddForm(false)
  }

  function handleEdit(id, updates) {
    onEdit(id, updates)
    setEditingId(null)
  }

  return (
    <section style={{ paddingTop: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500 }}>Exercise Library</h2>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => { setShowAddForm(!showAddForm); setEditingId(null) }}
        >
          <Icon name={showAddForm ? 'x' : 'plus'} size={13} />
          {showAddForm ? 'Cancel' : 'New'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p className="label" style={{ marginBottom: 14 }}>New Exercise</p>
          <input
            placeholder="Exercise name (e.g. Bulgarian Split Squat)"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ marginBottom: 10 }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>Weight unit:</span>
            {UNITS.map(u => (
              <button key={u} onClick={() => setUnit(u)} style={{
                flex: 1, padding: '7px 4px', fontSize: 12, fontFamily: 'DM Mono',
                background: unit === u ? 'var(--accent)' : 'var(--surface2)',
                color: unit === u ? '#0b0b0d' : 'var(--text2)',
                border: `1px solid ${unit === u ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 6,
              }}>
                {u}
              </button>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', padding: 12 }} onClick={handleAdd}>
            Add Exercise
          </button>
        </div>
      )}

      {exercises.length === 0 && !showAddForm ? (
        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem', fontSize: 13 }}>No exercises yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exercises.map(ex => (
            <div key={ex.id}>
              {editingId === ex.id ? (
                <ExerciseEditForm
                  ex={ex}
                  onSave={updates => handleEdit(ex.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <ExerciseRow
                  ex={ex}
                  logs={logs[ex.id] || []}
                  onClick={() => onSelect(ex)}
                  onEdit={() => { setEditingId(ex.id); setShowAddForm(false) }}
                  onDelete={() => onDelete(ex.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

