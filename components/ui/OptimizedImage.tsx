'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { clsx } from 'clsx'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty' | 'data:image/...'
  blurDataURL?: string
  className?: string
  style?: React.CSSProperties
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  aspectRatio?: number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  responsive?: boolean
  webp?: boolean
  avif?: boolean
  lazyThreshold?: number
  skeleton?: boolean
  skeletonClassName?: string
  errorFallback?: React.ReactNode
}

// Componente de skeleton para carga
function ImageSkeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div 
      className={clsx(
        'animate-pulse bg-gray-200 rounded',
        className
      )} 
      style={style}
    />
  )
}

// Componente de error fallback
function ErrorFallback({ alt, className }: { alt: string; className?: string }) {
  return (
    <div className={clsx(
      'flex items-center justify-center bg-gray-100 text-gray-500',
      className
    )}>
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="sr-only">{alt}</span>
    </div>
  )
}

// Hook para intersection observer
function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, options])

  return isIntersecting
}

// Hook para preload de imagen
function useImagePreload(src: string, enabled: boolean = true) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!enabled || !src) return

    const img = new window.Image()
    
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setHasError(true)
    
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, enabled])

  return { isLoaded, hasError }
}

// Componente principal de imagen optimizada
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '100vw',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  className,
  style,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  responsive = true,
  webp = true,
  avif = true,
  lazyThreshold = 50,
  skeleton = true,
  skeletonClassName,
  errorFallback
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersectionObserver(containerRef, {
    rootMargin: `${lazyThreshold}px`
  })

  // Preload de imagen cuando está en viewport
  const { isLoaded: isPreloaded } = useImagePreload(imageSrc, isIntersecting || priority)

  // Manejar error de imagen
  const handleError = useCallback(() => {
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
    }
    setIsLoading(false)
    onError?.()
  }, [fallbackSrc, imageSrc, onError])

  // Manejar carga exitosa
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  // Generar formatos de imagen
  const generateImageFormats = useCallback((baseSrc: string) => {
    if (!responsive) return baseSrc

    const formats = []
    
    if (avif) {
      formats.push(`${baseSrc}?format=avif`)
    }
    
    if (webp) {
      formats.push(`${baseSrc}?format=webp`)
    }
    
    formats.push(baseSrc)
    
    return formats
  }, [responsive, avif, webp])

  // Generar tamaños responsive
  const generateSizes = useCallback(() => {
    if (!responsive) return sizes

    return `(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw`
  }, [responsive, sizes])

  // Calcular dimensiones
  const calculatedWidth = width || (fill ? undefined : 400)
  const calculatedHeight = height || (fill ? undefined : 300)

  // Renderizar skeleton mientras carga
  if (skeleton && isLoading && !isPreloaded) {
    return (
      <div ref={containerRef} className={clsx('relative', className)}>
        <ImageSkeleton 
          className={clsx(
            'w-full h-full',
            skeletonClassName
          )}
          style={{
            width: calculatedWidth,
            height: calculatedHeight,
            aspectRatio: aspectRatio ? `${aspectRatio}` : undefined
          }}
        />
      </div>
    )
  }

  // Renderizar error fallback
  if (hasError) {
    if (errorFallback) {
      return <>{errorFallback}</>
    }
    
    return (
      <div className={clsx('relative', className)}>
        <ErrorFallback 
          alt={alt}
          className={clsx(
            'w-full h-full',
            style
          )}
        />
      </div>
    )
  }

  // Renderizar imagen optimizada
  return (
    <div 
      ref={containerRef}
      className={clsx(
        'relative overflow-hidden',
        className
      )}
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        ...style
      }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={calculatedWidth}
        height={calculatedHeight}
        fill={fill}
        sizes={generateSizes()}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={clsx(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          objectFit,
          objectPosition
        }}
        {...(webp && { formats: ['image/webp'] })}
        {...(avif && { formats: ['image/avif', 'image/webp'] })}
      />
      
      {/* Overlay de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}

// Componente de imagen con lazy loading automático
export function LazyImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      loading="lazy"
      priority={false}
      skeleton={true}
    />
  )
}

// Componente de imagen de alta prioridad
export function PriorityImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      loading="eager"
      priority={true}
      skeleton={false}
    />
  )
}

// Componente de imagen de avatar
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
  ...props
}: OptimizedImageProps & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={clsx(
        'rounded-full',
        className
      )}
      objectFit="cover"
      aspectRatio={1}
      {...props}
    />
  )
}

// Componente de imagen de hero/banner
export function HeroImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={clsx(
        'w-full h-64 md:h-96 lg:h-[500px]',
        className
      )}
      objectFit="cover"
      priority={true}
      sizes="100vw"
      {...props}
    />
  )
}

// Componente de imagen de card
export function CardImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={250}
      className={clsx(
        'w-full h-48 md:h-64',
        className
      )}
      objectFit="cover"
      aspectRatio={16/10}
      {...props}
    />
  )
}

// Componente de imagen de thumbnail
export function ThumbnailImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={150}
      height={150}
      className={clsx(
        'w-24 h-24 md:w-32 md:h-32',
        className
      )}
      objectFit="cover"
      aspectRatio={1}
      {...props}
    />
  )
}

// Hook para preload de imágenes
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadImage = (url: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => resolve()
        img.onerror = () => reject()
        img.src = url
      })
    }

    const loadImages = async () => {
      const promises = urls.map(async (url) => {
        try {
          await loadImage(url)
          setLoadedImages(prev => new Set(prev).add(url))
        } catch {
          setFailedImages(prev => new Set(prev).add(url))
        }
      })

      await Promise.allSettled(promises)
    }

    if (urls.length > 0) {
      loadImages()
    }
  }, [urls])

  return {
    loadedImages: Array.from(loadedImages),
    failedImages: Array.from(failedImages),
    isLoaded: (url: string) => loadedImages.has(url),
    hasFailed: (url: string) => failedImages.has(url),
    allLoaded: urls.every(url => loadedImages.has(url)),
    allFailed: urls.every(url => failedImages.has(url))
  }
}

// Utilidades para optimización de imágenes
export const imageUtils = {
  // Generar URL optimizada
  optimizeUrl(url: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
  } = {}) {
    const params = new URLSearchParams()
    
    if (options.width) params.append('w', options.width.toString())
    if (options.height) params.append('h', options.height.toString())
    if (options.quality) params.append('q', options.quality.toString())
    if (options.format) params.append('f', options.format)
    
    return params.toString() ? `${url}?${params.toString()}` : url
  },

  // Verificar si la imagen está en cache
  isCached(url: string): boolean {
    if (typeof window === 'undefined') return false
    
    const img = new window.Image()
    img.src = url
    return img.complete
  },

  // Preload de imagen
  preload(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve()
      img.onerror = () => reject()
      img.src = url
    })
  },

  // Obtener dimensiones de imagen
  getDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => reject()
      img.src = url
    })
  }
}
