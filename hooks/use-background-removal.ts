import { useState, useCallback, useRef } from 'react'
import { removeBackground } from '@imgly/background-removal'

interface UseBackgroundRemovalResult {
  processedImageUrl: string | null
  isProcessing: boolean
  error: string | null
  processImage: (imageUrl: string) => Promise<void>
  clearError: () => void
}

// cache processed images
const imageCache = new Map<string, string>()

export function useBackgroundRemoval(): UseBackgroundRemovalResult {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const processImage = useCallback(async (imageUrl: string) => {
    // check cache
    if (imageCache.has(imageUrl)) {
      setProcessedImageUrl(imageCache.get(imageUrl)!)
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      
      // cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()

      // process background removal
      const blob = await removeBackground(imageUrl, {
        // adjust configuration as needed
        model: 'isnet', // 'isnet' | 'isnet_fp16' | 'isnet_quint8'
        output: {
          format: 'image/png',
          quality: 0.8,
        }
      })

      // create URL
      const processedUrl = URL.createObjectURL(blob)
      
      // cache result
      imageCache.set(imageUrl, processedUrl)
      setProcessedImageUrl(processedUrl)
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to remove background')
        console.error('Background removal error:', err)
      }
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    processedImageUrl,
    isProcessing,
    error,
    processImage,
    clearError
  }
} 