import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import { fmtDate } from '../utils'

function fmtK(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(v)
}

export default function ProgressChart({ logs, unit }) {
  const ref = useRef()
  const volRef = useRef()
  const chartRef = useRef()
  const volChartRef = useRef()

  useEffect(() => {
    if (!ref.current || logs.length < 2) return

    const sliced = logs.slice(-24)

    const weightPts = sliced
      .map(l => ({ x: fmtDate(l.date), y: Math.max(...l.sets.map(s => s.weight)) }))
      .filter(p => p.y > 0)

    const volPts = sliced.map(l => ({
      x: fmtDate(l.date),
      y: l.sets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0),
    }))

    const labels = weightPts.map(p => p.x)

    // Weight chart
    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: weightPts.map(p => p.y),
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

    // Volume chart
    if (volRef.current) {
      if (volChartRef.current) volChartRef.current.destroy()
      volChartRef.current = new Chart(volRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: volPts.map(p => p.y),
            backgroundColor: 'rgba(96,165,250,0.25)',
            borderColor: '#60a5fa',
            borderWidth: 1,
            borderRadius: 3,
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
              callbacks: { label: ctx => `  ${fmtK(ctx.raw)} ${unit}` },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: { color: '#666676', font: { size: 11, family: 'DM Mono' }, maxTicksLimit: 8, maxRotation: 0 },
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: {
                color: '#666676',
                font: { size: 11, family: 'DM Mono' },
                callback: v => fmtK(v),
              },
            },
          },
        },
      })
    }

    return () => {
      if (chartRef.current) chartRef.current.destroy()
      if (volChartRef.current) volChartRef.current.destroy()
    }
  }, [logs, unit])

  if (logs.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--muted)', fontSize: 13 }}>
        Log at least 2 sessions to unlock your progression chart
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e8ff47', marginBottom: 6 }}>Max Weight</p>
      <div style={{ height: 180, marginBottom: 20 }}><canvas ref={ref} /></div>
      <p style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 6 }}>Session Volume</p>
      <div style={{ height: 140 }}><canvas ref={volRef} /></div>
    </div>
  )
}
