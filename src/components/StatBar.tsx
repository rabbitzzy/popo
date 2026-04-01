interface StatBarProps {
  label: string
  current: number
  max: number
  color?: string
  showValues?: boolean
}

export default function StatBar({ label, current, max, color = '#4ECDC4', showValues = true }: StatBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>{label}</label>
        {showValues && <span style={{ fontSize: '0.75rem', color: '#666' }}>{Math.floor(current)} / {Math.floor(max)}</span>}
      </div>
      <div
        style={{
          width: '100%',
          height: '1.25rem',
          backgroundColor: '#eee',
          borderRadius: '0.25rem',
          overflow: 'hidden',
          border: '1px solid #ddd',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
