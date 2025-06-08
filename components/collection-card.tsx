"use client"

import { Card } from "@/components/ui/card"
import { Share2, ImageOff, User, Heart, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import React, { useRef, useEffect, useState } from "react"
import { UserIcon } from "./shared-icons"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight } from "@/components/shared-icons"

interface CollectionCardProps {
  collection: any
  artworkCount?: number
  isOwnedByUser?: boolean
  fromPage?: "profile" | "explore"
  size?: "sm" | "md"
}

export function CollectionCard({ collection, artworkCount, fromPage }: CollectionCardProps) {
  const artworksCount =
    typeof collection.artworkCount === 'number' ? collection.artworkCount :
    (typeof artworkCount === 'number' ? artworkCount :
      (Array.isArray(collection.artworkIds) ? collection.artworkIds.length : 0))
  const coverImage =
    artworksCount === 0
      ? "/cover.png"
      : (collection.coverImageUrl || collection.cover_image_url || "/uncategorized-collection.png")
  const href = fromPage
    ? `/collections/${collection.id}?from=${fromPage}`
    : `/collections/${collection.id}`
  const curator = collection.curator || {}
  const likeCount = typeof collection.likeCount === 'number' ? collection.likeCount : 0
  return (
    <Link href={href} className="block group h-full">
      <div className="flex flex-col h-full items-start">
        <div className="relative w-full aspect-[1/1] overflow-hidden rounded-xl">
          <Image
            src={coverImage}
            alt={collection.name || collection.title}
            fill
            className="object-cover transition-all duration-200 group-hover:shadow-xl group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 90vw, 260px"
          />
        </div>
        <h3 className="mt-4 text-lg font-bold font-sans text-black dark:text-foreground leading-tight mb-2" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{collection.name || collection.title}</h3>
        <div className="text-sm text-black/80 dark:text-muted-foreground mb-4 mt-0 min-h-[38px] line-clamp-2">{collection.description}</div>
        <div className="flex items-center gap-4 mt-auto mb-1">
          <span className="flex items-center gap-1 text-sm text-black dark:text-foreground font-normal">
            <UserIcon className="w-5 h-5 text-black dark:text-foreground" />
            {curator.username || curator.id || "Unknown"}
          </span>
          <span className="flex items-center gap-1 text-sm text-black dark:text-foreground font-normal">
            <Heart className="w-5 h-5 text-black dark:text-foreground" />
            {likeCount}
          </span>
          <span className="flex items-center gap-1 text-sm text-black dark:text-foreground font-normal">
            <ImageIcon className="w-5 h-5 text-black dark:text-foreground" />
            {artworksCount}
          </span>
        </div>
      </div>
    </Link>
  )
}

interface ArtworkCardProps {
  artwork: any
  onShare?: (artwork: any) => void
  onClick?: (artwork: any) => void
}

