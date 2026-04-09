import { useState } from 'react'
import Icon from '../components/Icon'
import ExerciseRow from '../components/ExerciseRow'
import ExerciseForm from '../components/ExerciseForm'

export default function Exercises({ exercises, logs, onAdd, onEdit, onDelete, onSelect }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  function handleAdd(exData) {
    onAdd(exData)
    setShowAddForm(false)
  }

  function handleEdit(id, exData) {
    onEdit(id, exData)
    setEditingId(null)
  }

  const editingEx = editingId ? exercises.find(e => e.id === editingId) : null

  return (
    <section style={{ paddingTop: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
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

      {showAddForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p className="label" style={{ marginBottom: 14 }}>New Exercise</p>
          <ExerciseForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            saveLabel="Add Exercise"
          />
        </div>
      )}

      {exercises.length === 0 && !showAddForm ? (
        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem', fontSize: 13 }}>
          No exercises yet. Add one above or browse the Library tab.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exercises.map(ex => (
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
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
