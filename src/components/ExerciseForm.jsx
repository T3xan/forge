import { useState } from 'react'

export const UNITS = ['lbs', 'kg', '%BW', 'none']
export const PATTERNS = ['Push', 'Pull', 'Hinge', 'Squat', 'Carry', 'Isolation']
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
export const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Band', 'Other']

export const MUSCLE_GROUPS = [
  'Chest', 'Upper Chest',
  'Anterior Delt', 'Lateral Delt', 'Rear Delt',
  'Lats', 'Rhomboids', 'Traps',
  'Biceps', 'Brachialis', 'Brachioradialis',
  'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Adductors', 'Calves', 'Soleus', 'Gastrocnemius',
  'Spinal Erectors', 'Core', 'Obliques', 'Abs',
  'Forearms', 'Rotator Cuff',
]

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

function ToggleChip({ label, selected, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 11px',
      fontSize: 11,
      fontFamily: 'DM Mono',
      borderRadius: 5,
      border: `1px solid ${selected ? (color || 'var(--accent)') : 'var(--border)'}`,
      background: selected ? `${(color || '#e8ff47')}18` : 'var(--surface2)',
      color: selected ? (color || 'var(--accent)') : 'var(--muted)',
      cursor: 'pointer',
      transition: 'all 0.12s',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p className="label" style={{ marginBottom: 8 }}>{label}</p>
      {children}
    </div>
  )
}

export function useExerciseForm(initial = {}) {
  const [name, setName]           = useState(initial.name || '')
  const [unit, setUnit]           = useState(initial.unit || 'lbs')
  const [pattern, setPattern]     = useState(initial.pattern || '')
  const [difficulty, setDiff]     = useState(initial.difficulty || '')
  const [equipment, setEquipment] = useState(initial.equipment || '')
  const [muscles, setMuscles]     = useState(initial.muscles || [])
  const [description, setDesc]    = useState(initial.description || '')

  function toggleMuscle(m) {
    setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  function toExercise() {
    return { name: name.trim(), unit, pattern, difficulty, equipment, muscles, description: description.trim() }
  }

  function isValid() { return name.trim().length > 0 }

  return { name, setName, unit, setUnit, pattern, setPattern, difficulty, setDiff,
           equipment, setEquipment, muscles, toggleMuscle, description, setDesc,
           toExercise, isValid }
}

export default function ExerciseForm({ initial = {}, onSave, onCancel, saveLabel = 'Add Exercise' }) {
  const form = useExerciseForm(initial)

  return (
    <div>
      {/* Name */}
      <Section label="Exercise Name">
        <input
          placeholder="e.g. Bulgarian Split Squat"
          value={form.name}
          onChange={e => form.setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && form.isValid() && onSave(form.toExercise())}
          autoFocus
        />
      </Section>

      {/* Weight unit */}
      <Section label="Weight Unit">
        <div style={{ display: 'flex', gap: 6 }}>
          {UNITS.map(u => (
            <button key={u} onClick={() => form.setUnit(u)} style={{
              flex: 1, padding: '7px 4px', fontSize: 12, fontFamily: 'DM Mono',
              background: form.unit === u ? 'var(--accent)' : 'var(--surface2)',
              color: form.unit === u ? '#0b0b0d' : 'var(--text2)',
              border: `1px solid ${form.unit === u ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 6,
            }}>
              {u}
            </button>
          ))}
        </div>
      </Section>

      {/* Movement pattern */}
      <Section label="Movement Pattern">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PATTERNS.map(p => (
            <ToggleChip key={p} label={p} selected={form.pattern === p}
              onClick={() => form.setPattern(form.pattern === p ? '' : p)} />
          ))}
        </div>
      </Section>

      {/* Equipment */}
      <Section label="Equipment">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EQUIPMENT_OPTIONS.map(eq => (
            <ToggleChip key={eq} label={eq} selected={form.equipment === eq}
              color={EQUIPMENT_COLOR[eq]}
              onClick={() => form.setEquipment(form.equipment === eq ? '' : eq)} />
          ))}
        </div>
      </Section>

      {/* Difficulty */}
      <Section label="Skill Level">
        <div style={{ display: 'flex', gap: 6 }}>
          {DIFFICULTIES.map(d => {
            const s = DIFFICULTY_STYLE[d]
            return (
              <button key={d} onClick={() => form.setDiff(form.difficulty === d ? '' : d)} style={{
                flex: 1, padding: '7px 4px', fontSize: 11, fontFamily: 'DM Mono',
                background: form.difficulty === d ? s.bg : 'var(--surface2)',
                color: form.difficulty === d ? s.color : 'var(--muted)',
                border: `1px solid ${form.difficulty === d ? s.border : 'var(--border)'}`,
                borderRadius: 6,
              }}>
                {d}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Muscle groups */}
      <Section label="Muscle Groups">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {MUSCLE_GROUPS.map(m => (
            <ToggleChip key={m} label={m} selected={form.muscles.includes(m)}
              color="var(--text2)"
              onClick={() => form.toggleMuscle(m)} />
          ))}
        </div>
      </Section>

      {/* Notes */}
      <Section label="Description / Notes (optional)">
        <textarea
          value={form.description}
          onChange={e => form.setDesc(e.target.value)}
          rows={2}
          placeholder="Cues, technique notes, or any context…"
          style={{ resize: 'none' }}
        />
      </Section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {onCancel && (
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        )}
        <button
          className="btn-primary"
          style={{ flex: 2, padding: 12, opacity: form.isValid() ? 1 : 0.4 }}
          onClick={() => form.isValid() && onSave(form.toExercise())}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}
