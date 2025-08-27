'use client'

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Activity, DollarSign, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

// Tipos de gráficos disponibles
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'doughnut' | 'radar'

// Configuración de datos
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

export interface ChartDataset {
  label: string
  data: ChartDataPoint[]
  color?: string
  backgroundColor?: string
  borderColor?: string
  fill?: boolean
}

export interface ChartConfig {
  type: ChartType
  data: ChartDataset[]
  options?: {
    responsive?: boolean
    maintainAspectRatio?: boolean
    plugins?: {
      legend?: {
        display?: boolean
        position?: 'top' | 'bottom' | 'left' | 'right'
      }
      tooltip?: {
        enabled?: boolean
        mode?: 'index' | 'point' | 'nearest' | 'x' | 'y'
      }
    }
    scales?: {
      x?: {
        display?: boolean
        grid?: {
          display?: boolean
        }
      }
      y?: {
        display?: boolean
        grid?: {
          display?: boolean
        }
        beginAtZero?: boolean
      }
    }
  }
}

export interface ChartProps {
  data: ChartDataset[]
  type?: ChartType
  title?: string
  subtitle?: string
  height?: number | string
  width?: number | string
  className?: string
  showLegend?: boolean
  showTooltip?: boolean
  interactive?: boolean
  onDataPointClick?: (dataPoint: ChartDataPoint, datasetIndex: number, pointIndex: number) => void
  onLegendClick?: (datasetIndex: number) => void
  loading?: boolean
  error?: string
  emptyMessage?: string
  timeRange?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  onTimeRangeChange?: (range: string) => void
  showTimeRangeSelector?: boolean
  showExport?: boolean
  onExport?: (format: 'png' | 'svg' | 'csv') => void
}

