"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Share2, ArrowLeft, Lock, Plus, ImageOff, Pencil, X, AlertCircle, Loader2, Info } from "lucide-react"
import { UserIcon, LocationPinIcon, Calendar } from "@/components/shared-icons"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getArtworksByCollectionIdPaginated, getCollectionById, getCollectionLikeCount, getUserLikedCollection, toggleLikeCollection, updateArtwork, deleteArtwork, deleteCollectionAndArtworks, updateCollection, getArtworkLikeCount, createArtwork, uploadArtworkImage, getArtworksCountByCollectionId } from "@/lib/supabase-data"
import { supabase } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Popup } from "@/components/popup"
import { Badge } from "@/components/ui/badge"
import { ExhibitNavIcon } from "@/components/shared-icons"
import { UploadArtworkEntryCard, UploadArtworkFormCard } from "@/components/upload-artwork-card"

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  const backHref = from === "profile" ? "/profile" : "/collections"

  const [collection, setCollection] = useState<any | null>(null)
  const [artworks, setArtworks] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [loading, setLoading] = useState(true)
  const [artworkLoading, setArtworkLoading] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const { toast } = useToast()
  // Edit mode state
  const [editMode, setEditMode] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [editLoading, setEditLoading] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleteCollectionDialogOpen, setDeleteCollectionDialogOpen] = useState(false)
  const [deleteCollectionLoading, setDeleteCollectionLoading] = useState(false)
  const [editCollectionDialogOpen, setEditCollectionDialogOpen] = useState(false)
  const [editCollectionForm, setEditCollectionForm] = useState<any>({})
  const [editCollectionLoading, setEditCollectionLoading] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/collections/${collectionId}/share` : ''
  const [artworkLikes, setArtworkLikes] = useState<Record<string, number>>({})
  const [editInfoForm, setEditInfoForm] = useState({
    title: '',
    description: '',
    is_public: true,
    location: '',
    event_date: '',
  })
  const [editingArtworkId, setEditingArtworkId] = useState<string | null>(null)
  const [artworkEditForm, setArtworkEditForm] = useState<any>({})
  const [deleteConfirmArtworkId, setDeleteConfirmArtworkId] = useState<string | null>(null)
  // Batch upload artwork local state
  const [pendingArtworks, setPendingArtworks] = useState<any[]>([])
  const [pendingUploading, setPendingUploading] = useState(false)
  const [pendingError, setPendingError] = useState("")

  // Fetch collection info (with curator)
  useEffect(() => {
    setLoading(true)
    void (async () => {
      try {
        const data = await getCollectionById(collectionId)
        setCollection(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [collectionId])

  // Fetch like count and liked state
  useEffect(() => {
    if (!collectionId || !user?.id) return
    getCollectionLikeCount(collectionId).then(setLikeCount)
    getUserLikedCollection(collectionId, user.id).then(setLiked)
  }, [collectionId, user?.id])

  // Fetch artworks for this collection (paginated)
  useEffect(() => {
    setArtworkLoading(true)
    getArtworksByCollectionIdPaginated(collectionId, { page, pageSize })
      .then(async ({ artworks, total }) => {
        setArtworks(artworks)
        setTotal(typeof total === 'number' ? total : 0)
        // Fetch likes for each artwork
        const likesObj: Record<string, number> = {}
        await Promise.all(
          artworks.map(async (art) => {
            likesObj[art.id] = await getArtworkLikeCount(art.id)
          })
        )
        setArtworkLikes(likesObj)
      })
      .finally(() => setArtworkLoading(false))
  }, [collectionId, page])

  // 进入编辑模式时填充表单
  useEffect(() => {
    if (editMode && collection) {
      setEditInfoForm({
        title: collection.title || '',
        description: collection.description || '',
        is_public: collection.is_public ?? collection.isPublic ?? true,
        location: collection.location || '',
        event_date: collection.event_date || '',
      })
    }
  }, [editMode, collection])

  const handleImageError = (artworkId: string) => {
    setImageErrors((prev) => ({ ...prev, [artworkId]: true }))
  }

  const handleLikeClick = async () => {
    if (!user?.id) return
    setLikeLoading(true)
    try {
      const { liked: newLiked } = await toggleLikeCollection(collectionId, user.id)
      setLiked(newLiked)
      setLikeCount((prev) => prev + (newLiked ? 1 : -1))
    } finally {
      setLikeLoading(false)
    }
  }

  const handleShareCollection = async () => {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(shareUrl)
      toast({ title: 'Link copied to clipboard!' })
    }
  }

  const handleShareArtwork = (artworkId: string) => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/artwork/${artworkId}/share` : ''
    if (navigator.clipboard && shareUrl) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({ title: 'Artwork share link copied!' })
        })
        .catch(() => {
          toast({ title: 'Copy failed', description: 'Could not copy the link. Please try again.', variant: 'destructive' })
        })
    } else {
      toast({ title: 'Copy not supported', description: 'Clipboard API is not available.', variant: 'destructive' })
    }
  }

  // Only allow edit if user is curator/owner
  const canEdit = user && collection && (user.id === collection.curator_id || user.id === collection.ownerId)
  const canDelete = canEdit // For now, same as canEdit

  // Edit dialog handlers
  const openEditDialog = (artwork: any) => {
    setEditingArtwork(artwork)
    setEditForm({
      title: artwork.title || '',
      artist: artwork.artist || '',
      date: artwork.artwork_date || artwork.date || '',
      curatorNotes: artwork.curator_notes || artwork.description || '',
    })
  }
  const closeEditDialog = () => {
    setEditingArtwork(null)
    setEditForm({})
  }
  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }))
  }
  const handleEditSave = async () => {
    if (!editingArtwork) return
    if (!editForm.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' })
      return
    }
    setEditLoading(true)
    try {
      await updateArtwork(editingArtwork.id, {
        title: editForm.title,
        artist: editForm.artist,
        artwork_date: editForm.date?.trim() ? editForm.date : null,
        curator_notes: editForm.curatorNotes,
      })
      toast({ title: 'Artwork updated!' })
      closeEditDialog()
      // Refresh artworks
      setArtworkLoading(true)
      getArtworksByCollectionIdPaginated(collectionId, { page, pageSize })
        .then(({ artworks, total }) => {
          setArtworks(artworks)
          setTotal(typeof total === 'number' ? total : 0)
        })
        .finally(() => setArtworkLoading(false))
    } catch (e: any) {
      toast({ title: 'Failed to update artwork', description: e.message, variant: 'destructive' })
    } finally {
      setEditLoading(false)
    }
  }

  // Delete dialog handlers
  const handleDeleteArtwork = async () => {
    if (!deleteConfirmId) return
    setDeleteLoading(true)
    try {
      await deleteArtwork(deleteConfirmId)
      toast({ title: 'Artwork deleted!' })
      setDeleteConfirmId(null)
      // Refresh artworks
      setArtworkLoading(true)
      getArtworksByCollectionIdPaginated(collectionId, { page, pageSize })
        .then(({ artworks, total }) => {
          setArtworks(artworks)
          setTotal(typeof total === 'number' ? total : 0)
        })
        .finally(() => setArtworkLoading(false))
    } catch (e: any) {
      toast({ title: 'Failed to delete artwork', description: e.message, variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Edit collection dialog handlers
  const openEditCollectionDialog = () => {
    setEditCollectionForm({
      title: collection.title || '',
      description: collection.description || '',
      is_public: collection.is_public ?? collection.isPublic ?? true,
      location: collection.location || '',
      event_date: collection.event_date ? collection.event_date : '',
    })
    setEditCollectionDialogOpen(true)
  }
  const closeEditCollectionDialog = () => {
    setEditCollectionDialogOpen(false)
    setEditCollectionForm({})
  }
  const handleEditCollectionChange = (field: string, value: any) => {
    setEditCollectionForm((prev: any) => ({ ...prev, [field]: value }))
  }
  const handleEditCollectionSave = async () => {
    if (!editCollectionForm.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' })
      return
    }
    setEditCollectionLoading(true)
    try {
      await updateCollection(collectionId, {
        title: editCollectionForm.title,
        description: editCollectionForm.description,
        is_public: editCollectionForm.is_public,
        location: editCollectionForm.location,
        event_date: (editCollectionForm.event_date?.trim() ? editCollectionForm.event_date : null) as string | null,
      })
      toast({ title: 'Collection updated!' })
      closeEditCollectionDialog()
      // Refresh collection info
      setLoading(true)
      const data = await getCollectionById(collectionId)
      setCollection(data)
      setLoading(false)
    } catch (e: any) {
      toast({ title: 'Failed to update collection', description: e.message, variant: 'destructive' })
    } finally {
      setEditCollectionLoading(false)
    }
  }

  function handleArtworkEditClick(artwork: any) {
    setEditingArtworkId(artwork.id)
    setArtworkEditForm({
      title: artwork.title || '',
      artist: artwork.artist || '',
      date: artwork.artwork_date || artwork.date || '',
      curatorNotes: artwork.curator_notes || artwork.description || '',
    })
  }

  // Handle file selection
  async function handleAddPendingArtworks(files: File[]) {
    let newFiles = [...files]
    if (user && !user.member) {
      try {
        const currentArtworks = await getArtworksCountByCollectionId(
          collectionId,
        )
        const totalBeforeAdding = currentArtworks + pendingArtworks.length

        if (totalBeforeAdding >= 8) {
          toast({
            title: "Upload Limit Reached",
            description:
              "Non-members can only have 8 artworks per exhibit. You cannot add more images.",
            variant: "destructive",
          })
          return
        }

        const availableSlots = 8 - totalBeforeAdding
        if (newFiles.length > availableSlots) {
          toast({
            title: "Upload Limit Exceeded",
            description: `Non-members can only have 8 artworks per exhibit. You can add ${availableSlots} more images.`,
            variant: "destructive",
          })
          newFiles = newFiles.slice(0, availableSlots)
        }
        if (newFiles.length === 0) return
      } catch (error: any) {
        toast({
          title: "Error checking artwork limit",
          description: error.message,
          variant: "destructive",
        })
        return
      }
    }
    const newPending = newFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "",
      curatorNotes: "",
      date: new Date().toISOString().split("T")[0],
    }))
    setPendingArtworks(prev => [...prev, ...newPending])
    setPendingError("")
  }

  // Handle single pending artwork form change
  function handlePendingMetaChange(idx: number, field: keyof typeof pendingArtworks[0], value: string) {
    setPendingArtworks(prev => prev.map((art, i) => i === idx ? { ...art, [field]: value } : art))
  }

  // Delete single pending artwork
  function handleDeletePending(idx: number) {
    setPendingArtworks(prev => prev.filter((_, i) => i !== idx))
  }

  // Submit all pending artworks
  async function handleSubmitAllPending() {
    if (!user?.id) {
      setPendingError("Please login first")
      return
    }
    if (pendingArtworks.length === 0) {
      setPendingError("Please select images first")
      return
    }
    if (pendingArtworks.some(a => !a.title.trim())) {
      setPendingError("Each artwork must have a title")
      return
    }

    // Final check for non-members
    if (user && !user.member) {
      try {
        const currentArtworks =
          await getArtworksCountByCollectionId(collectionId)
        if (currentArtworks + pendingArtworks.length > 8) {
          toast({
            title: "Upload Limit Exceeded",
            description: `This exhibit has ${currentArtworks} artworks. Adding ${pendingArtworks.length} more would exceed the 8-artwork limit for non-members.`,
            variant: "destructive",
          })
          return
        }
      } catch (error: any) {
        toast({
          title: "Could not verify artwork limit",
          description: error.message,
          variant: "destructive",
        })
        return
      }
    }

    setPendingUploading(true)
    try {
      const uploadResults = await Promise.all(pendingArtworks.map(a => uploadArtworkImage(a.file, user.id)))
      await Promise.all(pendingArtworks.map((a, i) => createArtwork({
        title: a.title,
        artist: a.artist,
        date: a.date,
        curatorNotes: a.curatorNotes,
        imageUrl: uploadResults[i],
        collectionId,
        ownerId: user.id,
      })))
      setPendingArtworks([])
      setPendingError("")
      toast({ title: "All artworks added!" })
      setArtworkLoading(true)
      getArtworksByCollectionIdPaginated(collectionId, { page, pageSize })
        .then(({ artworks, total }) => {
          setArtworks(artworks)
          setTotal(typeof total === 'number' ? total : 0)
        })
        .finally(() => setArtworkLoading(false))
    } catch (err: any) {
      setPendingError(err.message || "Batch upload failed")
    } finally {
      setPendingUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="flex-grow flex flex-col">
          <Header />
          <main className="flex-1 container py-8">
            <div className="text-center py-12 text-muted-foreground">Loading collection...</div>
          </main>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="flex-grow flex flex-col">
          <Header />
          <main className="flex-1 container py-8">
            <div className="text-center py-12 bg-card rounded-xl border border-border shadow-lg">
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">Collection not found</h2>
              <Link href="/collections">
                <Button className="mt-4 px-6 font-semibold text-[#D2B877] bg-transparent border border-[#D2B877] rounded-lg hover:bg-[#D2B877] hover:text-black transition-all duration-300 ease-in-out">
                  Back to Collections
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Use cover image or first artwork's image
  const coverImage = collection.coverImageUrl || collection.cover_image_url || (artworks[0]?.imageUrl || artworks[0]?.image_url) || "/uncategorized-collection.png"
  const curatorName = collection.curator?.username || collection.curator || "Unknown"
  const eventDate = collection.event_date || collection.date
  const isPublic = collection.is_public ?? collection.isPublic
  const likesCount = typeof collection.likes_count === 'number' ? collection.likes_count : likeCount

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex-grow flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-base font-medium text-foreground dark:text-foreground">
              <Link
                href={`/profile/${collection.curator?.id || collection.curator_id}`}
                className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer"
                tabIndex={0}
              >
                {curatorName}
              </Link>
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="font-semibold text-foreground dark:text-foreground">{collection.title}</span>
            </div>
          </div>

          <div className="container pl-8 py-8 max-w-2xl w-full ml-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex flex-col gap-2">
                {editMode ? (
                  <>
                    <input
                      className="text-2xl md:text-3xl font-sans font-bold text-[#222] dark:text-foreground tracking-tight drop-shadow-sm bg-transparent border-b border-border focus:outline-none focus:border-[#4F7CFF]"
                      value={editInfoForm.title}
                      onChange={e => setEditInfoForm((f: typeof editInfoForm) => ({ ...f, title: e.target.value }))}
                    />
                    <textarea
                      className="text-base text-muted-foreground leading-relaxed mt-1 bg-transparent border-b border-border focus:outline-none focus:border-[#4F7CFF]"
                      value={editInfoForm.description}
                      onChange={e => setEditInfoForm((f: typeof editInfoForm) => ({ ...f, description: e.target.value }))}
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <Link href={`/profile/${collection.curator?.id || collection.curator_id}`} className="flex items-center gap-2 group" tabIndex={0}>
                        <img src="/avatars/1.png" alt="curator avatar" className="w-8 h-8 rounded-full object-cover border border-border group-hover:ring-2 group-hover:ring-[#D2B877] transition" />
                        <span className="font-semibold text-[#222] dark:text-foreground group-hover:text-[#D2B877] transition">{curatorName}</span>
                      </Link>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <LocationPinIcon className="w-4 h-4 text-muted-foreground" />
                        <input
                          className="bg-transparent border-b border-border focus:outline-none focus:border-[#4F7CFF] w-28"
                          value={editInfoForm.location}
                          onChange={e => setEditInfoForm((f: typeof editInfoForm) => ({ ...f, location: e.target.value }))}
                        />
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="date"
                          className="bg-transparent border-b border-border focus:outline-none focus:border-[#4F7CFF]"
                          value={editInfoForm.event_date || ''}
                          onChange={e => setEditInfoForm((f: typeof editInfoForm) => ({ ...f, event_date: e.target.value }))}
                        />
                      </span>
                      <span className="flex items-center gap-2 ml-2">
                        <input
                          type="checkbox"
                          checked={!!editInfoForm.is_public}
                          onChange={e => setEditInfoForm((f: typeof editInfoForm) => ({ ...f, is_public: e.target.checked }))}
                          className="accent-[#D2B877] w-4 h-4"
                          id="is_public_edit"
                        />
                        <label htmlFor="is_public_edit" className="text-muted-foreground text-sm cursor-pointer">Public</label>
                      </span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <Button className="bg-[#D2B877] hover:bg-[#E8C987] text-black" onClick={async () => {
                        await updateCollection(collectionId, {
                          ...editInfoForm,
                          event_date: (editInfoForm.event_date?.trim() ? editInfoForm.event_date : null) as string | null,
                        })
                        setEditMode(false)
                        setLoading(true)
                        const data = await getCollectionById(collectionId)
                        setCollection(data)
                        setLoading(false)
                      }}>Save</Button>
                      <Button variant="secondary" className="border-[#D2B877]/30 text-[#D2B877] hover:bg-[#D2B877]/20" onClick={() => setEditMode(false)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-sans font-bold text-[#222] dark:text-foreground tracking-tight drop-shadow-sm flex items-center gap-2">
                      <ExhibitNavIcon className="h-7 w-7 md:h-8 md:w-8 -mt-1 text-[#222] dark:text-foreground" style={{ color: 'currentColor' }} />
                      {collection.title}
                    </h1>
                    {collection.description && (
                      <p className="text-base text-muted-foreground leading-relaxed mt-1">{collection.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Link href={`/profile/${collection.curator?.id || collection.curator_id}`} className="flex items-center gap-2 group" tabIndex={0}>
                        <img src="/avatars/1.png" alt="curator avatar" className="w-8 h-8 rounded-full object-cover border border-border group-hover:ring-2 group-hover:ring-[#D2B877] transition" />
                        <span className="font-semibold text-[#222] dark:text-foreground group-hover:text-[#D2B877] transition">{curatorName}</span>
                      </Link>
                      {collection.location && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <LocationPinIcon className="w-4 h-4 text-muted-foreground" />
                          {collection.location}
                        </span>
                      )}
                      {collection.event_date && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {collection.event_date}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 self-start md:self-center mt-2 md:mt-0">
                <button
                  className="flex items-center gap-1 group"
                  aria-label="Like collection"
                  tabIndex={0}
                  style={{ outline: 'none' }}
                  onClick={handleLikeClick}
                  disabled={likeLoading || !user?.id}
                >
                  <svg className="w-5 h-5 text-muted-foreground group-hover:text-[#D2B877] transition-colors" fill={liked ? '#D2B877' : 'none'} stroke={liked ? '#D2B877' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-muted-foreground font-medium group-hover:text-[#D2B877] transition-colors">{likeCount}</span>
                </button>
                <button
                  className="flex items-center group ml-2"
                  aria-label="Share collection"
                  tabIndex={0}
                  onClick={handleShareCollection}
                  style={{ outline: 'none' }}
                >
                  <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-[#D2B877] transition-colors" />
                </button>
                {canEdit && !editMode && (
                  <button
                    className="flex items-center group ml-2"
                    aria-label="Edit collection"
                    tabIndex={0}
                    onClick={() => setEditMode(true)}
                    style={{ outline: 'none' }}
                  >
                    <Pencil className="w-5 h-5 text-muted-foreground group-hover:text-[#D2B877] transition-colors" />
                  </button>
                )}
                {canDelete && (
                  <button
                    className="flex items-center group ml-1"
                    aria-label="Delete collection"
                    tabIndex={0}
                    onClick={() => setDeleteCollectionDialogOpen(true)}
                    style={{ outline: 'none' }}
                  >
                    <X className="w-5 h-5 text-muted-foreground group-hover:text-[#D2B877] transition-colors" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 mb-6">
            </div>
          </div>

          {artworkLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading artworks...</div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">No artworks yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Start adding artworks to build your collection.</p>
              <Link href="/artwork/new">
                <Button
                  className="gap-1 min-w-[180px] h-12 px-6 font-semibold text-[#D2B877] bg-transparent border border-[#D2B877] rounded-lg hover:bg-[#D2B877] hover:text-black transition-all duration-300 ease-in-out"
                  tabIndex={0}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Artwork
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {canEdit && editMode && user && !user.member && (
                  <div className="col-span-full">
                    <div className="bg-[#f0ede6] dark:bg-[#39383d] p-4 rounded-lg flex items-start gap-3">
                      <Info className="h-5 w-5 text-[#D2B877] mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-[#222] dark:text-[#f5f5f5]">
                          Exhibit Limit for Non-Members
                        </h4>
                        <p className="text-sm text-[#222] dark:text-[#b0a98a]">
                          You can add up to 8 artworks to this exhibit. Please
                          contact us to become a member and unlock unlimited
                          uploads.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {canEdit && editMode && (
                  <>
                    <UploadArtworkEntryCard onFiles={handleAddPendingArtworks} />
                    {pendingArtworks.map((art, idx) => (
                      <UploadArtworkFormCard
                        key={art.previewUrl}
                        meta={art}
                        onMetaChange={(field: keyof typeof art, value: string) => handlePendingMetaChange(idx, field, value)}
                        onDelete={() => handleDeletePending(idx)}
                        isUploading={pendingUploading}
                      />
                    ))}
                    {pendingArtworks.length > 0 && (
                      <div className="col-span-full flex flex-col md:flex-row gap-4 items-center justify-between mt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="border-[#D2B877]/30 text-[#D2B877] hover:bg-[#D2B877]/20 w-full md:w-auto"
                          onClick={() => setPendingArtworks([])}
                          disabled={pendingUploading}
                        >
                          Clear All
                        </Button>
                        <Button
                          type="button"
                          className="bg-[#D2B877] hover:bg-[#E8C987] text-black w-full md:w-auto"
                          onClick={handleSubmitAllPending}
                          disabled={pendingUploading}
                        >
                          {pendingUploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>) : "Add All"}
                        </Button>
                        {pendingError && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="h-4 w-4" />{pendingError}</span>}
                      </div>
                    )}
                  </>
                )}
                {artworks.map((artwork) => (
                  <div key={artwork.id} className="relative group h-full">
                    {canEdit && editMode && (
                      <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="border border-[#D2B877] bg-card text-[#D2B877] rounded-full shadow ring-2 ring-[#D2B877] hover:bg-[#D2B877]/10"
                          onClick={() => handleArtworkEditClick(artwork)}
                          aria-label="Edit"
                          tabIndex={0}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="border border-[#D2B877] bg-card text-[#D2B877] rounded-full shadow ring-2 ring-[#D2B877] hover:bg-[#D2B877]/10"
                          onClick={() => setDeleteConfirmArtworkId(artwork.id)}
                          aria-label="Delete"
                          tabIndex={0}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                    {deleteConfirmArtworkId === artwork.id && (
                      <div className="absolute top-10 right-3 z-30 bg-card border border-red-400 rounded shadow p-4 flex flex-col items-center">
                        <div className="text-red-600 mb-2">Are you sure you want to delete this artwork?</div>
                        <div className="flex gap-2">
                          <Button className="bg-red-600 text-white" onClick={async () => {
                            setDeleteLoading(true)
                            await deleteArtwork(artwork.id)
                            setDeleteLoading(false)
                            setDeleteConfirmArtworkId(null)
                            setArtworkLoading(true)
                            getArtworksByCollectionIdPaginated(collectionId, { page, pageSize })
                              .then(({ artworks, total }) => {
                                setArtworks(artworks)
                                setTotal(typeof total === 'number' ? total : 0)
                              })
                              .finally(() => setArtworkLoading(false))
                          }}>Delete</Button>
                          <Button variant="secondary" onClick={() => setDeleteConfirmArtworkId(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                    {editingArtworkId === artwork.id ? (
                      <div className="p-4 w-full">
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-[#D2B877] mb-1">Title</label>
                          <Input value={artworkEditForm.title} onChange={e => setArtworkEditForm((f: typeof artworkEditForm) => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-[#D2B877] mb-1">Artist</label>
                          <Input value={artworkEditForm.artist} onChange={e => setArtworkEditForm((f: typeof artworkEditForm) => ({ ...f, artist: e.target.value }))} />
                        </div>
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-[#D2B877] mb-1">Date</label>
                          <Input type="date" value={artworkEditForm.date} onChange={e => setArtworkEditForm((f: typeof artworkEditForm) => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-[#D2B877] mb-1">Curator Notes</label>
                          <Textarea value={artworkEditForm.curatorNotes} onChange={e => setArtworkEditForm((f: typeof artworkEditForm) => ({ ...f, curatorNotes: e.target.value }))} />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button className="bg-[#D2B877] hover:bg-[#E8C987] text-black" onClick={async () => {
                            await updateArtwork(artwork.id, {
                              title: artworkEditForm.title,
                              artist: artworkEditForm.artist,
                              artwork_date: artworkEditForm.date?.trim() ? artworkEditForm.date : null,
                              curator_notes: artworkEditForm.curatorNotes,
                            })
                            setEditingArtworkId(null)
                            setArtworkLoading(true)
                            getArtworksByCollectionIdPaginated(collectionId, { page, pageSize })
                              .then(({ artworks, total }) => {
                                setArtworks(artworks)
                                setTotal(typeof total === 'number' ? total : 0)
                              })
                              .finally(() => setArtworkLoading(false))
                          }}>Save</Button>
                          <Button variant="secondary" className="border-[#D2B877]/30 text-[#D2B877] hover:bg-[#D2B877]/20" onClick={() => setEditingArtworkId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/artwork/${artwork.id}`}
                        className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B877] focus-visible:ring-offset-2 rounded-xl h-full"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            router.push(`/artwork/${artwork.id}`)
                          }
                        }}
                      >
                        <div className="flex flex-col h-full items-start">
                          <div className="relative w-full aspect-[1/1] overflow-hidden rounded-xl">
                            {imageErrors[artwork.id] ? (
                              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center">
                                <ImageOff className="h-8 w-8 text-gray-500 mb-2" />
                                <p className="text-sm text-gray-400">Image not available</p>
                              </div>
                            ) : (
                              <Image
                                src={artwork.imageUrl || artwork.image_url || "/placeholder.svg"}
                                alt={artwork.title}
                                fill
                                className="object-cover transition-all duration-200 group-hover:shadow-xl group-hover:scale-[1.03]"
                              />
                            )}
                          </div>
                          <div className="flex items-center justify-between w-full mt-4 mb-2">
                            <h3 className="text-lg font-bold font-sans text-black dark:text-foreground leading-tight line-clamp-1" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{artwork.title}</h3>
                            <div className="flex items-center gap-1 ml-4">
                              <svg className="inline-block align-middle w-5 h-5 text-black dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                              <span className="text-black dark:text-foreground font-medium">{artworkLikes[artwork.id] ?? 0}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="flex flex-col items-center gap-6 mt-10">
                <div className="flex gap-4">
                  <button
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-normal transition-colors disabled:opacity-50 border-2 border-[#222] dark:border-white/40 text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                    let start = Math.max(1, page - 2)
                    let end = Math.min(Math.ceil(total / pageSize), start + 4)
                    if (end - start < 4) start = Math.max(1, end - 4)
                    const pageNum = start + i
                    if (pageNum > end) return null
                    const isActive = pageNum === page
                    return (
                      <button
                        key={pageNum}
                        className={
                          `w-16 h-16 rounded-lg flex items-center justify-center text-xl font-normal transition-colors
                          ${isActive
                            ? 'bg-transparent border-none text-muted-foreground dark:text-muted-foreground cursor-default'
                            : 'border-2 border-[#222] dark:border-white/40 text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white'}
                          `
                        }
                        disabled={isActive}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-normal transition-colors disabled:opacity-50 border-2 border-[#222] dark:border-white/40 text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white"
                    disabled={page * pageSize >= total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    &gt;
                  </button>
                </div>
                <button
                  className="mt-2 px-8 py-3 border-2 border-[#222] dark:border-white/40 rounded-lg text-lg font-normal transition-colors text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Return To Top
                </button>
              </div>
            </>
          )}
          {/* Delete Collection Confirmation Popup */}
          <Popup
            open={deleteCollectionDialogOpen}
            onClose={() => setDeleteCollectionDialogOpen(false)}
            title="Delete Collection"
            width={400}
            maxWidth="95vw"
            actions={
              <>
                <Button
                  variant="secondary"
                  onClick={() => setDeleteCollectionDialogOpen(false)}
                  disabled={deleteCollectionLoading}
                  className="border-[#D2B877]/30 text-[#D2B877] hover:bg-[#D2B877]/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setDeleteCollectionLoading(true)
                    try {
                      await deleteCollectionAndArtworks(collectionId)
                      toast({ title: 'Collection deleted!' })
                      setDeleteCollectionDialogOpen(false)
                      router.push('/collections')
                    } catch (e: any) {
                      toast({ title: 'Failed to delete collection', description: e.message, variant: 'destructive' })
                    } finally {
                      setDeleteCollectionLoading(false)
                    }
                  }}
                  disabled={deleteCollectionLoading}
                  className="bg-red-600 text-white"
                >
                  {deleteCollectionLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            }
          >
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <AlertCircle className="h-5 w-5" />
              Are you sure you want to delete this collection? All artworks in this collection will also be deleted. This action cannot be undone.
            </div>
          </Popup>
        </main>
      </div>
    </div>
  )
}
