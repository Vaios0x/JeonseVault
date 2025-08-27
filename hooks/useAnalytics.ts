'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsService } from '@/services/AnalyticsService'

// Query Keys
export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  stats: () => [...ANALYTICS_KEYS.all, 'stats'] as const,
  userMetrics: (userId: string) => [...ANALYTICS_KEYS.all, 'user', userId] as const,
  pageMetrics: (pageUrl: string) => [...ANALYTICS_KEYS.all, 'page', pageUrl] as const,
  events: (filter: any) => [...ANALYTICS_KEYS.all, 'events', filter] as const,
  funnel: (funnelId: string) => [...ANALYTICS_KEYS.all, 'funnel', funnelId] as const,
  cohort: (cohortId: string) => [...ANALYTICS_KEYS.all, 'cohort', cohortId] as const,
  report: (reportId: string) => [...ANALYTICS_KEYS.all, 'report', reportId] as const,
} as const

// Hook para obtener estadísticas generales
export function useAnalyticsStats(filter?: any) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.stats(),
    queryFn: () => analyticsService.getAnalyticsStats(filter),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para obtener métricas de usuario
export function useUserMetrics(userId?: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.userMetrics(userId || ''),
    queryFn: () => analyticsService.getUserMetrics(userId!),
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para obtener métricas de página
export function usePageMetrics(pageUrl: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.pageMetrics(pageUrl),
    queryFn: () => analyticsService.getPageMetrics(pageUrl),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  })
}

// Hook para obtener eventos
export function useAnalyticsEvents(filter: any) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.events(filter),
    queryFn: () => analyticsService.getEvents(filter),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para obtener métricas de funnel
export function useFunnelMetrics(funnelId: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.funnel(funnelId),
    queryFn: () => analyticsService.getFunnelMetrics(funnelId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  })
}

// Hook para obtener métricas de cohort
export function useCohortMetrics(cohortId: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.cohort(cohortId),
    queryFn: () => analyticsService.getCohortMetrics(cohortId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  })
}

// Hook para obtener reportes
export function useAnalyticsReport(reportId: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.report(reportId),
    queryFn: () => analyticsService.getReport(reportId),
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  })
}

// Hook para generar reportes
export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportName, reportType, startDate, endDate }: {
      reportName: string
      reportType: 'daily' | 'weekly' | 'monthly' | 'custom'
      startDate: Date
      endDate: Date
    }) => analyticsService.generateReport(reportName, reportType, startDate, endDate),
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(ANALYTICS_KEYS.report(data.reportId), data)
        queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
      }
    },
  })
}

// Hook para tracking de eventos
export function useTrackEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (event: any) => analyticsService.trackEvent(event),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.stats() })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.events({}) })
    },
  })
}

// Hook para tracking de transacciones
export function useTrackTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transaction: any) => analyticsService.trackTransaction(transaction),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.stats() })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.events({}) })
    },
  })
}

// Hook para tracking de errores
export function useTrackError() {
  return useMutation({
    mutationFn: ({ error, pageUrl, pageTitle, properties }: {
      error: Error
      pageUrl: string
      pageTitle: string
      properties?: Record<string, any>
    }) => analyticsService.trackError(error, pageUrl, pageTitle, properties),
  })
}

// Hook para tracking de performance
export function useTrackPerformance() {
  return useMutation({
    mutationFn: (metrics: any) => analyticsService.trackPerformance(metrics),
  })
}

// Hook para tracking automático de páginas
export function usePageTracking() {
  const { trackPageView } = useAnalyticsService()

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      trackPageView(window.location.href, document.title)
    }
  }, [trackPageView])
}

// Hook para tracking automático de errores
export function useErrorTracking() {
  const { trackError } = useAnalyticsService()

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleError = (event: ErrorEvent) => {
        trackError(
          new Error(event.message),
          window.location.href,
          document.title,
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        )
      }

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        trackError(
          new Error(event.reason?.message || 'Unhandled Promise Rejection'),
          window.location.href,
          document.title,
          {
            reason: event.reason
          }
        )
      }

      window.addEventListener('error', handleError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      return () => {
        window.removeEventListener('error', handleError)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      }
    }
  }, [trackError])
}

// Hook de conveniencia que expone todas las funciones del servicio
export function useAnalyticsService() {
  return {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackClick: analyticsService.trackClick.bind(analyticsService),
    trackTransaction: analyticsService.trackTransaction.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    trackPerformance: analyticsService.trackPerformance.bind(analyticsService),
    setUserId: analyticsService.setUserId.bind(analyticsService),
    clearUserId: analyticsService.clearUserId.bind(analyticsService),
    getSessionId: analyticsService.getSessionId.bind(analyticsService),
  }
}
