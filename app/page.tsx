"use client"

import type React from "react"
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import Link from "next/link"
import { Zap, Heart } from "lucide-react"
import Image from "next/image"
import { useAppContext } from "@/context/app-context"
import { CuratorCarousel } from "@/components/collection-card"
import { useEffect, useState, useRef, useCallback } from "react"
import { getTopCollectionsByLikes, getTrendingCurators } from "@/lib/supabase-data"
import { ExhibitNavIcon, UploadIcon, UserIcon, ChevronRight } from "@/components/shared-icons"
import { ResponsiveCollectionCarousel } from "@/components/responsive-collection-carousel"
import { ClientOnly } from '@/components/ClientOnly';

const ClientHeader = dynamic(() => import('@/components/header').then(mod => mod.Header), { ssr: false });

// Mock data for trending curators (used when DB data is insufficient)
const mockCurators = [
  {
    id: "curator1",
    username: "Alexandra Chen",
    avatarUrl: "/avatars/1.png",
    totalLikes: 0,
    collectionCount: 0,
    isMockData: true,
  },
  {
    id: "curator2",
    username: "Marcus Rivera",
    avatarUrl: "/avatars/2.png",
    totalLikes: 0,
    collectionCount: 0,
    isMockData: true,
  },
  {
    id: "curator3",
    username: "Sophia Kim",
    avatarUrl: "/avatars/3.png",
    totalLikes: 0,
    collectionCount: 0,
    isMockData: true,
  },
  {
    id: "curator4",
    username: "Liam Smith",
    avatarUrl: "/avatars/4.png",
    totalLikes: 0,
    collectionCount: 0,
    isMockData: true,
  },
  {
    id: "curator5",
    username: "Emma Johnson",
    avatarUrl: "/avatars/5.png",
    totalLikes: 0,
    collectionCount: 0,
    isMockData: true,
  },
  {
    id: "curator6",
    username: "John Doe",
    avatarUrl: "/avatars/6.png",
    totalLikes: 0,
    collectionCount: 0,
    isMockData: true,
  },
  {
    id: "curator7",
    username: "Jane Doe",
    avatarUrl: "/avatars/7.png",
    totalLikes: 0,
    collectionCount: 0,
    isMockData: true,
  },
]

