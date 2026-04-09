import { useState } from 'react'
import { LIBRARY } from '../data/exerciseLibrary'

const DIFFICULTY_COLOR = {
  Beginner:     { bg: 'rgba(71,255,184,0.12)', color: '#47ffb8', border: 'rgba(71,255,184,0.25)' },
  Intermediate: { bg: 'rgba(232,255,71,0.12)',  color: '#e8ff47', border: 'rgba(232,255,71,0.25)' },
  Advanced:     { bg: 'rgba(255,77,77,0.12)',   color: '#ff8080', border: 'rgba(255,77,77,0.25)' },
}

const EQUIPMENT_COLOR = {
  'Barbell':        '#a78bfa',
  'Dumbbell':       '#60a5fa',
  'Cable':          '#f472b6',
  'Machine':        '#fb923c',
  'Machine/Cable':  '#fb923c',
  'Machine/Barbell':'#fb923c',
  'Machine/Dumbbell':'#fb923c',
}

function MuscleTag({ label }) {
  return (
    <span style={{
      background: 'var(--surface3)',
      border: '1px solid var(--border)',
      color: 'var(--text2)',
      borderRadius: 4,
      padding: '2px 7px',
      fontSize: 11,
      fontFamily: 'DM Mono',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function ExerciseCard({ ex, alreadyAdded, onAdd }) {
  const [expanded, setExpanded] = useState(false)
  const diff = DIFFICULTY_COLOR[ex.difficulty]
  const equipColor = EQUIPMENT_COLOR[ex.equipment] || 'var(--text2)'

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      {/* Card header — always visible */}
      <div
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontWeight: 500, fontSize: 14 }}>{ex.name}</span>
            <span style={{
              fontSize: 10,
              fontFamily: 'DM Mono',
              color: equipColor,
              background: `${equipColor}18`,
              border: `1px solid ${equipColor}30`,
              borderRadius: 4,
              padding: '1px 6px',
            }}>
              {ex.equipment}
            </span>
            <span style={{
              fontSize: 10,
              fontFamily: 'DM Mono',
              color: diff.color,
              background: diff.bg,
              border: `1px solid ${diff.border}`,
              borderRadius: 4,
              padding: '1px 6px',
            }}>
              {ex.difficulty}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {ex.muscles.map(m => <MuscleTag key={m} label={m} />)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Add button */}
          <button
            onClick={e => { e.stopPropagation(); if (!alreadyAdded) onAdd(ex) }}
            style={{
              padding: '5px 12px',
              fontSize: 11,
              fontFamily: 'DM Mono',
              borderRadius: 6,
              border: alreadyAdded ? '1px solid var(--border)' : '1px solid var(--accent)',
              background: alreadyAdded ? 'transparent' : 'var(--accent)',
              color: alreadyAdded ? 'var(--muted)' : '#0b0b0d',
              cursor: alreadyAdded ? 'default' : 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {alreadyAdded ? '✓ Added' : '+ Add'}
          </button>

          {/* Expand chevron */}
          <span style={{
            color: 'var(--muted)',
            fontSize: 12,
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}>▶</span>
        </div>
      </div>

      {/* Expanded description */}
      {expanded && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: '1px solid var(--border)',
          paddingTop: 12,
          marginTop: 0,
        }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{ex.description}</p>
        </div>
      )}
    </div>
  )
}

function PatternSection({ group, addedNames, onAdd }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Pattern header */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, cursor: 'pointer' }}
        onClick={() => setCollapsed(c => !c)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <h3 style={{ fontFamily: 'Unbounded', fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em' }}>
              {group.pattern.toUpperCase()}
            </h3>
            <span style={{
              fontSize: 10,
              fontFamily: 'DM Mono',
              color: 'var(--muted)',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '1px 7px',
            }}>
              {group.exercises.length}
            </span>
          </div>
          {!collapsed && (
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{group.description}</p>
          )}
        </div>
        <span style={{
          color: 'var(--muted)',
          fontSize: 12,
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(90deg)',
          transition: 'transform 0.2s',
          flexShrink: 0,
        }}>▼</span>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {group.exercises.map(ex => (
            <ExerciseCard
              key={ex.name}
              ex={ex}
              alreadyAdded={addedNames.has(ex.name)}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Library({ exercises, onAddExercise }) {
  const [search, setSearch] = useState('')
  const [filterEquipment, setFilterEquipment] = useState('All')

  const addedNames = new Set(exercises.map(e => e.name))

  const allEquipment = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine']

  const filtered = LIBRARY.map(group => ({
    ...group,
    exercises: group.exercises.filter(ex => {
      const matchSearch = !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscles.some(m => m.toLowerCase().includes(search.toLowerCase()))
      const matchEquipment = filterEquipment === 'All' || ex.equipment.includes(filterEquipment)
      return matchSearch && matchEquipment
    }),
  })).filter(g => g.exercises.length > 0)

  const totalShown = filtered.reduce((a, g) => a + g.exercises.length, 0)

  function handleAdd(ex) {
    onAddExercise({ name: ex.name, unit: ex.defaultUnit })
  }

  return (
    <section style={{ paddingTop: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Exercise Library</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          {totalShown} exercise{totalShown !== 1 ? 's' : ''} · tap any card to expand · click + Add to track it
        </p>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <input
          placeholder="Search by name or muscle (e.g. hamstrings, biceps…)"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {allEquipment.map(eq => (
            <button key={eq} onClick={() => setFilterEquipment(eq)} style={{
              flex: 1,
              padding: '7px 4px',
              fontSize: 11,
              fontFamily: 'DM Mono',
              background: filterEquipment === eq ? 'var(--accent)' : 'var(--surface2)',
              color: filterEquipment === eq ? '#0b0b0d' : 'var(--muted)',
              border: `1px solid ${filterEquipment === eq ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 6,
            }}>
              {eq}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: 13 }}>
          No exercises match "{search}"
        </div>
      ) : (
        filtered.map(group => (
          <PatternSection
            key={group.pattern}
            group={group}
            addedNames={addedNames}
            onAdd={handleAdd}
          />
        ))
      )}
    </section>
  )
}
