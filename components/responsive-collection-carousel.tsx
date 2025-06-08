import React, { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "@/components/shared-icons"
import { CollectionCard } from "@/components/collection-card"

interface ResponsiveCollectionCarouselProps {
  collections: any[]
}

export function ResponsiveCollectionCarousel({ collections }: ResponsiveCollectionCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(3)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [imageCenter, setImageCenter] = useState<number | null>(null)
  const cardImageWrapperRef = useRef<HTMLDivElement>(null)

  // gap-3 = 0.75rem = 12px
  const gap = 12

  // dynamically calculate visible count and whether it is mobile
  useEffect(() => {
    function handleResize() {
      const vw = window.innerWidth
      let count = 2
      let mobile = false
      if (vw >= 640) {
        mobile = false
        if (vw >= 1536) count = 5
        else if (vw >= 1280) count = 4
        else if (vw >= 1024) count = 3
        else count = 2
      } else {
        mobile = true
        count = 2
      }
      setVisibleCount(count)
      setIsMobile(mobile)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // dynamically get container width
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  // accurately get image center point
  useEffect(() => {
    if (cardImageWrapperRef.current && containerRef.current) {
      const img = cardImageWrapperRef.current.querySelector('img');
      if (img) {
        const imgRect = img.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setImageCenter(imgRect.top - containerRect.top + imgRect.height / 2);
      }
    }
  }, [containerWidth, visibleCount, collections, carouselIndex]);

  // card width
  const cardWidth = visibleCount > 1
    ? (containerWidth - gap * (visibleCount - 1)) / visibleCount
    : containerWidth

  // ensure index does not exceed bounds
  useEffect(() => {
    if (carouselIndex > collections.length - visibleCount) {
      setCarouselIndex(Math.max(0, collections.length - visibleCount))
    }
  }, [visibleCount, collections.length, carouselIndex])

  const canGoLeft = carouselIndex > 0
  const canGoRight = carouselIndex < collections.length - visibleCount

  // gesture slide (only mobile)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [dragScroll, setDragScroll] = useState(0)

  function handleTouchStart(e: React.TouchEvent) {
    if (!isMobile) return
    setDragStartX(e.touches[0].clientX)
    setDragScroll(carouselIndex)
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (!isMobile || dragStartX === null) return
    const delta = e.touches[0].clientX - dragStartX
    // trigger slide threshold
    if (Math.abs(delta) > cardWidth / 3) {
      if (delta < 0 && carouselIndex < collections.length - visibleCount) {
        setCarouselIndex(i => i + 1)
        setDragStartX(e.touches[0].clientX)
      } else if (delta > 0 && carouselIndex > 0) {
        setCarouselIndex(i => i - 1)
        setDragStartX(e.touches[0].clientX)
      }
    }
  }
  function handleTouchEnd() {
    setDragStartX(null)
  }

  return (
    <div className="relative w-full flex items-center justify-center">
      {/* left button, not mobile, accurately align image center */}
      {!isMobile && (
        <button
          className="hidden sm:flex absolute left-0 z-20 bg-white dark:bg-card rounded-full w-[64px] h-[64px] items-center justify-center shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-400"
          style={{
            top: imageCenter !== null ? `${imageCenter}px` : "50%",
            transform: "translate(-60%, -50%)"
          }}
          onClick={() => setCarouselIndex(i => Math.max(0, i - 1))}
          disabled={!canGoLeft}
          aria-label="Previous collection"
          type="button"
        >
          <ChevronLeft className="w-7 h-7 text-gray-700 dark:text-foreground" />
        </button>
      )}
      <div
        ref={containerRef}
        className="overflow-hidden w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex gap-3 pb-1 transition-transform duration-300"
          style={{
            transform: `translateX(-${carouselIndex * (cardWidth + gap)}px)`
          }}
        >
          {collections.map((collection, idx) => (
            <div
              key={collection.id + "-" + idx}
              style={{
                width: cardWidth,
                minWidth: cardWidth,
                maxWidth: cardWidth
              }}
              className="flex-shrink-0"
            >
              {/* only add ref to the image layer of the current card */}
              <div ref={idx === carouselIndex ? cardImageWrapperRef : undefined}>
                <CollectionCard
                  collection={collection}
                  artworkCount={collection.artworks_count}
                  fromPage="explore"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* right button, not mobile, accurately align image center */}
      {!isMobile && (
        <button
          className="hidden sm:flex absolute right-0 z-20 bg-white dark:bg-card rounded-full w-[64px] h-[64px] items-center justify-center shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-400"
          style={{
            top: imageCenter !== null ? `${imageCenter}px` : "50%",
            transform: "translate(60%, -50%)"
          }}
          onClick={() => setCarouselIndex(i => Math.min(collections.length - visibleCount, i + 1))}
          disabled={!canGoRight}
          aria-label="Next collection"
          type="button"
        >
          <ChevronRight className="w-7 h-7 text-gray-700 dark:text-foreground" />
        </button>
      )}
    </div>
  )
} 