export function ArtworkCard({ artwork, onShare, onClick }: ArtworkCardProps) {
  const [imageError, setImageError] = useState(false)
  const router = useRouter()
  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="silver"
          size="icon"
          className="border-[#D2B877] bg-black/30 hover:bg-[#D2B877] text-[#D2B877] hover:text-black"
          tabIndex={0}
          aria-label="Share artwork"
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            onShare?.(artwork)
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
      <Link
        href={`/artwork/${artwork.id}`}
        className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B877] focus-visible:ring-offset-2 rounded-xl"
        tabIndex={0}
        onClick={e => {
          onClick?.(artwork)
        }}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            router.push(`/artwork/${artwork.id}`)
          }
        }}
      >
        <Card
          className={cn(
            "overflow-hidden rounded-xl border transition-all duration-200 w-full relative",
            "hover:shadow-[0_4px_12px_rgba(210,184,119,0.25)] focus-within:shadow-[0_4px_12px_rgba(210,184,119,0.25)]",
            "artwork-card backdrop-blur-sm bg-black/40 border-white/10",
          )}
        >
          <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
            <div className="absolute inset-0">
              {imageError ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center">
                  <ImageOff className="h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">Image not available</p>
                </div>
              ) : (
                <>
                  <Image
                    src={artwork.imageUrl || artwork.image_url || "/placeholder.svg"}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-t-xl"></div>
                </>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
              <h3 className="text-base md:text-lg font-serif text-[#D2B877] line-clamp-1 text-shadow">
                {artwork.title}
              </h3>
              <p className="text-sm text-gray-300 line-clamp-1 text-shadow">{artwork.artist}</p>
              {artwork.venue && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1 text-shadow">{artwork.venue}</p>
              )}
              {artwork.description && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 text-shadow">{artwork.description}</p>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

interface CuratorCardProps {
  curator: {
    id: string
    username: string
    avatarUrl?: string
  }
}

export function CuratorCard({ curator }: CuratorCardProps) {
  return (
    <Link href={`/profile/${curator.id}`} className="block group h-full">
      <div className="flex flex-col items-center h-full p-4 bg-white dark:bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-200">
        <Avatar className="h-20 w-20 mb-4 border-2 border-[#D2B877]">
          <AvatarImage src={curator.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${curator.username}`} alt={curator.username} />
          <AvatarFallback className="bg-[#1F2636] text-[#D2B877] text-2xl">
            {curator.username
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold text-center text-black dark:text-foreground leading-tight" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{curator.username}</h3>
      </div>
    </Link>
  )
}

// Large curator card for carousel (round image, name, no card background)
interface CuratorCardLargeProps {
  curator: {
    id: string
    username: string
    avatarUrl?: string
    isMockData?: boolean
  }
  size?: number // px, for dynamic sizing
  isFirstVisible?: boolean
}

// Helper function to get random avatar from public/avatars
function getRandomAvatar(): string {
  const avatarNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  const randomIndex = Math.floor(Math.random() * avatarNumbers.length)
  return `/avatars/${avatarNumbers[randomIndex]}.png`
}

export function CuratorCardLarge({ curator, size = 180, isFirstVisible }: CuratorCardLargeProps) {
  // Use random avatar if no avatar_url provided
  const avatarSrc = curator.avatarUrl || getRandomAvatar()
  
  // Determine if we should show the link (only for real users, not mock data)
  const shouldShowLink = !curator.isMockData
  
  const cardContent = (
    <div className="flex flex-col items-center h-full">
      <div className={`rounded-full mb-4 overflow-hidden ${isFirstVisible ? 'curator-avatar-ref' : ''}`} style={{ width: size, height: size }}>
        <Avatar className="w-full h-full border-0 shadow-none">
          <AvatarImage 
            src={avatarSrc} 
            alt={curator.username} 
            className="object-cover transition-all duration-200 group-hover:shadow-xl group-hover:scale-[1.05]" 
          />
          <AvatarFallback className="bg-[#1F2636] text-[#D2B877] text-4xl transition-all duration-200 group-hover:scale-[1.05]">
            {curator.username
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <h3 className="text-lg font-semibold text-center text-black dark:text-foreground leading-tight mt-2" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{curator.username}</h3>
    </div>
  )

  if (shouldShowLink) {
    return (
      <Link href={`/profile/${curator.id}`} className="block group h-full">
        {cardContent}
      </Link>
    )
  }

  return (
    <div className="block group h-full cursor-default">
      {cardContent}
    </div>
  )
}

// Responsive Curator Carousel (arrows overlayed, dynamic sizing, full cards always visible)
interface CuratorCarouselProps {
  curators: { id: string; username: string; avatarUrl?: string; isMockData?: boolean }[]
}

export function CuratorCarousel({ curators }: CuratorCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardImageWrapperRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(3)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [imageCenter, setImageCenter] = useState<number | null>(null)

  // gap-6 = 1.5rem = 24px (larger gap for curator cards)
  const gap = 24

  // dynamically calculate visible count and whether it is mobile (adapted for curator cards)
  useEffect(() => {
    function handleResize() {
      const vw = window.innerWidth
      let count = 2
      let mobile = false
      if (vw >= 640) {
        mobile = false
        if (vw >= 1536) count = 6  // More curator cards can fit
        else if (vw >= 1280) count = 5
        else if (vw >= 1024) count = 4
        else if (vw >= 768) count = 3
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

  // accurately get avatar center point
  useEffect(() => {
    if (cardImageWrapperRef.current && containerRef.current) {
      const avatar = cardImageWrapperRef.current.querySelector('.curator-avatar-ref');
      if (avatar) {
        const avatarRect = avatar.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setImageCenter(avatarRect.top - containerRect.top + avatarRect.height / 2);
      }
    }
  }, [containerWidth, visibleCount, curators, carouselIndex]);

  // calculate curator card width (consider avatar + text + gap)
  const cardWidth = visibleCount > 1
    ? (containerWidth - gap * (visibleCount - 1)) / visibleCount
    : containerWidth

  // ensure index does not exceed bounds
  useEffect(() => {
    if (carouselIndex > curators.length - visibleCount) {
      setCarouselIndex(Math.max(0, curators.length - visibleCount))
    }
  }, [visibleCount, curators.length, carouselIndex])

  const canGoLeft = carouselIndex > 0
  const canGoRight = carouselIndex < curators.length - visibleCount

  // gesture slide (only mobile)
  const [dragStartX, setDragStartX] = useState<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    if (!isMobile) return
    setDragStartX(e.touches[0].clientX)
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (!isMobile || dragStartX === null) return
    const delta = e.touches[0].clientX - dragStartX
    // trigger slide threshold
    if (Math.abs(delta) > cardWidth / 3) {
      if (delta < 0 && carouselIndex < curators.length - visibleCount) {
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
      {/* left button, not mobile, accurately align avatar center */}
      {!isMobile && (
        <button
          className="hidden sm:flex absolute left-0 z-20 bg-white dark:bg-card rounded-full w-[64px] h-[64px] items-center justify-center shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-400"
          style={{
            top: imageCenter !== null ? `${imageCenter}px` : "50%",
            transform: "translate(-60%, -50%)"
          }}
          onClick={() => setCarouselIndex(i => Math.max(0, i - 1))}
          disabled={!canGoLeft}
          aria-label="Previous curator"
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
          className="flex gap-6 pb-1 transition-transform duration-300"
          style={{
            transform: `translateX(-${carouselIndex * (cardWidth + gap)}px)`
          }}
        >
          {curators.map((curator, idx) => (
            <div
              key={curator.id + "-" + idx}
              style={{
                width: cardWidth,
                minWidth: cardWidth,
                maxWidth: cardWidth
              }}
              className="flex-shrink-0"
            >
              {/* only add ref to the avatar layer of the current card */}
              <div ref={idx === carouselIndex ? cardImageWrapperRef : undefined}>
                <CuratorCardLarge 
                  curator={curator} 
                  size={Math.min(cardWidth * 0.8, 180)} // 头像大小为卡片宽度的80%，最大180px
                  isFirstVisible={idx === carouselIndex}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* right button, not mobile, accurately align avatar center */}
      {!isMobile && (
        <button
          className="hidden sm:flex absolute right-0 z-20 bg-white dark:bg-card rounded-full w-[64px] h-[64px] items-center justify-center shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-400"
          style={{
            top: imageCenter !== null ? `${imageCenter}px` : "50%",
            transform: "translate(60%, -50%)"
          }}
          onClick={() => setCarouselIndex(i => Math.min(curators.length - visibleCount, i + 1))}
          disabled={!canGoRight}
          aria-label="Next curator"
          type="button"
        >
          <ChevronRight className="w-7 h-7 text-gray-700 dark:text-foreground" />
        </button>
      )}
    </div>
  )
}
