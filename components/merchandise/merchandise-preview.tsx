import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { getArtworkById } from "@/lib/supabase-data"
import { useBackgroundRemoval } from "@/hooks/use-background-removal"
import { Button } from "@/components/ui/button"
import { DownloadIcon, MagicWandIcon } from "@/components/shared-icons"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

const MERCHANDISE_LIST = [
  {
    key: "white-shirt-woman",
    label: "T-shirt (Woman)",
    src: "/merchandise/white-shirt-woman.png",
    aspect: 3 / 4,
  },
  {
    key: "white-shirt-man",
    label: "T-shirt (Man)",
    src: "/merchandise/white-shirt-man.png",
    aspect: 3 / 4,
  },
  {
    key: "white-mug",
    label: "Mug",
    src: "/merchandise/white-mug.png",
    aspect: 3 / 4,
  }
  // Extend for more products
]

// overlay preview: artwork image automatically fetched and displayed on the t-shirt front
export function MerchandisePreview() {
  const params = useParams()
  const artworkId = params.id as string
  const [artwork, setArtwork] = useState<any | null>(null)
  const [position, setPosition] = useState({ x: 0.5, y: 0.38 }) // 百分比中心点
  const [scale, setScale] = useState(1)
  const [artworkSelected, setArtworkSelected] = useState(false) // 是否选中artwork
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const isResizingRef = useRef(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; scale: number; pos: { x: number; y: number } } | null>(null)
  const [lastTouchDist, setLastTouchDist] = useState<number | null>(null)
  const [selectedMerch, setSelectedMerch] = useState(MERCHANDISE_LIST[0].key)
  const [useBackgroundRemoved, setUseBackgroundRemoved] = useState(false) // 是否使用背景移除图

  // background removal related
  const { processedImageUrl, isProcessing, error, processImage, clearError } = useBackgroundRemoval()

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    getArtworkById(artworkId).then(setArtwork).catch(() => setArtwork(null))
  }, [artworkId])

  const originalArtworkUrl = artwork?.image_url || artwork?.imageUrl || "/placeholder.svg"
  const artworkTitle = artwork?.title || "Artwork"
  const merch = MERCHANDISE_LIST.find(m => m.key === selectedMerch) || MERCHANDISE_LIST[0]

  // determine the current artwork image to display
  const currentArtworkUrl = useBackgroundRemoved && processedImageUrl ? processedImageUrl : originalArtworkUrl

  // handle background removal toggle
  const handleBackgroundRemovalToggle = async () => {
    if (!useBackgroundRemoved) {
      // switch to background removal mode
      if (!processedImageUrl) {
        await processImage(originalArtworkUrl)
      }
      setUseBackgroundRemoved(true)
    } else {
      // switch back to original image
      setUseBackgroundRemoved(false)
    }
  }

  // download artwork image with background removed
  const handleDownloadArtwork = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    const url = processedImageUrl || originalArtworkUrl
    const link = document.createElement('a')
    link.href = url
    link.download = `${artworkTitle.replace(/\s+/g, '_')}_artwork.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // download composite product preview image
  const handleDownloadComposite = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (!containerRef.current) return
    // Load product image
    const merchImg = await loadImage(merch.src)
    const width = merchImg.naturalWidth
    const height = merchImg.naturalHeight
    // Create canvas, draw product and artwork
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(merchImg, 0, 0, width, height)
    // Load artwork
    const artworkImg = await loadImage(currentArtworkUrl)
    // Calculate overlay area
    const artworkW = scale * 0.48 * width
    const artworkH = scale * 0.32 * height
    const left = (position.x - (scale * 0.48) / 2) * width
    const top = (position.y - (scale * 0.32) / 2) * height
    // Keep artwork aspect ratio (contain)
    const aspectSrc = artworkImg.naturalWidth / artworkImg.naturalHeight
    const aspectDst = artworkW / artworkH
    let drawW = artworkW
    let drawH = artworkH
    let offsetX = 0
    let offsetY = 0
    if (aspectSrc > aspectDst) {
      // artwork is wider, fill width
      drawW = artworkW
      drawH = artworkW / aspectSrc
      offsetY = (artworkH - drawH) / 2
    } else {
      // artwork is taller, fill height
      drawH = artworkH
      drawW = artworkH * aspectSrc
      offsetX = (artworkW - drawW) / 2
    }
    ctx.drawImage(
      artworkImg,
      left + offsetX,
      top + offsetY,
      drawW,
      drawH
    )
    // Export image
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${artworkTitle.replace(/\s+/g, '_')}_composite.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  // load image tool
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  // click outside container to cancel selection
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setArtworkSelected(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // mouse drag artwork
  function onArtworkMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setArtworkSelected(true)
    setDragging(true)
    isDraggingRef.current = true
    const rect = containerRef.current!.getBoundingClientRect()
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top
    dragOffset.current = {
      x: startX - position.x * rect.width,
      y: startY - position.y * rect.height,
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  // anchor drag zoom
  function onAnchorMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setResizing(true)
    isResizingRef.current = true
    const rect = containerRef.current!.getBoundingClientRect()
    const centerX = position.x * rect.width
    const centerY = position.y * rect.height
    const startDist = Math.sqrt(
      Math.pow(e.clientX - rect.left - centerX, 2) + 
      Math.pow(e.clientY - rect.top - centerY, 2)
    )
    dragOffset.current = { x: centerX, y: centerY }
    const initialScale = scale
    
    function onResizeMove(e: MouseEvent) {
      if (!isResizingRef.current) return
      const newDist = Math.sqrt(
        Math.pow(e.clientX - rect.left - dragOffset.current.x, 2) + 
        Math.pow(e.clientY - rect.top - dragOffset.current.y, 2)
      )
      let newScale = initialScale * (newDist / startDist)
      newScale = Math.max(0.2, Math.min(3, newScale))
      setScale(newScale)
    }
    
    function onResizeUp() {
      setResizing(false)
      isResizingRef.current = false
      window.removeEventListener("mousemove", onResizeMove)
      window.removeEventListener("mouseup", onResizeUp)
    }
    
    window.addEventListener("mousemove", onResizeMove)
    window.addEventListener("mouseup", onResizeUp)
  }

  // button area height (px)
  const BUTTONS_HEIGHT = 72
  function onMouseMove(e: MouseEvent) {
    if (!containerRef.current || !isDraggingRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    let x = (e.clientX - rect.left - dragOffset.current.x) / rect.width
    let y = (e.clientY - rect.top - dragOffset.current.y) / rect.height
    x = Math.max(0, Math.min(1, x))
    y = Math.max(0, Math.min(1, y))
    setPosition({ x, y })
  }
  
  function onMouseUp() {
    setDragging(false)
    isDraggingRef.current = false
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", onMouseUp)
  }

  // scroll wheel zoom (only when selected)
  function onWheel(e: React.WheelEvent) {
    if (!artworkSelected) return
    e.preventDefault()
    setScale(s => Math.max(0.2, Math.min(3, s - e.deltaY * 0.001)))
  }

  // mobile touch drag/zoom
  function getTouchDist(touches: any) {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
  function onTouchStart(e: React.TouchEvent) {
    setArtworkSelected(true)
    if (e.touches.length === 1) {
      const rect = containerRef.current!.getBoundingClientRect()
      const startX = e.touches[0].clientX - rect.left
      const startY = e.touches[0].clientY - rect.top
      setTouchStart({
        x: startX,
        y: startY,
        scale,
        pos: { ...position },
      })
    } else if (e.touches.length === 2) {
      setLastTouchDist(getTouchDist(e.touches))
      setTouchStart({
        x: 0,
        y: 0,
        scale,
        pos: { ...position },
      })
    }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!touchStart || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (e.touches.length === 1) {
      // drag
      const dx = e.touches[0].clientX - rect.left - touchStart.x
      const dy = e.touches[0].clientY - rect.top - touchStart.y
      let x = touchStart.pos.x + dx / rect.width
      let y = touchStart.pos.y + dy / rect.height
      x = Math.max(0, Math.min(1, x))
      y = Math.max(0, Math.min(1, y))
      setPosition({ x, y })
    } else if (e.touches.length === 2) {
      // zoom
      const dist = getTouchDist(e.touches)
      if (lastTouchDist && dist) {
        let newScale = touchStart.scale * (dist / lastTouchDist)
        newScale = Math.max(0.2, Math.min(3, newScale))
        setScale(newScale)
      }
    }
  }
  function onTouchEnd(e: React.TouchEvent) {
    setTouchStart(null)
    setLastTouchDist(null)
  }

  // responsive width and overlay area
  const artworkW = scale * 0.48 // container width ratio
  const artworkH = scale * 0.32 // container height ratio
  const left = position.x - artworkW / 2
  const top = position.y - artworkH / 2

  return (
    <div className="flex flex-col items-center w-full">
      {/* background removal toggle button and download button */}
      <div
        className="flex flex-col items-center gap-2 mb-4 w-full bg-white/90 dark:bg-zinc-900/90 shadow-md rounded-xl py-3 px-2 z-10 relative"
      >
        {/* background removal button, single line, centered */}
        <Button
          onClick={handleBackgroundRemovalToggle}
          disabled={isProcessing}
          variant={useBackgroundRemoved ? "default" : "outline"}
          size="sm"
          className="text-sm flex items-center gap-2 mx-auto"
        >
          <MagicWandIcon className="w-4 h-4" />
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : useBackgroundRemoved ? (
            "Background Removed"
          ) : (
            "Remove Background"
          )}
        </Button>
        {/* download buttons side by side, always one line, centered */}
        <div className="flex flex-row gap-2 flex-wrap justify-center w-full">
          <Button
            onClick={handleDownloadArtwork}
            disabled={isProcessing}
            variant="outline"
            size="sm"
            className="text-sm flex items-center gap-2 whitespace-nowrap"
          >
            <DownloadIcon className="w-4 h-4" />
            {useBackgroundRemoved ? 'BG Removed' : 'Original'}
          </Button>
          <Button
            onClick={handleDownloadComposite}
            disabled={isProcessing}
            variant="outline"
            size="sm"
            className="text-sm flex items-center gap-2 whitespace-nowrap"
          >
            <DownloadIcon className="w-4 h-4" />
            Composite
          </Button>
        </div>
        {error && (
          <span className="text-red-500 text-xs">{error}</span>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-md mx-auto aspect-[3/4] select-none"
        style={{ touchAction: "none" }}
        onWheel={onWheel}
      >
        {/* product base image */}
        <Image
          src={merch.src}
          alt={merch.label}
          fill
          className="object-cover rounded-lg pointer-events-none"
          priority
          sizes="(max-width: 768px) 100vw, 400px"
        />
        {/* artwork overlay layer */}
        <div
          className="absolute cursor-move"
          style={{
            left: `${left * 100}%`,
            top: `${top * 100}%`,
            width: `${artworkW * 100}%`,
            height: `${artworkH * 100}%`,
            zIndex: 2,
          }}
          onMouseDown={onArtworkMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          title="Click to select and drag"
        >
          <Image
            src={currentArtworkUrl}
            alt={artworkTitle}
            fill
            className="object-contain drop-shadow-lg pointer-events-none"
            style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}
          />
          {/* show border and anchor when selected */}
          {artworkSelected && (
            <>
              <div className="absolute inset-0 border-2 border-dashed border-[#D2B877] rounded-md pointer-events-none" />
              {/* four corner zoom anchors (only desktop) */}
              <div className="hidden md:block">
                {/* top left anchor */}
                <div 
                  className="absolute -top-1 -left-1 w-3 h-3 bg-[#D2B877] border-2 border-white rounded-full cursor-nw-resize z-10"
                  onMouseDown={onAnchorMouseDown}
                />
                {/* top right anchor */}
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-[#D2B877] border-2 border-white rounded-full cursor-ne-resize z-10"
                  onMouseDown={onAnchorMouseDown}
                />
                {/* bottom left anchor */}
                <div 
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#D2B877] border-2 border-white rounded-full cursor-sw-resize z-10"
                  onMouseDown={onAnchorMouseDown}
                />
                {/* bottom right anchor */}
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#D2B877] border-2 border-white rounded-full cursor-se-resize z-10"
                  onMouseDown={onAnchorMouseDown}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {/* product thumbnail bar */}
      <div className="flex gap-2 mt-4 overflow-x-auto w-full max-w-md mx-auto scrollbar-thin scrollbar-thumb-[#D2B877]/40 scrollbar-track-transparent">
        {MERCHANDISE_LIST.map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMerch(m.key)}
            className={`group relative flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none w-16 h-16 bg-white/80 ${
              m.key === selectedMerch
                ? 'border-[#D2B877] ring-2 ring-[#D2B877] shadow-lg scale-105'
                : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#D2B877]/60 hover:ring-2 hover:ring-[#D2B877]/40'
            }`}
            style={{ position: 'relative' }}
            aria-current={m.key === selectedMerch}
            tabIndex={0}
          >
            <Image
              src={m.src}
              alt={m.label}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-200"
              sizes="64px"
            />
            {/* current item highlight mask */}
            {m.key === selectedMerch && (
              <span className="absolute inset-0 rounded-lg ring-2 ring-[#D2B877] pointer-events-none" />
            )}
            {/* hover preview/highlight effect (desktop) */}
            <span className="hidden lg:block absolute inset-0 group-hover:ring-2 group-hover:ring-[#D2B877]/80 rounded-lg pointer-events-none transition-all duration-200" />
          </button>
        ))}
      </div>
    </div>
  )
} 