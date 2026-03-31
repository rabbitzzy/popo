import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  children,
  disabled = false,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: { backgroundColor: '#4ECDC4', color: '#fff' },
    secondary: { backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd' },
    danger: { backgroundColor: '#FF6B6B', color: '#fff' },
  }

  const sizeStyles = {
    small: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    medium: { padding: '0.5rem 1.25rem', fontSize: '1rem' },
    large: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
  }

  return (
    <button
      disabled={disabled}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: '0.25rem',
        border: variant === 'secondary' ? '1px solid #ddd' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
        }
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
      }}
      {...props}
    >
      {children}
    </button>
  )
}
