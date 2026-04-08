import Icon from '../components/Icon'
import ExerciseRow from '../components/ExerciseRow'
import { daysSince } from '../utils'

export default function Dashboard({ exercises, logs, onSelect, onDelete, onAdd }) {
  return (
    <section style={{ paddingTop: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 2 }}>Your Exercises</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={onAdd}>
          <Icon name="plus" size={14} /> Add
        </button>
      </div>

      {exercises.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
          <div style={{ marginBottom: 12, opacity: 0.4 }}>
            <Icon name="dumbbell" size={32} color="var(--accent)" />
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
            No exercises yet.<br />Add your first movement to get started.
          </p>
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
    </section>
  )
}