// Componente principal de gráfico
export function Chart({
  data,
  type = 'line',
  title,
  subtitle,
  height = 300,
  width = '100%',
  className,
  showLegend = true,
  showTooltip = true,
  interactive = true,
  onDataPointClick,
  onLegendClick,
  loading = false,
  error,
  emptyMessage = 'No hay datos disponibles',
  timeRange = '1M',
  onTimeRangeChange,
  showTimeRangeSelector = false,
  showExport = false,
  onExport
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<{ datasetIndex: number; pointIndex: number } | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Verificar si hay datos
  const hasData = useMemo(() => {
    return data.some(dataset => dataset.data.length > 0)
  }, [data])

  // Configuración del gráfico
  const chartConfig = useMemo((): ChartConfig => ({
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top'
        },
        tooltip: {
          enabled: showTooltip,
          mode: 'index'
        }
      },
      scales: {
        x: {
          display: type !== 'pie' && type !== 'doughnut',
          grid: {
            display: type !== 'pie' && type !== 'doughnut'
          }
        },
        y: {
          display: type !== 'pie' && type !== 'doughnut',
          grid: {
            display: type !== 'pie' && type !== 'doughnut'
          },
          beginAtZero: true
        }
      }
    }
  }), [type, data, showLegend, showTooltip])

  // Renderizar gráfico usando Canvas API
  useEffect(() => {
    if (!canvasRef.current || !hasData || loading) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Obtener dimensiones
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Renderizar según el tipo de gráfico
    renderChart(ctx, chartConfig, canvas.width, canvas.height, hoveredPoint, onDataPointClick)
  }, [chartConfig, hasData, loading, hoveredPoint, onDataPointClick])

  // Manejar eventos del mouse
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !hasData) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Encontrar punto más cercano
    const point = findNearestPoint(x, y, chartConfig, rect.width, rect.height)
    setHoveredPoint(point)
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !hasData || !onDataPointClick) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const point = findNearestPoint(x, y, chartConfig, rect.width, rect.height)
    if (point) {
      const dataPoint = data[point.datasetIndex].data[point.pointIndex]
      onDataPointClick(dataPoint, point.datasetIndex, point.pointIndex)
    }
  }

  // Función para exportar
  const handleExport = async (format: 'png' | 'svg' | 'csv') => {
    if (!onExport) return

    setIsExporting(true)
    try {
      await onExport(format)
    } finally {
      setIsExporting(false)
    }
  }

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className={clsx('flex items-center justify-center bg-gray-50 rounded-lg', className)} style={{ height, width }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando gráfico...</p>
        </div>
      </div>
    )
  }

  // Renderizar error
  if (error) {
    return (
      <div className={clsx('flex items-center justify-center bg-red-50 rounded-lg border border-red-200', className)} style={{ height, width }}>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm text-red-700 mb-2">Error al cargar el gráfico</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // Renderizar mensaje vacío
  if (!hasData) {
    return (
      <div className={clsx('flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200', className)} style={{ height, width }}>
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200 p-4', className)}>
      {/* Header */}
      {(title || subtitle || showTimeRangeSelector || showExport) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showTimeRangeSelector && onTimeRangeChange && (
              <Select
                value={timeRange}
                onChange={(value) => onTimeRangeChange(value)}
                options={[
                  { label: '1 Día', value: '1D' },
                  { label: '1 Semana', value: '1W' },
                  { label: '1 Mes', value: '1M' },
                  { label: '3 Meses', value: '3M' },
                  { label: '6 Meses', value: '6M' },
                  { label: '1 Año', value: '1Y' },
                  { label: 'Todo', value: 'ALL' }
                ]}
                size="sm"
                className="w-32"
              />
            )}

            {showExport && (
              <div className="flex gap-1">
                <Button
                  onClick={() => handleExport('png')}
                  size="sm"
                  variant="outline"
                  disabled={isExporting}
                  leftIcon={<Activity className="w-3 h-3" />}
                >
                  PNG
                </Button>
                <Button
                  onClick={() => handleExport('svg')}
                  size="sm"
                  variant="outline"
                  disabled={isExporting}
                  leftIcon={<BarChart3 className="w-3 h-3" />}
                >
                  SVG
                </Button>
                <Button
                  onClick={() => handleExport('csv')}
                  size="sm"
                  variant="outline"
                  disabled={isExporting}
                  leftIcon={<TrendingUp className="w-3 h-3" />}
                >
                  CSV
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas del gráfico */}
      <div className="relative" style={{ height, width }}>
        <canvas
          ref={canvasRef}
          className={clsx(
            'w-full h-full',
            interactive && 'cursor-pointer'
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </div>

      {/* Leyenda personalizada */}
      {showLegend && data.length > 1 && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
          {data.map((dataset, index) => (
            <div
              key={index}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80"
              onClick={() => onLegendClick?.(index)}
            >
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: dataset.color || getDefaultColor(index) }}
              />
              <span className="text-sm text-gray-700">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Función para renderizar el gráfico
function renderChart(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  width: number,
  height: number,
  hoveredPoint: { datasetIndex: number; pointIndex: number } | null,
  onDataPointClick?: (dataPoint: ChartDataPoint, datasetIndex: number, pointIndex: number) => void
) {
  const { type, data } = config
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  switch (type) {
    case 'line':
      renderLineChart(ctx, data, padding, chartWidth, chartHeight, hoveredPoint)
      break
    case 'bar':
      renderBarChart(ctx, data, padding, chartWidth, chartHeight, hoveredPoint)
      break
    case 'pie':
      renderPieChart(ctx, data, width / 2, height / 2, Math.min(width, height) / 2 - padding, hoveredPoint)
      break
    case 'area':
      renderAreaChart(ctx, data, padding, chartWidth, chartHeight, hoveredPoint)
      break
    case 'doughnut':
      renderDoughnutChart(ctx, data, width / 2, height / 2, Math.min(width, height) / 2 - padding, hoveredPoint)
      break
    case 'radar':
      renderRadarChart(ctx, data, width / 2, height / 2, Math.min(width, height) / 2 - padding, hoveredPoint)
      break
  }
}

// Funciones específicas para cada tipo de gráfico
function renderLineChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataset[],
  padding: number,
  width: number,
  height: number,
  hoveredPoint: { datasetIndex: number; pointIndex: number } | null
) {
  // Implementación simplificada del gráfico de líneas
  data.forEach((dataset, datasetIndex) => {
    if (dataset.data.length === 0) return

    const points = dataset.data.map((point, index) => ({
      x: padding + (index / (dataset.data.length - 1)) * width,
      y: padding + height - (point.value / getMaxValue(data)) * height
    }))

    // Dibujar línea
    ctx.beginPath()
    ctx.strokeStyle = dataset.color || getDefaultColor(datasetIndex)
    ctx.lineWidth = 2
    ctx.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    
    ctx.stroke()

    // Dibujar puntos
    points.forEach((point, index) => {
      const isHovered = hoveredPoint?.datasetIndex === datasetIndex && hoveredPoint?.pointIndex === index
      
      ctx.beginPath()
      ctx.fillStyle = dataset.color || getDefaultColor(datasetIndex)
      ctx.arc(point.x, point.y, isHovered ? 6 : 4, 0, 2 * Math.PI)
      ctx.fill()

      if (isHovered) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  })
}

function renderBarChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataset[],
  padding: number,
  width: number,
  height: number,
  hoveredPoint: { datasetIndex: number; pointIndex: number } | null
) {
  const maxValue = getMaxValue(data)
  const barWidth = width / (data[0]?.data.length || 1) / data.length
  const barSpacing = barWidth * 0.1

  data.forEach((dataset, datasetIndex) => {
    dataset.data.forEach((point, index) => {
      const barHeight = (point.value / maxValue) * height
      const x = padding + index * (barWidth * data.length + barSpacing) + datasetIndex * barWidth
      const y = padding + height - barHeight

      const isHovered = hoveredPoint?.datasetIndex === datasetIndex && hoveredPoint?.pointIndex === index

      ctx.fillStyle = isHovered 
        ? adjustColor(dataset.color || getDefaultColor(datasetIndex), 0.8)
        : dataset.color || getDefaultColor(datasetIndex)
      
      ctx.fillRect(x, y, barWidth - barSpacing, barHeight)
    })
  })
}

function renderPieChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataset[],
  centerX: number,
  centerY: number,
  radius: number,
  hoveredPoint: { datasetIndex: number; pointIndex: number } | null
) {
  const total = data[0]?.data.reduce((sum, point) => sum + point.value, 0) || 0
  let currentAngle = 0

  data[0]?.data.forEach((point, index) => {
    const sliceAngle = (point.value / total) * 2 * Math.PI
    const isHovered = hoveredPoint?.pointIndex === index

    ctx.beginPath()
    ctx.fillStyle = isHovered 
      ? adjustColor(point.color || getDefaultColor(index), 0.8)
      : point.color || getDefaultColor(index)
    
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fill()

    currentAngle += sliceAngle
  })
}

function renderAreaChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataset[],
  padding: number,
  width: number,
  height: number,
  hoveredPoint: { datasetIndex: number; pointIndex: number } | null
) {
  // Similar a line chart pero con área rellena
  data.forEach((dataset, datasetIndex) => {
    if (dataset.data.length === 0) return

    const points = dataset.data.map((point, index) => ({
      x: padding + (index / (dataset.data.length - 1)) * width,
      y: padding + height - (point.value / getMaxValue(data)) * height
    }))

    // Dibujar área
    ctx.beginPath()
    ctx.fillStyle = adjustColor(dataset.color || getDefaultColor(datasetIndex), 0.3)
    ctx.moveTo(points[0].x, padding + height)
    ctx.lineTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    
    ctx.lineTo(points[points.length - 1].x, padding + height)
    ctx.closePath()
    ctx.fill()

    // Dibujar línea
    ctx.beginPath()
    ctx.strokeStyle = dataset.color || getDefaultColor(datasetIndex)
    ctx.lineWidth = 2
    ctx.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    
    ctx.stroke()
  })
}

function renderDoughnutChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataset[],
  centerX: number,
  centerY: number,
  radius: number,
  hoveredPoint: { datasetIndex: number; pointIndex: number } | null
) {
  const innerRadius = radius * 0.6
  const total = data[0]?.data.reduce((sum, point) => sum + point.value, 0) || 0
  let currentAngle = 0

  data[0]?.data.forEach((point, index) => {
    const sliceAngle = (point.value / total) * 2 * Math.PI
    const isHovered = hoveredPoint?.pointIndex === index

    ctx.beginPath()
    ctx.fillStyle = isHovered 
      ? adjustColor(point.color || getDefaultColor(index), 0.8)
      : point.color || getDefaultColor(index)
    
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
    ctx.closePath()
    ctx.fill()

    currentAngle += sliceAngle
  })
}

function renderRadarChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataset[],
  centerX: number,
  centerY: number,
  radius: number,
  hoveredPoint: { datasetIndex: number; pointIndex: number } | null
) {
  // Implementación básica de gráfico radar
  const maxValue = getMaxValue(data)
  const angleStep = (2 * Math.PI) / (data[0]?.data.length || 1)

  data.forEach((dataset, datasetIndex) => {
    const points = dataset.data.map((point, index) => {
      const angle = index * angleStep - Math.PI / 2
      const distance = (point.value / maxValue) * radius
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance
      }
    })

    // Dibujar área
    ctx.beginPath()
    ctx.fillStyle = adjustColor(dataset.color || getDefaultColor(datasetIndex), 0.3)
    ctx.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    
    ctx.closePath()
    ctx.fill()

    // Dibujar línea
    ctx.beginPath()
    ctx.strokeStyle = dataset.color || getDefaultColor(datasetIndex)
    ctx.lineWidth = 2
    ctx.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    
    ctx.closePath()
    ctx.stroke()
  })
}

// Funciones auxiliares
function getMaxValue(data: ChartDataset[]): number {
  return Math.max(...data.flatMap(dataset => dataset.data.map(point => point.value)))
}

function getDefaultColor(index: number): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]
  return colors[index % colors.length]
}

function adjustColor(color: string, alpha: number): string {
  // Convertir color hex a rgba
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function findNearestPoint(
  x: number,
  y: number,
  config: ChartConfig,
  width: number,
  height: number
): { datasetIndex: number; pointIndex: number } | null {
  // Implementación simplificada para encontrar el punto más cercano
  // En una implementación real, esto sería más sofisticado
  return null
}

// Componentes especializados para casos de uso comunes
export function LineChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return <Chart type="line" data={data} {...props} />
}

export function BarChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return <Chart type="bar" data={data} {...props} />
}

export function PieChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return <Chart type="pie" data={data} {...props} />
}

