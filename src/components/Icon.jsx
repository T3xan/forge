const paths = {
  plus:     'M8 2v12M2 8h12',
  x:        'M4 4l8 8M12 4l-8 8',
  back:     'M10 4L4 8l6 4',
  trash:    'M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v6M10 7v6M4 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9',
  trophy:   'M6 1h4M4 1H2a1 1 0 00-1 1v2a3 3 0 003 3M12 1h2a1 1 0 011 1v2a3 3 0 01-3 3M8 11v3M5 14h6M8 7a3 3 0 100-6 3 3 0 000 6z',
  chart:    'M2 12l4-4 3 3 5-6',
  dumbbell: 'M2 8h12M1 6h2v4H1zM13 6h2v4h-2zM4 5h1v6H4zM11 5h1v6h-1z',
  pencil:   'M11 2l3 3-8 8H3v-3l8-8zM9 4l3 3',
  check:    'M2 8l4 4 8-8',
}

export default function Icon({ name, size = 16, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  )
}
