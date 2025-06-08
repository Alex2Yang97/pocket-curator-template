"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Button } from "@/components/button"
import { Card, CardContent} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, ArrowLeft, Calendar, ChevronLeft, ChevronRight, Star, UserIcon, BookIcon, CollectionIcon, ExhibitIcon, StickyNoteIcon, ArtistIcon, ExhibitNavIcon, SparkleIcon } from "@/components/shared-icons"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { getArtworkById, getArtworksByCollectionId, updateArtwork, deleteArtwork } from "@/lib/supabase-data"
import { useAuth } from "@/context/auth-context"
import { toggleLikeArtwork, getArtworkLikeCount, getUserLikedArtwork } from "@/lib/supabase-data"
import { Skeleton } from "@/components/ui/skeleton"
import { createChatSession } from "@/lib/ai-chat/local-storage"
import { MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, X } from "lucide-react"
import { Gift } from "lucide-react"

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const artworkId = params.id as string
  const { toast } = useToast()
  const { user } = useAuth()

  // new: local switch artwork state
  const [currentArtworkId, setCurrentArtworkId] = useState(artworkId)
  const [currentArtwork, setCurrentArtwork] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState<number>(0)
  const [likeLoading, setLikeLoading] = useState(false)

  // new: for thumbnail progress bar
  const [collectionArtworks, setCollectionArtworks] = useState<any[]>([])
  const [thumbLoading, setThumbLoading] = useState(false)

  // Map fields from supabase schema (move up for linter)
  const imageUrl = currentArtwork?.image_url || currentArtwork?.imageUrl || "/placeholder.svg"
  const title = currentArtwork?.title || "Untitled"
  const artist = currentArtwork?.artist || "Unknown Artist"
  const artworkDate = currentArtwork?.artwork_date || currentArtwork?.date || null
  const curatorNotes = currentArtwork?.curator_notes || currentArtwork?.description || ""
  const collectionId = currentArtwork?.collection_id
  const curatorId = currentArtwork?.curator_id
  const createdAt = currentArtwork?.created_at
  const isPublic = currentArtwork?.is_public
  const likesCount = currentArtwork?.likes_count
  const collectionTitle = currentArtwork?.collection?.title || "Unknown Collection"
  const curatorName = currentArtwork?.curator?.username || "Unknown Curator"

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ title, date: artworkDate || '', curatorNotes })
  const [editLoading, setEditLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleUpdateArtwork = () => {
    if (currentArtwork?.title?.trim()) {
      // Implementation of handleUpdateArtwork
    } else {
      toast({
        title: "Error",
        description: "Title is required.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteArtwork = () => {
    // Implementation of handleDeleteArtwork
  }

  const handleShareArtwork = () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/artwork/${currentArtworkId}/share` : ''
    if (navigator.clipboard && shareUrl) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Artwork share link has been copied to clipboard.",
          })
        })
        .catch(() => {
          toast({
            title: "Copy failed",
            description: "Could not copy the link. Please try again.",
            variant: "destructive",
          })
        })
    } else {
      toast({
        title: "Copy not supported",
        description: "Clipboard API is not available.",
        variant: "destructive",
      })
    }
  }

  const handleLikeClick = async () => {
    if (!user) {
      toast({ title: "Please sign in to like artworks.", variant: "destructive" })
      return
    }
    setLikeLoading(true)
    try {
      const result = await toggleLikeArtwork(currentArtworkId, user.id)
      setLiked(result.liked)
      const count = await getArtworkLikeCount(currentArtworkId)
      setLikeCount(count)
    } catch (e) {
      toast({ title: "Failed to update like.", variant: "destructive" })
    } finally {
      setLikeLoading(false)
    }
  }

  // Format description with simple markdown (bold and italic)
  const formatDescription = (text: string) => {
    if (!text) return ""
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")
    return formatted
  }

  const handleStartAIChat = () => {
    router.push(`/ai-chat/session/${currentArtworkId}`)
  }

  const handleGoToMerchandise = () => {
    router.push(`/artwork/${currentArtworkId}/merchandise`)
  }

  // Navigation handlers
  const navigateToArtwork = (direction: 'prev' | 'next') => {
    if (!currentArtwork?.collectionIds || currentArtwork.collectionIds.length === 0) return
    const currentIndex = currentArtwork.collectionIds.findIndex((id: string) => id === currentArtworkId)
    if (currentIndex === -1) return
    const newIndex = direction === 'prev'
      ? (currentIndex - 1 + currentArtwork.collectionIds.length) % currentArtwork.collectionIds.length
      : (currentIndex + 1) % currentArtwork.collectionIds.length
    const nextArtwork = currentArtwork.collectionIds[newIndex]
    if (nextArtwork) {
      setCurrentArtworkId(nextArtwork)
    }
  }

  useEffect(() => {
    setLoading(true)
    getArtworkById(currentArtworkId)
      .then((data) => setCurrentArtwork(data))
      .catch(() => setCurrentArtwork(null))
      .finally(() => setLoading(false))
  }, [currentArtworkId])

  useEffect(() => {
    if (!currentArtworkId || !user) return
    getUserLikedArtwork(currentArtworkId, user.id).then(setLiked)
    getArtworkLikeCount(currentArtworkId).then(setLikeCount)
  }, [currentArtworkId, user])

  // get all artworks in the same collection
  useEffect(() => {
    if (!currentArtwork || !currentArtwork.collection_id) return
    setThumbLoading(true)
    getArtworksByCollectionId(currentArtwork.collection_id)
      .then((arts) => setCollectionArtworks(arts || []))
      .finally(() => setThumbLoading(false))
  }, [currentArtwork])

  const [isScrolled, setIsScrolled] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isInfoExpanded, setIsInfoExpanded] = useState(true)

  // Refs for scrolling elements
  const infoColumnRef = useRef<HTMLDivElement>(null)

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle responsive info panel expansion
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsInfoExpanded(true)
      } else {
        setIsInfoExpanded(false)
      }
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // edit save function
  async function handleEditSave() {
    if (!editForm.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' })
      return
    }
    setEditLoading(true)
    try {
      await updateArtwork(currentArtworkId, {
        title: editForm.title,
        artwork_date: editForm.date?.trim() ? editForm.date : null,
        curator_notes: editForm.curatorNotes,
      })
      toast({ title: 'Artwork updated!' })
      setEditDialogOpen(false)
      // refresh artwork info
      const data = await getArtworkById(currentArtworkId)
      setCurrentArtwork(data)
    } catch (e: any) {
      toast({ title: 'Failed to update artwork', description: e.message, variant: 'destructive' })
    } finally {
      setEditLoading(false)
    }
  }

  // delete function
  async function handleDeleteArtworkConfirm() {
    setDeleteLoading(true)
    try {
      await deleteArtwork(currentArtworkId)
      toast({ title: 'Artwork deleted!' })
      setDeleteDialogOpen(false)
      router.push(`/collections/${collectionId}`)
    } catch (e: any) {
      toast({ title: 'Failed to delete artwork', description: e.message, variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-[#222] dark:text-foreground">
        <div className="flex-grow flex flex-col">
          <Header />
          <main className="flex-1 container py-8 px-4 md:px-8">
            {/* nav bar: curator name / exhibit name / artwork name */}
            <div className="mb-8 flex items-center gap-2 text-base font-medium font-sans text-[#222] dark:text-foreground">
              {curatorId && curatorName && (
                <Link
                  href={`/profile/${curatorId}`}
                  className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer"
                  tabIndex={0}
                >
                  {curatorName}
                </Link>
              )}
              <span className="mx-1 text-muted-foreground">/</span>
              {collectionId && collectionTitle && (
                <Link
                  href={`/collections/${collectionId}`}
                  className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer"
                  tabIndex={0}
                >
                  {collectionTitle}
                </Link>
              )}
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="font-semibold text-[#222] dark:text-foreground">{title}</span>
            </div>

            {/* Progress bar and navigation */}
            {currentArtwork && currentArtwork.collectionIds && currentArtwork.collectionIds.length > 1 && (
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#D2B877]/30 transition-all duration-300"
                      style={{ width: `${((currentArtwork.collectionIds.findIndex((id: string) => id === currentArtwork.collectionIds[0]) + 1) / currentArtwork.collectionIds.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{currentArtwork.collectionIds.findIndex((id: string) => id === currentArtwork.collectionIds[0]) + 1}</span>
                  <span className="text-gray-500">/</span>
                  <span>{currentArtwork.collectionIds.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigateToArtwork('prev')}
                    className="text-[#D2B877] hover:bg-[#D2B877]/10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigateToArtwork('next')}
                    className="text-[#D2B877] hover:bg-[#D2B877]/10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Main content area - Responsive layout */}
            <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-12 max-w-[1800px] mx-auto">
              {/* Artwork image container - Full width on mobile, left side on desktop */}
              <div className="w-full lg:w-2/3 xl:w-3/4 mb-6 lg:mb-0 flex flex-col">
                <div className="relative w-full h-full flex-1 px-0 md:px-4">
                  {imageUrl ? (
                    <div className="relative w-full h-full min-h-[60vh] max-h-[85vh]">
                      <Image
                        src={imageUrl}
                        alt={title + (artist ? ` by ${artist}` : "")}
                        fill
                        className="object-contain"
                        priority
                        sizes="(max-width: 1024px) 100vw, 75vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full min-h-[60vh] max-h-[85vh]">
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-col">
                        <div className="mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-500"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                            <line x1="2" x2="22" y1="2" y2="22"></line>
                          </svg>
                        </div>
                        <div className="text-gray-400">Image unavailable</div>
                      </div>
                    </div>
                  )}
                </div>
                {/* thumbnail progress bar (below main image, desktop center, mobile full width) */}
                {collectionArtworks.length > 1 && (
                  <div
                    className={
                      `relative z-20 mt-4 mb-2 w-full flex justify-center ` +
                      `lg:max-w-3xl lg:mx-auto`
                    }
                  >
                    <div
                      className={
                        `backdrop-blur-md bg-black/60 shadow-xl rounded-xl px-2 py-2 flex items-center w-full ` +
                        `overflow-x-auto scrollbar-thin scrollbar-thumb-[#D2B877]/40 scrollbar-track-transparent gap-2`
                      }
                      style={{
                        maxWidth: '100%',
                        WebkitOverflowScrolling: 'touch',
                        scrollSnapType: 'x mandatory',
                      }}
                    >
                      <div
                        className="flex gap-2 mx-auto"
                        style={{
                          minWidth: 0,
                          width: collectionArtworks.length * 64 <= 400 ? `${collectionArtworks.length * 64}px` : 'auto',
                          justifyContent: collectionArtworks.length * 64 <= 400 ? 'center' : 'flex-start',
                        }}
                      >
                        {collectionArtworks.map((art:any) => (
                          <button
                            key={art.id}
                            onClick={() => setCurrentArtworkId(art.id)}
                            className={
                              `group relative flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none ` +
                              `w-14 h-14 md:w-16 md:h-16 ` +
                              (art.id===currentArtworkId
                                ? 'border-[#D2B877] ring-2 ring-[#D2B877] shadow-lg scale-105'
                                : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#D2B877]/60 hover:ring-2 hover:ring-[#D2B877]/40')
                            }
                            style={{
                              background:'#222',
                              scrollSnapAlign: 'center',
                              position: 'relative',
                            }}
                            aria-current={art.id===currentArtworkId}
                            tabIndex={0}
                          >
                            {art.image_url || art.imageUrl ? (
                              <Image
                                src={art.image_url || art.imageUrl}
                                alt={art.title || 'Artwork'}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-200"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-gray-800">无图</div>
                            )}
                            {/* current item highlight mask */}
                            {art.id===currentArtworkId && (
                              <span className="absolute inset-0 rounded-lg ring-2 ring-[#D2B877] pointer-events-none" />
                            )}
                            {/* hover preview/highlight effect (desktop) */}
                            <span className="hidden lg:block absolute inset-0 group-hover:ring-2 group-hover:ring-[#D2B877]/80 rounded-lg pointer-events-none transition-all duration-200" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info panel - Full width on mobile, right side on desktop */}
              <div className="w-full lg:w-1/3 xl:w-1/4 lg:mb-0 flex flex-col">
                <Card className="flex flex-col flex-1 h-full bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 md:p-8 flex flex-col flex-1 h-full">
                    {/* Basic Info */}
                    <div className="flex flex-col gap-4 mb-6">
                      <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-[#222] dark:text-foreground break-words mb-2">
                        {title}
                      </h1>
                      {curatorId && curatorName && (
                        <Link href={`/profile/${curatorId}`} className="flex items-center gap-2 group" tabIndex={0}>
                          <img src="/avatars/1.png" alt="curator avatar" className="w-8 h-8 rounded-full object-cover border border-border group-hover:ring-2 group-hover:ring-[#D2B877] transition" />
                          <span className="font-semibold text-[#222] dark:text-foreground group-hover:text-[#D2B877] transition">{curatorName}</span>
                        </Link>
                      )}
                      {collectionId && (
                        <Link href={`/collections/${collectionId}`} className="flex items-center gap-2 mt-1 group" tabIndex={0}>
                          <ExhibitNavIcon className="h-6 w-6 text-muted-foreground group-hover:text-[#D2B877] transition" />
                          <span className="font-medium text-[#222] dark:text-foreground group-hover:text-[#D2B877] transition">{collectionTitle}</span>
                        </Link>
                      )}
                    </div>
                    {/* Engagement */}
                    <div className="flex items-center gap-6 mb-8">
                      <div
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={handleLikeClick}
                        tabIndex={0}
                        aria-pressed={liked}
                        role="button"
                      >
                        <svg className={`w-6 h-6 transition-colors ${liked ? 'text-[#D2B877]' : 'text-muted-foreground'} group-hover:text-[#D2B877]`} fill={liked ? '#D2B877' : 'none'} stroke={liked ? '#D2B877' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span className="text-muted-foreground font-medium group-hover:text-[#D2B877] transition-colors">{likeCount}</span>
                      </div>
                      <div
                        className="flex items-center cursor-pointer group"
                        onClick={handleShareArtwork}
                        tabIndex={0}
                        role="button"
                      >
                        <Share2 className="w-6 h-6 text-muted-foreground group-hover:text-[#D2B877] transition-colors" />
                      </div>
                      {user && curatorId === user.id && (
                        <>
                          <div
                            className="flex items-center cursor-pointer group"
                            onClick={() => {
                              setEditForm({ title, date: artworkDate || '', curatorNotes })
                              setEditDialogOpen(true)
                            }}
                            tabIndex={0}
                            role="button"
                          >
                            <Pencil className="w-6 h-6 text-muted-foreground group-hover:text-[#D2B877] transition-colors" />
                          </div>
                          <div
                            className="flex items-center cursor-pointer group"
                            onClick={() => setDeleteDialogOpen(true)}
                            tabIndex={0}
                            role="button"
                          >
                            <X className="w-6 h-6 text-muted-foreground group-hover:text-red-500 transition-colors" />
                          </div>
                        </>
                      )}
                    </div>
                    {/* Content & Curation */}
                    <div className="space-y-8 transition-all duration-300 ease-in-out flex-1">
                      {/* Curator Notes */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <StickyNoteIcon className="inline-block align-middle text-muted-foreground" width={18} height={18} />
                          <h3 className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Curator Notes</h3>
                        </div>
                        {curatorNotes ? (
                          <div
                            className="text-[#222] dark:text-white text-sm leading-relaxed break-words whitespace-pre-wrap max-h-72 overflow-y-auto rounded-md pr-2 scrollbar-thin scrollbar-thumb-[#D2B877]/40 scrollbar-track-transparent"
                            dangerouslySetInnerHTML={{ __html: formatDescription(curatorNotes) }}
                          />
                        ) : (
                          <p className="text-muted-foreground italic text-sm">
                            No curator notes added yet.
                          </p>
                        )}
                      </div>
                    </div>
                    {/* AI Chat Button - moved here */}
                    <Button
                      onClick={handleStartAIChat}
                      className="w-full mt-8 flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-base transition-colors
                        bg-[#222] text-[#D2B877] hover:bg-[#D2B877] hover:text-[#222]
                        dark:bg-[#D2B877] dark:text-[#222] dark:hover:bg-[#E8C987] dark:hover:text-black"
                      style={{ minHeight: 48 }}
                    >
                      <SparkleIcon width={20} height={20} className="inline-block align-middle" />
                      AI Chat
                    </Button>
                    {/* Merchandise Button */}
                    <Button
                      onClick={handleGoToMerchandise}
                      className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-base transition-colors
                        bg-[#222] text-[#D2B877] hover:bg-[#D2B877] hover:text-[#222]
                        dark:bg-[#D2B877] dark:text-[#222] dark:hover:bg-[#E8C987] dark:hover:text-black"
                      style={{ minHeight: 48 }}
                    >
                      <Gift width={20} height={20} className="inline-block align-middle" />
                      Merchandise
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!currentArtwork) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Artwork not found</h2>
            <Link href="/collections">
              <Button className="mt-4">Back to Collections</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-[#222] dark:text-foreground">
      <div className="flex-grow flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 md:px-8">
            {/* nav bar: curator name / exhibit name / artwork name */}
          <div className="mb-8 flex items-center gap-2 text-base font-medium font-sans text-[#222] dark:text-foreground">
            {curatorId && curatorName && (
              <Link
                href={`/profile/${curatorId}`}
                className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer"
                tabIndex={0}
              >
                {curatorName}
              </Link>
            )}
            <span className="mx-1 text-muted-foreground">/</span>
            {collectionId && collectionTitle && (
              <Link
                href={`/collections/${collectionId}`}
                className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer"
                tabIndex={0}
              >
                {collectionTitle}
              </Link>
            )}
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="font-semibold text-[#222] dark:text-foreground">{title}</span>
          </div>

          {/* Progress bar and navigation */}
          {currentArtwork && currentArtwork.collectionIds && currentArtwork.collectionIds.length > 1 && (
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#D2B877]/30 transition-all duration-300"
                    style={{ width: `${((currentArtwork.collectionIds.findIndex((id: string) => id === currentArtwork.collectionIds[0]) + 1) / currentArtwork.collectionIds.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{currentArtwork.collectionIds.findIndex((id: string) => id === currentArtwork.collectionIds[0]) + 1}</span>
                <span className="text-gray-500">/</span>
                <span>{currentArtwork.collectionIds.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigateToArtwork('prev')}
                  className="text-[#D2B877] hover:bg-[#D2B877]/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigateToArtwork('next')}
                  className="text-[#D2B877] hover:bg-[#D2B877]/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Main content area - Responsive layout */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-12 max-w-[1800px] mx-auto">
            {/* Artwork image container - Full width on mobile, left side on desktop */}
            <div className="w-full lg:w-2/3 xl:w-3/4 mb-6 lg:mb-0 flex flex-col">
              <div className="relative w-full h-full flex-1 px-0 md:px-4">
                {imageUrl ? (
                  <div className="relative w-full h-full min-h-[60vh] max-h-[85vh]">
                    <Image
                      src={imageUrl}
                      alt={title + (artist ? ` by ${artist}` : "")}
                      fill
                      className="object-contain"
                      priority
                      sizes="(max-width: 1024px) 100vw, 75vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[60vh] max-h-[85vh]">
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-col">
                      <div className="mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-500"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                          <line x1="2" x2="22" y1="2" y2="22"></line>
                        </svg>
                      </div>
                      <div className="text-gray-400">Image unavailable</div>
                    </div>
                  </div>
                )}
              </div>
              {/* thumbnail progress bar (below main image, desktop center, mobile full width) */}
              {collectionArtworks.length > 1 && (
                <div
                  className={
                    `relative z-20 mt-4 mb-2 w-full flex justify-center ` +
                    `lg:max-w-3xl lg:mx-auto`
                  }
                >
                  <div
                    className={
                      `backdrop-blur-md bg-black/60 shadow-xl rounded-xl px-2 py-2 flex items-center w-full ` +
                      `overflow-x-auto scrollbar-thin scrollbar-thumb-[#D2B877]/40 scrollbar-track-transparent gap-2`
                    }
                    style={{
                      maxWidth: '100%',
                      WebkitOverflowScrolling: 'touch',
                      scrollSnapType: 'x mandatory',
                    }}
                  >
                    <div
                      className="flex gap-2 mx-auto"
                      style={{
                        minWidth: 0,
                        width: collectionArtworks.length * 64 <= 400 ? `${collectionArtworks.length * 64}px` : 'auto',
                        justifyContent: collectionArtworks.length * 64 <= 400 ? 'center' : 'flex-start',
                      }}
                    >
                      {collectionArtworks.map((art:any) => (
                        <button
                          key={art.id}
                          onClick={() => setCurrentArtworkId(art.id)}
                          className={
                            `group relative flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none ` +
                            `w-14 h-14 md:w-16 md:h-16 ` +
                            (art.id===currentArtworkId
                              ? 'border-[#D2B877] ring-2 ring-[#D2B877] shadow-lg scale-105'
                              : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#D2B877]/60 hover:ring-2 hover:ring-[#D2B877]/40')
                          }
                          style={{
                            background:'#222',
                            scrollSnapAlign: 'center',
                            position: 'relative',
                          }}
                          aria-current={art.id===currentArtworkId}
                          tabIndex={0}
                        >
                          {art.image_url || art.imageUrl ? (
                            <Image
                              src={art.image_url || art.imageUrl}
                              alt={art.title || 'Artwork'}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-200"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-gray-800">无图</div>
                          )}
                          {/* current item highlight mask */}
                          {art.id===currentArtworkId && (
                            <span className="absolute inset-0 rounded-lg ring-2 ring-[#D2B877] pointer-events-none" />
                          )}
                          {/* hover preview/highlight effect (desktop) */}
                          <span className="hidden lg:block absolute inset-0 group-hover:ring-2 group-hover:ring-[#D2B877]/80 rounded-lg pointer-events-none transition-all duration-200" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info panel - Full width on mobile, right side on desktop */}
            <div className="w-full lg:w-1/3 xl:w-1/4 lg:mb-0 flex flex-col">
              <Card className="flex flex-col flex-1 h-full bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 md:p-8 flex flex-col flex-1 h-full">
                  {/* Basic Info */}
                  <div className="flex flex-col gap-4 mb-6">
                    <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-[#222] dark:text-foreground break-words mb-2">
                      {title}
                    </h1>
                    {curatorId && curatorName && (
                      <Link href={`/profile/${curatorId}`} className="flex items-center gap-2 group" tabIndex={0}>
                        <img src="/avatars/1.png" alt="curator avatar" className="w-8 h-8 rounded-full object-cover border border-border group-hover:ring-2 group-hover:ring-[#D2B877] transition" />
                        <span className="font-semibold text-[#222] dark:text-foreground group-hover:text-[#D2B877] transition">{curatorName}</span>
                      </Link>
                    )}
                    {collectionId && (
                      <Link href={`/collections/${collectionId}`} className="flex items-center gap-2 mt-1 group" tabIndex={0}>
                        <ExhibitNavIcon className="h-6 w-6 text-muted-foreground group-hover:text-[#D2B877] transition" />
                        <span className="font-medium text-[#222] dark:text-foreground group-hover:text-[#D2B877] transition">{collectionTitle}</span>
                      </Link>
                    )}
                  </div>
                  {/* Engagement */}
                  <div className="flex items-center gap-6 mb-8">
                    <div
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={handleLikeClick}
                      tabIndex={0}
                      aria-pressed={liked}
                      role="button"
                    >
                      <svg className={`w-6 h-6 transition-colors ${liked ? 'text-[#D2B877]' : 'text-muted-foreground'} group-hover:text-[#D2B877]`} fill={liked ? '#D2B877' : 'none'} stroke={liked ? '#D2B877' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="text-muted-foreground font-medium group-hover:text-[#D2B877] transition-colors">{likeCount}</span>
                    </div>
                    <div
                      className="flex items-center cursor-pointer group"
                      onClick={handleShareArtwork}
                      tabIndex={0}
                      role="button"
                    >
                      <Share2 className="w-6 h-6 text-muted-foreground group-hover:text-[#D2B877] transition-colors" />
                    </div>
                    {user && curatorId === user.id && (
                      <>
                        <div
                          className="flex items-center cursor-pointer group"
                          onClick={() => {
                            setEditForm({ title, date: artworkDate || '', curatorNotes })
                            setEditDialogOpen(true)
                          }}
                          tabIndex={0}
                          role="button"
                        >
                          <Pencil className="w-6 h-6 text-muted-foreground group-hover:text-[#D2B877] transition-colors" />
                        </div>
                        <div
                          className="flex items-center cursor-pointer group"
                          onClick={() => setDeleteDialogOpen(true)}
                          tabIndex={0}
                          role="button"
                        >
                          <X className="w-6 h-6 text-muted-foreground group-hover:text-red-500 transition-colors" />
                        </div>
                      </>
                    )}
                  </div>
                  {/* Content & Curation */}
                  <div className="space-y-8 transition-all duration-300 ease-in-out flex-1">
                    {/* Curator Notes */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <StickyNoteIcon className="inline-block align-middle text-muted-foreground" width={18} height={18} />
                        <h3 className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Curator Notes</h3>
                      </div>
                      {curatorNotes ? (
                        <div
                          className="text-[#222] dark:text-white text-sm leading-relaxed break-words whitespace-pre-wrap max-h-72 overflow-y-auto rounded-md pr-2 scrollbar-thin scrollbar-thumb-[#D2B877]/40 scrollbar-track-transparent"
                          dangerouslySetInnerHTML={{ __html: formatDescription(curatorNotes) }}
                        />
                      ) : (
                        <p className="text-muted-foreground italic text-sm">
                          No curator notes added yet.
                        </p>
                      )}
                    </div>
                  </div>
                  {/* AI Chat Button - moved here */}
                  <Button
                    onClick={handleStartAIChat}
                    className="w-full mt-8 flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-base transition-colors
                      bg-[#222] text-[#D2B877] hover:bg-[#D2B877] hover:text-[#222]
                      dark:bg-[#D2B877] dark:text-[#222] dark:hover:bg-[#E8C987] dark:hover:text-black"
                    style={{ minHeight: 48 }}
                  >
                    <SparkleIcon width={20} height={20} className="inline-block align-middle" />
                    AI Chat
                  </Button>
                  {/* Merchandise Button */}
                  <Button
                    onClick={handleGoToMerchandise}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-base transition-colors
                      bg-[#222] text-[#D2B877] hover:bg-[#D2B877] hover:text-[#222]
                      dark:bg-[#D2B877] dark:text-[#222] dark:hover:bg-[#E8C987] dark:hover:text-black"
                    style={{ minHeight: 48 }}
                  >
                    <Gift width={20} height={20} className="inline-block align-middle" />
                    Merchandise
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Artwork</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Curator Notes</label>
              <Textarea value={editForm.curatorNotes} onChange={e => setEditForm(f => ({ ...f, curatorNotes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <button className="px-4 py-2 rounded bg-[#D2B877] text-black font-semibold hover:bg-[#E8C987] transition" onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save'}
            </button>
            <button className="px-4 py-2 rounded border ml-2" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Artwork</DialogTitle>
          </DialogHeader>
          <div className="text-red-600 mb-4">Are you sure you want to delete this artwork? This action cannot be undone.</div>
          <DialogFooter>
            <button className="px-4 py-2 rounded border mr-2" onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
              Cancel
            </button>
            <button className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition" onClick={handleDeleteArtworkConfirm} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

