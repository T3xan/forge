import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import { fmtDate } from '../utils'

export default function ProgressChart({ logs, unit }) {
  const ref = useRef()
  const chartRef = useRef()

  useEffect(() => {
    if (!ref.current || logs.length < 2) return

    const pts = logs
      .map(l => ({ x: fmtDate(l.date), y: Math.max(...l.sets.map(s => s.weight)) }))
      .filter(p => p.y > 0)
      .slice(-24)

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: pts.map(p => p.x),
        datasets: [{
          data: pts.map(p => p.y),
          borderColor: '#e8ff47',
          backgroundColor: 'rgba(232,255,71,0.06)',
          pointBackgroundColor: '#e8ff47',
          pointBorderColor: '#0b0b0d',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.35,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1c1c22',
            borderColor: '#2a2a34',
            borderWidth: 1,
            titleColor: '#f0ede6',
            bodyColor: '#a0a0b4',
            padding: 10,
            callbacks: { label: ctx => `  ${ctx.raw} ${unit}` },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#666676', font: { size: 11, family: 'DM Mono' }, maxTicksLimit: 8, maxRotation: 0 },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#666676', font: { size: 11, family: 'DM Mono' } },
          },
        },
      },
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [logs, unit])

  if (logs.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--muted)', fontSize: 13 }}>
        Log at least 2 sessions to unlock your progression chart
      </div>
    )
  }

  return <div style={{ height: 220 }}><canvas ref={ref} /></div>
}
