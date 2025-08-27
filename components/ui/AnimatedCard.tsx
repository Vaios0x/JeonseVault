'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  whileHover?: boolean
  whileTap?: boolean
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  duration = 0.3,
  whileHover = true,
  whileTap = true
}: AnimatedCardProps) {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: 'easeOut'
      }
    },
    hover: whileHover ? {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    } : {},
    tap: whileTap ? {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    } : {}
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Componente específico para tarjetas de estadísticas
export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  delay = 0
}: {
  title: string
  value: string
  subtitle?: string
  icon?: ReactNode
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange'
  delay?: number
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50'
  }

  return (
    <AnimatedCard delay={delay} className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </AnimatedCard>
  )
}

// Componente para listas animadas
export function AnimatedList({
  items,
  renderItem,
  className = ''
}: {
  items: any[]
  renderItem: (item: any, index: number) => ReactNode
  className?: string
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Componente para botones animados
export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm hover:shadow-md',
    outline: 'border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  )
}
