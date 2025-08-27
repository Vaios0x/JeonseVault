import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'destructive'
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800 border border-blue-300',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-300',
    destructive: 'bg-red-100 text-red-800 border border-red-300'
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