export function AreaChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return <Chart type="area" data={data} {...props} />
}

export function DoughnutChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return <Chart type="doughnut" data={data} {...props} />
}

export function RadarChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return <Chart type="radar" data={data} {...props} />
}

// Componente para gráfico de rendimiento de inversiones
export function InvestmentPerformanceChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return (
    <Chart
      type="line"
      data={data}
      title="Rendimiento de Inversión"
      subtitle="Evolución del valor de tu inversión a lo largo del tiempo"
      showTimeRangeSelector
      showExport
      {...props}
    />
  )
}

// Componente para gráfico de distribución de portafolio
export function PortfolioDistributionChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return (
    <Chart
      type="doughnut"
      data={data}
      title="Distribución del Portafolio"
      subtitle="Distribución de tus inversiones por tipo de propiedad"
      showExport
      {...props}
    />
  )
}

// Componente para gráfico de flujo de efectivo
export function CashFlowChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return (
    <Chart
      type="area"
      data={data}
      title="Flujo de Efectivo"
      subtitle="Entradas y salidas de efectivo mensuales"
      showTimeRangeSelector
      showExport
      {...props}
    />
  )
}

// Componente para gráfico de comparación de rendimientos
export function ReturnsComparisonChart({ data, ...props }: Omit<ChartProps, 'type'>) {
  return (
    <Chart
      type="bar"
      data={data}
      title="Comparación de Rendimientos"
      subtitle="Rendimiento anual de diferentes tipos de inversión"
      showExport
      {...props}
    />
  )
}
