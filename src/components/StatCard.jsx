export default function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '12px 14px',
    }}>
      <p className="label" style={{ marginBottom: 6 }}>{label}</p>
      <p style={{
        fontSize: 22,
        fontWeight: 500,
        fontFamily: 'DM Mono',
        color: accent ? 'var(--accent)' : 'var(--text)',
      }}>
        {value}
      </p>
    </div>
  )
}
