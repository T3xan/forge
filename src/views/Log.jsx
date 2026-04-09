import { useState, useMemo } from 'react'
import Icon from '../components/Icon'
import StatCard from '../components/StatCard'
import ProgressChart from '../components/ProgressChart'
import ExerciseRow from '../components/ExerciseRow'
import { daysSince, fmtDate, today } from '../utils'

function SetsEditor({ sets, onChange, unit }) {
  function addSet() { onChange([...sets, { weight: '', reps: '' }]) }
  function removeSet(i) { onChange(sets.filter((_, idx) => idx !== i)) }
  function updateSet(i, field, val) { onChange(sets.map((s, idx) => idx === i ? { ...s, [field]: val } : s)) }
  return (
    <div>
      {sets.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', minWidth: 22, textAlign: 'right' }}>{i + 1}</span>
          <input type="number" placeholder={unit === 'none' ? '—' : `Weight (${unit})`} value={s.weight}
            onChange={e => updateSet(i, 'weight', e.target.value)} style={{ flex: 2 }} disabled={unit === 'none'} />
          <input type="number" placeholder="Reps" value={s.reps}
            onChange={e => updateSet(i, 'reps', e.target.value)} style={{ flex: 1 }} />
          {sets.length > 1 && (
            <button className="btn-danger" onClick={() => removeSet(i)}><Icon name="x" size={12} /></button>
          )}
        </div>
      ))}
      <button className="btn-ghost" style={{ fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }} onClick={addSet}>
        <Icon name="plus" size={12} /> Add Set
      </button>
    </div>
  )
}

function SessionEditor({ log, unit, onSave, onCancel }) {
  const [date, setDate] = useState(log.date)
  const [sets, setSets] = useState(log.sets.map(s => ({ weight: String(s.weight), reps: String(s.reps) })))
  const [note, setNote] = useState(log.note || '')

  function handleSave() {
    const valid = sets.filter(s => s.weight !== '' && s.reps !== '')
      .map(s => ({ weight: parseFloat(s.weight), reps: parseInt(s.reps) }))
    if (!valid.length) return
    onSave({ date, sets: valid, note })
  }

  return (
    <div className="card" style={{ marginBottom: 8, borderColor: 'var(--border2)' }}>
      <p className="label" style={{ marginBottom: 14 }}>Edit Session</p>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Sets</label>
        <SetsEditor sets={sets} onChange={setSets} unit={unit} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
          Note <span style={{ color: 'var(--muted)' }}>(optional)</span>
        </label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          placeholder="e.g. Felt strong. RPE 8." style={{ resize: 'none' }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  )
}

function SessionRow({ log, allPR, unit, onEdit, onDelete }) {
  const maxW = Math.max(...log.sets.map(s => s.weight))
  const isPR = maxW === allPR
  const vol = log.sets.reduce((a, s) => a + s.weight * s.reps, 0)
  const daysAgo = daysSince(log.date)
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{fmtDate(log.date)}</span>
          {isPR && <span className="badge badge-accent"><Icon name="trophy" size={10} color="#0b0b0d" />&nbsp;PR</span>}
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {unit !== 'none' && (
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>vol {vol.toLocaleString()}{unit}</span>
          )}
          <button className="btn-danger" style={{ color: 'var(--muted)', padding: '3px 7px' }} onClick={onEdit} title="Edit session">
            <Icon name="pencil" size={12} />
          </button>
          <button className="btn-danger" style={{ padding: '3px 7px' }} onClick={onDelete} title="Delete session">
            <Icon name="trash" size={12} />
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {log.sets.map((s, si) => (
          <span key={si} className="mono" style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--text2)',
          }}>
            {unit !== 'none' ? `${s.weight}${unit} ×` : ''} {s.reps}r
          </span>
        ))}
      </div>
      {log.note && (
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, fontStyle: 'italic' }}>"{log.note}"</p>
      )}
    </div>
  )
}