export default function Home() {
  const { t } = useTranslation();
  // Get collections from context
  const { collections, getArtworksByCollectionId } = useAppContext()

  // Get all collections to display in the scrolling gallery
  const displayCollections = collections

  // 用于展示的collection
  const [topCollections, setTopCollections] = useState<any[]>([])
  const [trendingCurators, setTrendingCurators] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null)
  const userInteracting = useRef(false)
  const autoScrollPaused = useRef(false)

  // Feature card animation logic
  const featureRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const [featureInView, setFeatureInView] = useState([false, false, false])

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)
  const totalCollections = topCollections.length
  
  const canGoLeft = carouselIndex > 0
  const canGoRight = totalCollections > 0 && carouselIndex < totalCollections - 1

  const trackRef = useRef<HTMLDivElement>(null)
  const firstCardRef = useRef<HTMLDivElement>(null)

  // Scroll to the card at the current carouselIndex
  useEffect(() => {
    if (trackRef.current && typeof window !== 'undefined' && window.innerWidth >= 640) { // sm breakpoint
      const cardElements = Array.from(trackRef.current.children[0]?.children || []) as HTMLElement[]
      if (cardElements[carouselIndex]) {
        const targetNode = cardElements[carouselIndex]
        // Calculate scroll position considering the padding of the trackRef container
        const trackPaddingLeft = parseFloat(getComputedStyle(trackRef.current).paddingLeft)
        trackRef.current.scrollTo({
          left: targetNode.offsetLeft - trackPaddingLeft,
          behavior: 'smooth',
        })
      }
    }
  }, [carouselIndex, topCollections])

  const [imageHeight, setImageHeight] = useState(260)
  useEffect(() => {
    if (firstCardRef.current) {
      const imgContainer = firstCardRef.current.querySelector('.aspect-\\[1\\/1\\]') as HTMLElement
      if (imgContainer) {
        setImageHeight(imgContainer.offsetHeight)
      }
    }
  }, [topCollections, isLoaded]) // Re-run if collections or isLoaded changes

  useEffect(() => {
    setIsLoaded(true)
    
    // Load both collections and curators
    Promise.all([
      getTopCollectionsByLikes(10),
      getTrendingCurators(7)
    ]).then(([collections, curators]) => {
      setTopCollections(collections)
      
      // If we don't have enough curators from DB, supplement with mock data
      let finalCurators = [...curators]
      if (finalCurators.length < 7) {
        const needed = 7 - finalCurators.length
        const mockToAdd = mockCurators.slice(0, needed)
        finalCurators = [...finalCurators, ...mockToAdd]
      }
      
      setTrendingCurators(finalCurators)
    })
  }, [])

  // Helper to pause auto-scroll
  const pauseAutoScroll = useCallback(() => {
    userInteracting.current = true
    autoScrollPaused.current = true
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current)
      autoScrollTimer.current = null
    }
  }, [])
  // Helper to resume auto-scroll after delay
  const resumeAutoScroll = useCallback(() => {
    userInteracting.current = false
    setTimeout(() => {
      if (!userInteracting.current) {
        autoScrollPaused.current = false
        startAutoScroll()
      }
    }, 1000)
  }, [])
  // Start auto-scroll interval
  const startAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) return
    const container = scrollContainerRef.current
    if (!container) return
    autoScrollTimer.current = setInterval(() => {
      if (!autoScrollPaused.current && container) {
        container.scrollLeft += 1.2 // speed px per tick
        // seamless loop
        const totalWidth = container.scrollWidth / 2
        if (container.scrollLeft >= totalWidth) {
          container.scrollLeft -= totalWidth
        }
      }
    }, 16) // ~60fps
  }, [])

  // Mouse drag for horizontal scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    pauseAutoScroll()
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = "grabbing"
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }
  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
    if (scrollContainerRef.current) scrollContainerRef.current.style.cursor = "grab"
    resumeAutoScroll()
  }
  // Mouse wheel for horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    pauseAutoScroll()
    if (!scrollContainerRef.current) return
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
    // Otherwise, let native horizontal wheel work
    // Resume auto-scroll after short delay
    clearTimeout((handleWheel as any)._wheelTimeout)
    ;(handleWheel as any)._wheelTimeout = setTimeout(resumeAutoScroll, 1200)
  }
  // Infinite scroll effect (for manual scroll)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const totalWidth = container.scrollWidth / 2
      if (container.scrollLeft >= totalWidth) {
        container.scrollLeft -= totalWidth
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += totalWidth
      }
    }
    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [topCollections])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.idx)
          if (entry.isIntersecting) {
            setFeatureInView((prev) => {
              if (prev[idx]) return prev
              const next = [...prev]
              next[idx] = true
              return next
            })
          }
        })
      },
      { threshold: 0.3 }
    )
    featureRefs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current)
    })
    return () => {
      featureRefs.forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current)
      })
      observer.disconnect()
    }
  }, [isLoaded]) // Depend on isLoaded so refs are available

  // Common button style class
  const buttonStyle =
    "min-w-[180px] h-12 px-6 font-semibold text-primary bg-background border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 ease-in-out"

  return (
    <ClientOnly>
      <div className="relative flex flex-col min-h-screen">
        {/* Background Image - Fixed position */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]"></div>
        </div>

        {/* Content - Relative position with z-index */}
        <div className="relative z-10 flex-grow">
          <Suspense fallback={null}>
            <ClientHeader />
          </Suspense>
          <main>
            {/* Hero Section (feature introduction area) */}
            <section className="w-full min-h-screen flex items-center justify-center relative overflow-hidden p-0">
              {/* pure background image, no fog */}
              <Image
                src="/gallery-background.png"
                alt="Gallery Background"
                fill
                priority
                className="object-cover object-center absolute inset-0 z-0"
                sizes="100vw"
              />
              <div className="container px-4 md:px-6 relative z-20 flex flex-col items-center justify-center min-h-[340px]">
                <h1
                  className="font-sans font-bold text-white text-center drop-shadow-xl w-full max-w-full break-words leading-tight"
                  style={{
                    fontSize: 'clamp(1.5rem, 7vw, 3.5rem)', // smaller minimum value, mobile more suitable
                    letterSpacing: '0.01em',
                    textShadow: '0 4px 32px rgba(0,0,0,0.5)',
                    whiteSpace: 'normal', // allow multiple lines
                    overflow: 'visible',
                    textOverflow: 'clip',
                  }}
                >
                  {t('home.heroTitle')}
                </h1>
                <p className="mt-6 mb-10 text-lg md:text-xl text-white/90 text-center font-light max-w-4xl mx-auto">{t('home.heroDesc')}</p>
                <div className="flex flex-col md:inline-flex md:flex-row gap-4 justify-center w-full md:w-auto max-w-xs md:max-w-none">
                  <Link href="/collections" className="w-full md:w-auto">
                    <button className="w-full md:min-w-[240px] md:w-auto px-8 py-3 border-2 border-white text-white text-lg font-semibold rounded-md transition-all duration-200 bg-transparent hover:bg-white hover:text-black hover:border-white hover:shadow-lg whitespace-nowrap flex justify-center">
                      {t('home.discoverExhibits')}
                    </button>
                  </Link>
                  <Link href="/artwork/new" className="w-full md:w-auto">
                    <button className="w-full md:min-w-[240px] md:w-auto px-8 py-3 border-2 border-white text-white text-lg font-semibold rounded-md transition-all duration-200 bg-transparent hover:bg-white hover:text-black hover:border-white hover:shadow-lg whitespace-nowrap flex justify-center">
                      {t('home.startExhibit')}
                    </button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Around You Section */}
            <div className="container px-4 md:px-6 mb-12 mt-10 md:mt-16">
              <div className="bg-card rounded-xl p-4 sm:p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className={`text-2xl md:text-3xl font-sans font-bold text-[#222] dark:text-foreground tracking-tight drop-shadow-sm flex items-center gap-2 ${isLoaded ? "fade-up fade-up-delay-1" : "opacity-0"}`}
                  >
                    <ExhibitNavIcon className="h-7 w-7 md:h-8 md:w-8 -mt-1" style={{ color: 'currentColor' }} />
                    {t('home.featuredExhibits')}
                  </h2>
                  <Link href="/collections" className="flex items-center gap-1 text-black dark:text-foreground text-sm font-semibold transition-colors hover:text-[#ffb900] dark:hover:text-[#ffb900]">
                    {t('home.browseAll')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Responsive Carousel Area */}
                <ResponsiveCollectionCarousel collections={topCollections} />
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="container px-4 md:px-6">
              <div className="border-t border-gray-200/60 dark:border-gray-700/60 my-12" />
            </div>

            {/* Trending Curators Section */}
            <div className="container px-4 md:px-6 mb-12">
              <div className="bg-card rounded-xl p-4 sm:p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-sans font-bold text-[#222] dark:text-foreground tracking-tight drop-shadow-sm flex items-center gap-2">
                    <UserIcon className="h-7 w-7 md:h-8 md:w-8 -mt-1" style={{ color: 'currentColor' }} />
                    {t('home.trendingCurators')}
                  </h2>
                  <Link href="/collections" className="flex items-center gap-1 text-black dark:text-foreground text-sm font-semibold transition-colors hover:text-[#ffb900] dark:hover:text-[#ffb900]">
                    {t('home.browseAll')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {/* Carousel for curators */}
                <CuratorCarousel curators={trendingCurators} />
              </div>
            </div>

            {/* Why Pocket Curator Section */}
            <div className="container px-4 md:px-6 mb-12">
              <div className="bg-card rounded-xl p-4 sm:p-6 md:p-8">
                <div className="flex items-center mb-2">
                  <Zap className="h-7 w-7 md:h-8 md:w-8 -mt-1 mr-2 text-[#222] dark:text-foreground" style={{ color: 'currentColor' }} />
                  <h2 className="text-2xl md:text-3xl font-sans font-bold text-[#222] dark:text-foreground tracking-tight drop-shadow-sm">{t('home.whyTitle')}</h2>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl pl-11">{t('home.whyDesc')}</p>
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div ref={featureRefs[0]} data-idx={0} className={`flex flex-col items-center text-center feature-card group${featureInView[0] ? ' in-view' : ''}`}> 
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#4F7CFF]/10 to-[#D2B877]/20 flex items-center justify-center mb-4 feature-icon-glow">
                      <ExhibitNavIcon className="h-6 w-6" stroke="#D2B877" />
                    </div>
                    <h3 className="text-lg font-sans font-semibold text-foreground mb-2">{t('home.whyCard1Title')}</h3>
                    <p className="text-sm font-sans text-muted-foreground">
                      {t('home.whyCard1Desc')}
                    </p>
                  </div>
                  <div ref={featureRefs[1]} data-idx={1} className={`flex flex-col items-center text-center feature-card group${featureInView[1] ? ' in-view' : ''}`}> 
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#4F7CFF]/10 to-[#D2B877]/20 flex items-center justify-center mb-4 feature-icon-glow">
                      <Zap className="h-6 w-6" stroke="#D2B877" />
                    </div>
                    <h3 className="text-lg font-sans font-semibold text-foreground mb-2">{t('home.whyCard2Title')}</h3>
                    <p className="text-sm font-sans text-muted-foreground">
                      {t('home.whyCard2Desc')}
                    </p>
                  </div>
                  <div ref={featureRefs[2]} data-idx={2} className={`flex flex-col items-center text-center feature-card group${featureInView[2] ? ' in-view' : ''}`}> 
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#4F7CFF]/10 to-[#D2B877]/20 flex items-center justify-center mb-4 feature-icon-glow">
                      <UploadIcon className="h-6 w-6" stroke="#D2B877" />
                    </div>
                    <h3 className="text-lg font-sans font-semibold text-foreground mb-2">{t('home.whyCard3Title')}</h3>
                    <p className="text-sm font-sans text-muted-foreground">
                      {t('home.whyCard3Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        {/* Footer is now handled by the layout */}
      </div>
    </ClientOnly>
  )
}
