import { useState, useCallback, useMemo } from 'react'
import { loadData, saveData, daysSince } from './utils'
import Dashboard from './views/Dashboard'
import Exercises from './views/Exercises'
import Log from './views/Log'
import Library from './views/Library'
import Cardio from './views/Cardio'

export default function App() {
  const [data, setData] = useState(() => {
    const d = loadData()
    return { exercises: d.exercises || [], logs: d.logs || {} }
  })
  const [view, setView] = useState('dashboard')
  const [selectedEx, setSelectedEx] = useState(null)
  const [prModal, setPrModal] = useState(null)

  const persist = useCallback((next) => { setData(next); saveData(next) }, [])

  const staleCount = useMemo(() => {
    return data.exercises.filter(e => {
      const ls = data.logs[e.id] || []
      return daysSince(ls.length ? ls[ls.length - 1].date : null) >= 5
    }).length
  }, [data])

  function addExercise({ name, unit, pattern, equipment, difficulty, muscles, description }) {
    const ex = {
      id: Date.now().toString(), name, unit,
      pattern: pattern || '', equipment: equipment || '',
      difficulty: difficulty || '', muscles: muscles || [],
      description: description || '',
      createdAt: new Date().toISOString(),
    }
    persist({ ...data, exercises: [...data.exercises, ex] })
  }

  function editExercise(id, { name, unit, pattern, equipment, difficulty, muscles, description }) {
    const updates = { name, unit, pattern: pattern || '', equipment: equipment || '',
                      difficulty: difficulty || '', muscles: muscles || [], description: description || '' }
    const exercises = data.exercises.map(e => e.id === id ? { ...e, ...updates } : e)
    persist({ ...data, exercises })
    if (selectedEx?.id === id) setSelectedEx(prev => ({ ...prev, ...updates }))
  }

  function deleteExercise(id) {
    if (!confirm('Delete this exercise and all its history?')) return
    const exercises = data.exercises.filter(e => e.id !== id)
    const logs = { ...data.logs }; delete logs[id]
    persist({ ...data, exercises, logs })
    if (selectedEx?.id === id) { setSelectedEx(null); setView('dashboard') }
  }

  function logToday(exerciseId, entry) {
    const updated = [...(data.logs[exerciseId] || []), entry]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    persist({ ...data, logs: { ...data.logs, [exerciseId]: updated } })
  }

  function logSession(entry, newPRWeight) {
    const updated = [...(data.logs[selectedEx.id] || []), entry]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    persist({ ...data, logs: { ...data.logs, [selectedEx.id]: updated } })
    if (newPRWeight) setPrModal({ exercise: selectedEx.name, weight: newPRWeight, unit: selectedEx.unit })
  }

  function editSession(exerciseId, entryId, updatedEntry) {
    const updated = (data.logs[exerciseId] || [])
      .map(e => e.id === entryId ? { ...e, ...updatedEntry } : e)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    persist({ ...data, logs: { ...data.logs, [exerciseId]: updated } })
  }

  function deleteSession(exerciseId, entryId) {
    if (!confirm('Delete this session?')) return
    const updated = (data.logs[exerciseId] || []).filter(e => e.id !== entryId)
    persist({ ...data, logs: { ...data.logs, [exerciseId]: updated } })
  }

  function selectExercise(ex) {
    setSelectedEx(ex)
    setView('log')
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'exercises', label: 'Exercises' },
    { key: 'library', label: 'Library' },
    { key: 'cardio', label: 'Cardio' },
    { key: 'log', label: selectedEx ? selectedEx.name : 'Log' },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px 100px', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ padding: '28px 0 24px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: 'Unbounded', fontSize: 24, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.5px' }}>FORGE</span>
          <span className="label">Workout Tracker</span>
        </div>
        {staleCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', fontSize: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 2s infinite' }} />
            {staleCount} need attention
          </div>
        )}
      </header>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 4, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
        {navItems.map(({ key, label }) => {
          const active = view === key
          return (
            <button key={key} onClick={() => setView(key)} style={{
              padding: '7px 14px',
              fontSize: 12,
              fontFamily: 'DM Mono',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#0b0b0d' : 'var(--muted)',
              border: `1px solid ${active ? 'var(--accent)' : 'transparent'}`,
              borderRadius: 6,
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {label}
              {key === 'dashboard' && staleCount > 0 && (
                <span style={{ marginLeft: 6, background: active ? '#0b0b0d' : 'var(--danger)', color: '#fff', borderRadius: 10, padding: '1px 5px', fontSize: 9, fontWeight: 700 }}>
                  {staleCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Views */}
      {view === 'dashboard' && (
        <Dashboard
          exercises={data.exercises}
          logs={data.logs}
          onSelect={selectExercise}
          onDelete={deleteExercise}
          onAdd={() => { setView('exercises') }}
          onLogToday={logToday}
        />
      )}

      {view === 'exercises' && (
        <Exercises
          exercises={data.exercises}
          logs={data.logs}
          onAdd={addExercise}
          onEdit={editExercise}
          onDelete={deleteExercise}
          onSelect={selectExercise}
          onLogToday={logToday}
        />
      )}

      {view === 'library' && (
        <Library
          exercises={data.exercises}
          onAddExercise={(ex) => {
            addExercise(ex)
          }}
        />
      )}

      {view === 'cardio' && <Cardio />}

      {view === 'log' && (
        <Log
          exercises={data.exercises}
          logs={data.logs}
          selectedEx={selectedEx}
          onSelect={selectExercise}
          onBack={() => { setSelectedEx(null); setView('dashboard') }}
          onLog={logSession}
          onEditSession={editSession}
          onDeleteSession={deleteSession}
        />
      )}

      {/* PR Modal */}
      {prModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
          onClick={() => setPrModal(null)}
        >
          <div
            style={{ background: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: 16, padding: '36px 32px', textAlign: 'center', maxWidth: 320, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: 14 }}>🏆</div>
            <p style={{ fontFamily: 'Unbounded', fontSize: 13, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 10 }}>PERSONAL RECORD</p>
            <p style={{ fontSize: 28, fontFamily: 'DM Mono', fontWeight: 500, marginBottom: 4 }}>{prModal.weight}{prModal.unit}</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>{prModal.exercise}</p>
            <button className="btn-primary" style={{ width: '100%', padding: 13, fontSize: 15 }} onClick={() => setPrModal(null)}>
              Let's go! 💪
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