export default function Log({ exercises, logs, selectedEx, onSelect, onBack, onLog, onEditSession, onDeleteSession }) {
  const [showForm, setShowForm] = useState(false)
  const [logDate, setLogDate] = useState(today())
  const [logSets, setLogSets] = useState([{ weight: '', reps: '' }])
  const [logNote, setLogNote] = useState('')
  const [editingSessionId, setEditingSessionId] = useState(null)

  const exLogs = useMemo(() => selectedEx ? (logs[selectedEx.id] || []) : [], [logs, selectedEx])
  const allPR = exLogs.length ? Math.max(...exLogs.flatMap(l => l.sets.map(s => s.weight))) : 0
  const allMaxReps = exLogs.length ? Math.max(...exLogs.flatMap(l => l.sets.map(s => s.reps))) : 0
  const lastSession = exLogs.length ? exLogs[exLogs.length - 1] : null
  const staleDays = selectedEx ? daysSince(lastSession?.date) : null

  function resetForm() {
    setLogSets([{ weight: '', reps: '' }]); setLogNote(''); setLogDate(today()); setShowForm(false)
  }

  function handleLog() {
    const valid = logSets.filter(s => s.weight !== '' && s.reps !== '')
      .map(s => ({ weight: parseFloat(s.weight), reps: parseInt(s.reps) }))
    if (!valid.length) return
    const entry = { id: Date.now().toString(), date: logDate, sets: valid, note: logNote }
    const isNewPR = valid.some(s => s.weight > allPR)
    onLog(entry, isNewPR ? Math.max(...valid.map(s => s.weight)) : null)
    resetForm()
  }

  function handleEditSession(entryId, updates) {
    onEditSession(selectedEx.id, entryId, updates)
    setEditingSessionId(null)
  }

  function handleDeleteSession(entryId) {
    onDeleteSession(selectedEx.id, entryId)
    setEditingSessionId(null)
  }

  if (!selectedEx) {
    return (
      <section style={{ paddingTop: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Select an Exercise</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Choose which movement to log or review</p>
        {exercises.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Add exercises first from the Exercises tab.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {exercises.map(ex => (
              <ExerciseRow key={ex.id} ex={ex} logs={logs[ex.id] || []} onClick={() => onSelect(ex)} />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section style={{ paddingTop: 28 }}>
      <button className="btn-ghost" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }} onClick={onBack}>
        <Icon name="back" size={13} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Unbounded', fontSize: 20, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>{selectedEx.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-muted">{selectedEx.unit}</span>
            {staleDays >= 5 && (
              <span className="badge badge-danger">
                {staleDays === Infinity ? 'Never trained' : `${staleDays}d since last session`}
              </span>
            )}
          </div>
        </div>
        <button className="btn-primary" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => { setShowForm(!showForm); setEditingSessionId(null) }}>
          <Icon name={showForm ? 'x' : 'plus'} size={13} />
          {showForm ? 'Cancel' : 'Log Session'}
        </button>
      </div>

      {exLogs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
          <StatCard label="Sessions" value={exLogs.length} />
          <StatCard label="PR Weight" value={`${allPR}${selectedEx.unit}`} accent />
          <StatCard label="Max Reps" value={allMaxReps} />
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <p className="label" style={{ marginBottom: 16 }}>New Session</p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Date</label>
            <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)' }}>Sets</label>
              <span className="label">{logSets.length} set{logSets.length !== 1 ? 's' : ''}</span>
            </div>
            <SetsEditor sets={logSets} onChange={setLogSets} unit={selectedEx.unit} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Note <span style={{ color: 'var(--muted)' }}>(optional)</span>
            </label>
            <textarea value={logNote} onChange={e => setLogNote(e.target.value)} rows={2}
              placeholder="e.g. Felt strong. RPE 8. Slight hip flexor tightness." style={{ resize: 'none' }} />
          </div>
          <button className="btn-primary" style={{ width: '100%', padding: 13, fontSize: 15 }} onClick={handleLog}>
            Save Session
          </button>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <p className="label" style={{ marginBottom: 14 }}>Weight Progression</p>
        <ProgressChart logs={exLogs} unit={selectedEx.unit} />
      </div>

      {exLogs.length > 0 && (
        <div className="card">
          <p className="label" style={{ marginBottom: 16 }}>Session History</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...exLogs].reverse().map(log => (
              <div key={log.id}>
                {editingSessionId === log.id ? (
                  <SessionEditor log={log} unit={selectedEx.unit}
                    onSave={updates => handleEditSession(log.id, updates)}
                    onCancel={() => setEditingSessionId(null)} />
                ) : (
                  <SessionRow log={log} allPR={allPR} unit={selectedEx.unit}
                    onEdit={() => { setEditingSessionId(log.id); setShowForm(false) }}
                    onDelete={() => handleDeleteSession(log.id)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
