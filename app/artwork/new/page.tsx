"use client"

import type React from "react"

import { Header } from "@/components/header"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Camera, Loader2, Plus, X, AlertCircle, Pencil, Info, Edit2, Calendar, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  createArtwork,
  getCollectionsForUser,
  uploadArtworkImage,
  createCollection,
  getLatestCollectionForUser,
  getArtworksCountByCollectionId,
} from "@/lib/supabase-data"
import { Popup } from "@/components/popup"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar as DatePicker } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Stepper component
const steps = [
  { label: "Select Exhibit" },
  { label: "Upload Artwork" },
  { label: "Edit & Create" },
]
function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8 mt-2">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex items-center gap-2">
          <div
            className={[
              "rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm border-2 transition-all duration-200",
              current === idx
                ? "bg-[#D2B877] text-white border-[#D2B877]"
                : "bg-[#f0ede6] text-[#b0a98a] border-[#f0ede6] dark:bg-[#39383d] dark:text-[#b0a98a] dark:border-[#39383d]",
            ].join(" ")}
          >
            {idx < current ? <span>✓</span> : idx + 1}
          </div>
          <span className={`text-sm font-medium ${current === idx ? 'text-[#222] dark:text-[#f5f5f5]' : 'text-[#b0a98a] dark:text-[#b0a98a]'}`}>{step.label}</span>
          {idx < steps.length - 1 && <div className="w-8 h-0.5 bg-[#f0ede6] dark:bg-[#39383d] mx-1" />}
        </div>
      ))}
    </div>
  )
}

function StepHeader({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col items-center mb-6 mt-2">
      <Stepper current={currentStep} />
    </div>
  )
}

function StepBackButton({ currentStep, onBack }: { currentStep: number, onBack: () => void }) {
  let label = ""
  if (currentStep === 1) label = "Back to Exhibit"
  if (currentStep === 2) label = "Back to Upload"
  if (!label) return null
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 flex">
      <span
        role="button"
        tabIndex={0}
        onClick={onBack}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onBack()}
        className="group inline-flex items-center gap-1 text-[#D2B877] dark:text-[#D2B877] font-medium text-base cursor-pointer select-none transition hover:text-[#bfa14d] focus:outline-none focus:underline"
        style={{ minHeight: 40 }}
      >
        <ArrowLeft className="h-5 w-5 mr-1 transition group-hover:-translate-x-1" />
        <span>{label}</span>
      </span>
    </div>
  )
}

function NonMemberAlert() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="bg-[#f0ede6] dark:bg-[#39383d] p-4 rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 text-[#D2B877] mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-[#222] dark:text-[#f5f5f5]">
            Non-Member Limits
          </h4>
          <p className="text-sm text-[#222] dark:text-[#b0a98a]">
            Non-member users can create up to 2 exhibits, with a maximum of 8
            artworks in each. If you find Pocket Curator interesting and wish to
            explore further, please contact us to become a member.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function NewArtworkPage() {
  const router = useRouter()
  const { collections, addCollection } = useAppContext()
  const { user, isLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isButtonsSticky, setIsButtonsSticky] = useState(false)
  const formEndRef = useRef<HTMLDivElement>(null)
  const [selectedCollection, setSelectedCollection] = useState("")
  const [isCollectionSelected, setIsCollectionSelected] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [userCollections, setUserCollections] = useState<any[]>([])
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [images, setImages] = useState<any[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showCreateCollectionPopup, setShowCreateCollectionPopup] = useState(false)
  const [newCollectionLoading, setNewCollectionLoading] = useState(false)
  const [newCollectionErrors, setNewCollectionErrors] = useState<{ [key: string]: string }>({})
  const [newCollectionForm, setNewCollectionForm] = useState({
    title: "",
    description: "",
    curator: user?.name || "",
    location: "",
    date: new Date() as Date | null,
    isPublic: true,
  })

  const [artwork, setArtwork] = useState({
    title: "",
    artist: "",
    date: new Date().toISOString().split('T')[0],
    curatorNotes: "",
    imageUrl: "",
    collectionIds: [] as string[],
  })

  // --- Default exhibit for new users ---
  const getDefaultExhibit = (user: any) => ({
    id: "__default__",
    title: user?.name ? `${user.name}'s First Pocket Exhibit` : "Your First Pocket Exhibit",
    description: user?.name ? `${user.name}'s first online gallery. Bring personal art journey to the world.` : "Your first online gallery. Bring personal art journey to the world.",
    isPublic: true,
    curator: user?.name || "",
    location: "",
    date: new Date(),
    ownerId: user?.id || "",
  })
  const [hasCreatedDefaultExhibit, setHasCreatedDefaultExhibit] = useState(false)
  const DEFAULT_EXHIBIT = getDefaultExhibit(user)

  // Check if user has any collections on mount
  useEffect(() => {
    if (user && collections.length === 0) {
      router.push("/collection/new?redirect=/artwork/new")
    }
  }, [user, collections, router])

  // Add scroll detection for sticky buttons
  useEffect(() => {
    if (!isMobile) {
      const checkButtonsPosition = () => {
        if (formEndRef.current) {
          const rect = formEndRef.current.getBoundingClientRect()
          const isNearBottom = rect.top <= window.innerHeight + 100
          setIsButtonsSticky(!isNearBottom)
        }
      }

      window.addEventListener("scroll", checkButtonsPosition)
      // Initial check
      checkButtonsPosition()

      return () => {
        window.removeEventListener("scroll", checkButtonsPosition)
      }
    }
  }, [isMobile])

  // Check if the screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // load user collections and default select the latest created collection
  useEffect(() => {
    if (user) {
      setLoadingCollections(true)
      Promise.all([
        getCollectionsForUser(user.id),
        getLatestCollectionForUser(user.id)
      ])
        .then(([collections, latest]) => {
          setUserCollections(collections)
          if (collections.length > 0 && latest) {
            setSelectedCollection(latest.id)
          }
        })
        .catch((err) => {
          toast({
            title: "Failed to load collections",
            description: err.message || "Could not fetch your collections from Supabase.",
            variant: "destructive",
          })
        })
        .finally(() => setLoadingCollections(false))
    }
  }, [user])

  // --- Inject default exhibit if user has no collections ---
  const collectionsForDropdown = userCollections.length === 0
    ? [DEFAULT_EXHIBIT]
    : userCollections

  // --- Preselect default exhibit if no collections ---
  useEffect(() => {
    if (userCollections.length === 0 && selectedCollection !== DEFAULT_EXHIBIT.id) {
      setSelectedCollection(DEFAULT_EXHIBIT.id)
    }
  }, [userCollections, selectedCollection, DEFAULT_EXHIBIT.id])

  // Set default values when collection is selected
  useEffect(() => {
    if (selectedCollection) {
      const collection = userCollections.find(c => c.id === selectedCollection)
      if (collection) {
        setArtwork(prev => ({
          ...prev,
          title: `${collection.title} #${(collection.artworkCount || 0) + 1}`,
          collectionIds: [selectedCollection]
        }))
      }
    }
  }, [selectedCollection, userCollections])

  // Handle file(s) change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = Array.from(e.target.files || [])
    if (!user) {
      router.push("/auth/login?redirect=/artwork/new")
      return
    }
    if (files.length === 0) return

    // Restriction for non-members
    if (user && !user.member) {
      try {
        const collection = userCollections.find(c => c.id === selectedCollection)
        if (collection) {
          const currentArtworks = await getArtworksCountByCollectionId(selectedCollection)
          const totalBeforeAdding = currentArtworks

          if (totalBeforeAdding >= 8) {
            toast({
              title: "Upload Limit Reached",
              description: "Non-members can only have 8 artworks per exhibit. You cannot upload more images.",
              variant: "destructive",
            })
            return;
          }

          const availableSlots = 8 - totalBeforeAdding
          if (files.length > availableSlots) {
            toast({
              title: "Upload Limit Exceeded",
              description: `Non-members can only have 8 artworks per exhibit. You can upload ${availableSlots} more images to this exhibit.`,
              variant: "destructive",
            })
            // we only keep the allowed number of files
            files = files.slice(0, availableSlots)
            if (files.length === 0) return
          }
        }
      } catch (error: any) {
        toast({
          title: "Error checking artwork limit",
          description: error.message,
          variant: "destructive",
        })
        return
      }
    }

    const newImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      meta: {
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: user?.name || "",
        curatorNotes: "",
        date: new Date().toISOString().split('T')[0],
      },
    }))
    setImages(newImages)
  }

  const handleCaptureClick = () => {
    if (!user) {
      router.push("/auth/login?redirect=/artwork/new")
      return
    }
    fileInputRef.current?.click()
  }

  const handleUploadClick = () => {
    if (!user) {
      router.push("/auth/login?redirect=/artwork/new")
      return
    }
    fileInputRef.current?.click()
  }

  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollection(collectionId)
  }

  const handleCreateNewCollection = () => {
    setShowCreateCollectionPopup(true)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!artwork.title.trim()) {
      newErrors.title = "Required"
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.title && titleRef.current) {
        titleRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        titleRef.current.focus()
      }
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push("/auth/login?redirect=/artwork/new")
      return
    }
    if (!validateForm()) {
      return
    }
    if (artwork.title.trim() && images[0]?.file && selectedCollection) {
      try {
        setIsUploading(true)
        const publicUrl = await uploadArtworkImage(images[0].file, user.id)
        const newArtwork = await createArtwork({
          title: artwork.title,
          artist: artwork.artist,
          date: artwork.date,
          curatorNotes: artwork.curatorNotes,
          imageUrl: publicUrl,
          collectionId: selectedCollection,
          ownerId: user.id,
        })
        setIsUploading(false)
        router.push(`/artwork/${newArtwork.id}`)
      } catch (error: any) {
        setIsUploading(false)
        toast({
          title: "Failed to add artwork",
          description: error.message || "An error occurred while adding the artwork.",
          variant: "destructive",
        })
      }
    }
  }

  // Batch mode: edit meta
  const handleEditMeta = (idx: number) => setEditingIndex(idx)
  const handleDeleteImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx))
  const handleSaveMeta = (meta: any) => {
    if (editingIndex === null) return
    setImages((prev) => prev.map((img, i) => i === editingIndex ? { ...img, meta } : img))
    setEditingIndex(null)
  }
  const handleNextEdit = (meta: any) => {
    if (editingIndex === null) return
    setImages((prev) => prev.map((img, i) => i === editingIndex ? { ...img, meta } : img))
    if (editingIndex < images.length - 1) setEditingIndex(editingIndex + 1)
    else setEditingIndex(null)
  }
  const handleSubmitAll = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/artwork/new")
      return
    }
    if (!selectedCollection) {
      toast({ title: "Please select a collection" })
      return
    }
    if (images.length === 0) {
      toast({ title: "Please upload images first" })
      return
    }

    // Final check for non-members before uploading
    if (user && !user.member) {
      try {
        const currentArtworks = await getArtworksCountByCollectionId(selectedCollection)
        if (currentArtworks + images.length > 8) {
          toast({
            title: "Upload Limit Exceeded",
            description: `Non-members can only have 8 artworks per exhibit. You have ${currentArtworks} artworks and tried to add ${images.length}.`,
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

    setIsUploading(true)
    try {
      const uploadResults = await Promise.all(images.map(img => uploadArtworkImage(img.file, user.id)))
      await Promise.all(images.map((img, i) => createArtwork({
        title: img.meta.title,
        artist: img.meta.artist,
        date: img.meta.date,
        curatorNotes: img.meta.curatorNotes,
        imageUrl: uploadResults[i],
        collectionId: selectedCollection,
        ownerId: user.id,
      })))
      toast({ title: "All artworks created!", variant: "default" })
      router.push("/collections/" + selectedCollection)
    } catch (error: any) {
      toast({ title: "Batch creation failed", description: error.message, variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  // Add more images
  const handleAddMoreImages = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Restriction for non-members
    if (user && !user.member) {
      try {
        const currentArtworks = await getArtworksCountByCollectionId(selectedCollection)
        const totalBeforeAdding = currentArtworks + images.length

        if (totalBeforeAdding >= 8) {
          toast({
            title: "Upload Limit Reached",
            description: "Non-members can only have 8 artworks per exhibit. You cannot add more images.",
            variant: "destructive",
          })
          return;
        }
        
        const availableSlots = 8 - totalBeforeAdding
        if (files.length > availableSlots) {
          toast({
            title: "Upload Limit Exceeded",
            description: `Non-members can only have 8 artworks per exhibit. You can add ${availableSlots} more images.`,
            variant: "destructive",
          })
          // we only keep the allowed number of files
          files = files.slice(0, availableSlots)
          if (files.length === 0) return
        }
      } catch (error: any) {
        toast({
          title: "Error checking artwork limit",
          description: error.message,
          variant: "destructive",
        })
        return
      }
    }

    const newImages = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      meta: {
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: user?.name || "",
        curatorNotes: "",
        date: new Date().toISOString().split("T")[0],
      },
    }))
    setImages(prev => [...prev, ...newImages])
  }
  const addMoreInputRef = useRef<HTMLInputElement>(null)

  const selectedCollectionObjects = collections.filter((col) => artwork.collectionIds.includes(col.id))

  // calculate current step
  let currentStep = 0
  if (isCollectionSelected && images.length === 0) currentStep = 1
  else if (isCollectionSelected && images.length > 0) currentStep = 2

  // Back button logic
  function handleBack() {
    if (currentStep === 0) return // cannot go back
    if (currentStep === 1) setIsCollectionSelected(false)
    else if (currentStep === 2) setImages([])
  }

  // new collection form validation
  const validateNewCollectionForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!newCollectionForm.title.trim()) {
      newErrors.title = "Required"
    }
    setNewCollectionErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // new collection submit
  const handleCreateCollectionSubmit = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/artwork/new")
      return
    }
    if (!validateNewCollectionForm()) return
    setNewCollectionLoading(true)
    try {
      const fullDescription = newCollectionForm.description
        ? `${newCollectionForm.description}\n\nCurated by: ${newCollectionForm.curator}`
        : `Curated by: ${newCollectionForm.curator}`
      const newCol = await createCollection({
        name: newCollectionForm.title,
        description: fullDescription,
        isPublic: newCollectionForm.isPublic,
        curator: newCollectionForm.curator,
        location: newCollectionForm.location,
        date: newCollectionForm.date,
        ownerId: user.id,
      })
      // refresh collection list and select new item
      const updated = await getCollectionsForUser(user.id)
      setUserCollections(updated)
      setSelectedCollection(newCol.id)
      setShowCreateCollectionPopup(false)
      // reset form
      setNewCollectionForm({
        title: "",
        description: "",
        curator: user?.name || "",
        location: "",
        date: new Date() as Date | null,
        isPublic: true,
      })
      setNewCollectionErrors({})
      toast({ title: "Collection created!", variant: "default" })
    } catch (error: any) {
      toast({
        title: "Failed to create collection",
        description: error.message || "An error occurred while creating the collection.",
        variant: "destructive",
      })
    } finally {
      setNewCollectionLoading(false)
    }
  }

  // --- On Next: create default exhibit in Supabase if needed ---
  async function handleNextFromDefaultExhibit() {
    if (selectedCollection === DEFAULT_EXHIBIT.id && !hasCreatedDefaultExhibit) {
      setIsUploading(true)
      try {
        const newCol = await createCollection({
          name: DEFAULT_EXHIBIT.title,
          description: DEFAULT_EXHIBIT.description,
          isPublic: DEFAULT_EXHIBIT.isPublic,
          curator: DEFAULT_EXHIBIT.curator,
          location: DEFAULT_EXHIBIT.location,
          date: DEFAULT_EXHIBIT.date,
          ownerId: DEFAULT_EXHIBIT.ownerId,
        })
        setUserCollections([newCol])
        setSelectedCollection(newCol.id)
        setHasCreatedDefaultExhibit(true)
        setIsCollectionSelected(true)
      } catch (error: any) {
        toast({
          title: "Failed to create starter exhibit",
          description: error.message || "An error occurred while creating the starter exhibit.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    } else {
      setIsCollectionSelected(true)
    }
  }

  // intercept unauthenticated users, combined with isLoading state
  useEffect(() => {
    if (!isLoading && user === null) {
      router.replace("/auth/login?redirect=/artwork/new")
    }
  }, [user, isLoading, router])

  // when user changes, automatically sync curator field
  useEffect(() => {
    setNewCollectionForm(prev => ({
      ...prev,
      curator: user?.name || ""
    }))
  }, [user])

  if (isLoading) {
    // user info loading
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }
  if (user === null) {
    // redirecting, do not render content
    return null
  }

  const selectedCollectionData = userCollections.find(c => c.id === selectedCollection)
  const currentArtworkCount = selectedCollectionData?.artworkCount || 0

  return (
    <div className="flex min-h-screen flex-col relative bg-[#faf9f6] dark:bg-[#18171c] text-[#222] dark:text-[#f5f5f5]">
      <div className="relative z-10 flex-grow">
        <Header />
        <main className="flex-1 container py-8 flex flex-col items-center">
          {/* Stepper */}
          <StepHeader currentStep={currentStep} />
          {/* Back Button (not shown in step 1) */}
          <StepBackButton currentStep={currentStep} onBack={handleBack} />
          {/* Non member alert */}
          {user && !user.member && <NonMemberAlert />}
          {!isCollectionSelected ? (
            <div className="w-full max-w-2xl mx-auto">
              <Card className="bg-white dark:bg-[#232228] border border-[#f0ede6] dark:border-[#232228] rounded-2xl shadow-lg">
                <CardContent className="pt-8 px-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold font-sans text-[#222] dark:text-[#f5f5f5] mb-6">
                      Select or create an exhibit before adding your artwork.
                    </h2>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                      <Select onValueChange={handleCollectionSelect} value={selectedCollection}>
                        <SelectTrigger className="w-full bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5] placeholder:text-[#b0a98a] dark:placeholder:text-[#b0a98a] rounded-lg h-12 text-base">
                          <SelectValue placeholder="Select Existing Exhibit" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5]">
                          {collectionsForDropdown.map((collection) => (
                            <SelectItem
                              key={collection.id}
                              value={collection.id}
                              className="focus:bg-[#f0ede6] dark:focus:bg-[#39383d]"
                            >
                              {collection.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-[#D2B877] hover:text-[#bfa14d] dark:text-[#D2B877] dark:hover:text-[#bfa14d] font-medium"
                        onClick={handleCreateNewCollection}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create New Exhibit
                      </Button>
                    </div>
                    {selectedCollection && (
                      <div className="flex flex-col items-center gap-4 mt-4">
                        <Button
                          type="button"
                          className="bg-[#D2B877] text-white dark:text-[#232228] rounded-lg shadow hover:bg-[#c7a95a] dark:bg-[#D2B877] dark:hover:bg-[#bfa14d] min-w-[180px] font-medium text-lg"
                          onClick={selectedCollection === DEFAULT_EXHIBIT.id && !hasCreatedDefaultExhibit ? handleNextFromDefaultExhibit : () => setIsCollectionSelected(true)}
                          disabled={isUploading}
                        >
                          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : images.length === 0 ? (
            <div className="grid place-items-center h-full">
              <div className="text-center w-full max-w-lg mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold font-sans text-[#222] dark:text-[#f5f5f5] mb-6">
                  Step 2: Upload Artwork
                </h2>
                <p className="text-sm text-muted-foreground mb-2">
                  This exhibit currently has {currentArtworkCount} artworks.
                </p>
                <p className="text-[#222] dark:text-[#b0a98a] mb-6 max-w-md mx-auto">
                  Upload one or more images of your artwork. You can drag and drop
                  files here or click to select from your device.
                </p>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#D2B877] bg-white dark:bg-[#232228] rounded-xl p-10 cursor-pointer transition hover:bg-[#f0ede6] dark:hover:bg-[#39383d] hover:border-[#bfa14d] min-h-[220px]"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const dropEvent = {
                      ...e,
                      target: { ...e.target, files: e.dataTransfer.files },
                    } as unknown as React.ChangeEvent<HTMLInputElement>
                    handleFileChange(dropEvent)
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="Upload Images"
                >
                  <Upload className="h-12 w-12 text-[#D2B877] mb-2" />
                  <span className="text-[#D2B877] font-medium text-lg mb-2">Click or Drag & Drop to Upload</span>
                  <span className="text-[#b0a98a] dark:text-[#b0a98a] text-sm">Supported: JPG, PNG, GIF, etc.</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    multiple
                  />
                </div>
              </div>
            </div>
          ) : images.length === 1 ? (
            <form onSubmit={handleSubmit} className="relative pb-20 md:pb-0 w-full max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className={cn(
                  "rounded-xl overflow-hidden",
                  images[0].previewUrl ? "md:w-[60%] w-full md:sticky md:top-24 md:self-start" : "max-w-3xl mx-auto"
                )}>
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#f0ede6] dark:border-[#39383d] bg-white dark:bg-[#232228] min-h-[320px] md:min-h-[420px]">
                    {isUploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#faf9f6]/80 dark:bg-[#18171c]/90">
                        <Loader2 className="h-8 w-8 animate-spin text-[#D2B877]" />
                        <span className="ml-2 text-[#222] dark:text-[#f5f5f5]">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        {images[0].previewUrl ? (
                          <>
                            <Image
                              src={images[0].previewUrl}
                              alt="Artwork preview"
                              fill
                              className="object-contain"
                            />
                            <div className="absolute top-4 left-4">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setImages([])}
                                className="bg-white dark:bg-[#232228] hover:bg-[#f0ede6] dark:hover:bg-[#39383d] text-[#222] dark:text-[#f5f5f5] border border-[#e5e1d8] dark:border-[#39383d] rounded-lg"
                              >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Choose Different Image
                              </Button>
                            </div>
                          </>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-[40%] md:max-w-[440px] py-4 md:py-0">
                  <Card className="bg-white dark:bg-[#232228] border border-[#f0ede6] dark:border-[#232228] rounded-2xl shadow-lg">
                    <CardContent className="pt-6">
                      <h2 className="text-2xl md:text-3xl font-bold font-sans text-[#222] dark:text-[#f5f5f5] mb-6">
                        Step 3: Add Artwork Details
                      </h2>
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="title" className="text-[#222] dark:text-[#f5f5f5] font-medium">
                            Title
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            type="text"
                            id="title"
                            value={artwork.title}
                            onChange={(e) => setArtwork({ ...artwork, title: e.target.value })}
                            ref={titleRef}
                            className="bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5] placeholder:text-[#b0a98a] dark:placeholder:text-[#b0a98a] rounded-lg h-12 text-base"
                          />
                          {errors.title && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.title}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="artist" className="text-[#222] dark:text-[#f5f5f5] flex items-center gap-2 font-medium">
                            Artist
                            <span className="text-sm text-[#b0a98a] dark:text-[#b0a98a]">(Optional)</span>
                          </Label>
                          <Input
                            type="text"
                            id="artist"
                            placeholder="Artist name"
                            value={artwork.artist}
                            onChange={(e) => setArtwork({ ...artwork, artist: e.target.value })}
                            className="bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5] placeholder:text-[#b0a98a] dark:placeholder:text-[#b0a98a] rounded-lg h-12 text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="date" className="text-[#222] dark:text-[#f5f5f5] font-medium">
                            Date
                          </Label>
                          <Input
                            type="date"
                            id="date"
                            value={artwork.date}
                            onChange={(e) => setArtwork({ ...artwork, date: e.target.value })}
                            className="bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5] placeholder:text-[#b0a98a] dark:placeholder:text-[#b0a98a] rounded-lg h-12 text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="curatorNotes" className="text-[#222] dark:text-[#f5f5f5] flex items-center gap-2 font-medium">
                            Curator Notes
                            <span className="text-sm text-[#b0a98a] dark:text-[#b0a98a]">(Optional)</span>
                          </Label>
                          <Textarea
                            id="curatorNotes"
                            placeholder="Add your notes about this artwork"
                            value={artwork.curatorNotes}
                            onChange={(e) => setArtwork({ ...artwork, curatorNotes: e.target.value })}
                            className="bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5] placeholder:text-[#b0a98a] dark:placeholder:text-[#b0a98a] rounded-lg min-h-[80px] text-base"
                          />
                        </div>
                        <div>
                          <Label className="text-[#222] dark:text-[#f5f5f5] font-medium">Selected Exhibit</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {collections
                              .filter((col) => col.id === selectedCollection)
                              .map((collection) => (
                                <Badge
                                  key={collection.id}
                                  variant="default"
                                  className="bg-[#D2B877] text-white dark:bg-[#D2B877] dark:text-[#232228] rounded"
                                >
                                  {(collection as any).title}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex justify-end gap-4">
                        <Button
                          type="submit"
                          disabled={isUploading}
                          className="bg-[#D2B877] text-white dark:text-[#232228] rounded-lg shadow hover:bg-[#c7a95a] dark:bg-[#D2B877] dark:hover:bg-[#bfa14d] font-medium text-lg min-w-[140px]"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Create Artwork"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div ref={formEndRef} />
            </form>
          ) : (
            <div className="w-full max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Add Images Card */}
                <div
                  className="relative group overflow-hidden rounded-xl border border-[#D2B877]/20 bg-white dark:bg-[#232228] transition-all duration-200 aspect-[4/3] min-w-[250px] flex flex-col items-center justify-center cursor-pointer hover:shadow-[0_4px_12px_rgba(210,184,119,0.25)] hover:bg-[#f0ede6] dark:hover:bg-[#39383d] hover:border-[#D2B877]"
                  onClick={() => addMoreInputRef.current?.click()}
                  tabIndex={0}
                  role="button"
                  aria-label="Add Images"
                >
                  <Plus className="h-12 w-12 text-[#D2B877] mb-2" />
                  <span className="text-[#D2B877] font-medium text-lg">Add Images</span>
                  <input type="file" ref={addMoreInputRef} className="hidden" accept="image/*" multiple onChange={handleAddMoreImages} />
                </div>
                
                {/* Image Cards */}
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "relative group overflow-hidden rounded-xl border border-[#f0ede6] dark:border-[#39383d] bg-white dark:bg-[#232228] transition-all duration-200 min-w-[250px] hover:shadow-[0_4px_12px_rgba(210,184,119,0.25)]",
                      editingIndex === idx ? "min-h-[400px]" : "aspect-[4/3]"
                    )}
                  >
                    {/* Edit/Delete buttons */}
                    {editingIndex !== idx && (
                      <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="border border-[#D2B877] bg-white dark:bg-[#232228] text-[#D2B877] rounded-full shadow hover:bg-[#D2B877]/10"
                          onClick={() => handleEditMeta(idx)}
                          aria-label="Edit"
                          tabIndex={0}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="border border-[#D2B877] bg-white dark:bg-[#232228] text-[#D2B877] rounded-full shadow hover:bg-[#D2B877]/10"
                          onClick={() => handleDeleteImage(idx)}
                          aria-label="Delete"
                          tabIndex={0}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Inline Edit Form */}
                    {editingIndex === idx ? (
                      <div className="p-6 w-full h-full flex flex-col">
                        {/* Preview Image */}
                        <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden border border-[#f0ede6] dark:border-[#39383d]">
                          <Image src={img.previewUrl} alt="preview" fill className="object-cover" />
                        </div>
                        
                        {/* Form Fields */}
                        <div className="space-y-4 flex-1">
                          <div>
                            <label className="block text-sm font-medium text-[#222] dark:text-[#f5f5f5] mb-2">Title</label>
                            <Input 
                              value={img.meta.title} 
                              onChange={e => setImages(prev => prev.map((image, i) => i === idx ? { ...image, meta: { ...image.meta, title: e.target.value } } : image))}
                              className="bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5] h-10"
                              placeholder="Artwork title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#222] dark:text-[#f5f5f5] mb-2">Artist</label>
                            <Input 
                              value={img.meta.artist} 
                              onChange={e => setImages(prev => prev.map((image, i) => i === idx ? { ...image, meta: { ...image.meta, artist: e.target.value } } : image))}
                              className="bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5] h-10"
                              placeholder="Artist name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#222] dark:text-[#f5f5f5] mb-2">Date</label>
                            <Input 
                              type="date" 
                              value={img.meta.date} 
                              onChange={e => setImages(prev => prev.map((image, i) => i === idx ? { ...image, meta: { ...image.meta, date: e.target.value } } : image))}
                              className="bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5] h-10"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#222] dark:text-[#f5f5f5] mb-2">Curator Notes</label>
                            <Textarea 
                              value={img.meta.curatorNotes} 
                              onChange={e => setImages(prev => prev.map((image, i) => i === idx ? { ...image, meta: { ...image.meta, curatorNotes: e.target.value } } : image))}
                              className="bg-white dark:bg-[#232228] border border-[#e5e1d8] dark:border-[#39383d] text-[#222] dark:text-[#f5f5f5] min-h-[80px] resize-none"
                              placeholder="Add your notes about this artwork"
                            />
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-[#f0ede6] dark:border-[#39383d]">
                          <Button
                            className="bg-[#D2B877] text-white dark:text-[#232228] rounded-lg shadow hover:bg-[#c7a95a] dark:bg-[#D2B877] dark:hover:bg-[#bfa14d] font-medium flex-1"
                            onClick={() => setEditingIndex(null)}
                          >
                            Done
                          </Button>
                          {idx < images.length - 1 && (
                            <Button
                              variant="outline"
                              className="border border-[#D2B877] text-[#D2B877] hover:bg-[#D2B877]/10 rounded-lg font-medium px-6"
                              onClick={() => setEditingIndex(idx + 1)}
                            >
                              Next
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Normal Card Display */
                      <div className="h-full flex flex-col">
                        <div className="relative flex-1">
                          <Image src={img.previewUrl} alt="preview" fill className="object-cover rounded-t-xl" />
                        </div>
                        <div className="p-4 bg-white dark:bg-[#232228]">
                          <h3 className="text-base font-bold font-sans text-[#222] dark:text-[#f5f5f5] leading-tight line-clamp-1 mb-1">
                            {img.meta.title || 'Untitled'}
                          </h3>
                          {img.meta.artist && (
                            <p className="text-sm text-[#b0a98a] dark:text-[#b0a98a] line-clamp-1">
                              {img.meta.artist}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {images.length > 0 && (
                <div className="mt-10 flex justify-center">
                  <Button 
                    onClick={handleSubmitAll} 
                    disabled={isUploading} 
                    className="bg-[#D2B877] text-white dark:text-[#232228] rounded-lg shadow hover:bg-[#c7a95a] dark:bg-[#D2B877] dark:hover:bg-[#bfa14d] font-medium text-lg min-w-[200px] h-12"
                  >
                    {isUploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>) : "Finish Creating All"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Popup for create collection */}
      <Popup
        open={showCreateCollectionPopup}
        onClose={() => setShowCreateCollectionPopup(false)}
        title="Create New Exhibit"
        width={600}
        maxWidth="98vw"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCreateCollectionPopup(false)}
              className="border-[#D2B877]/30 text-[#D2B877] hover:bg-[#D2B877]/20"
              disabled={newCollectionLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#D2B877] hover:bg-[#E8C987] text-black"
              onClick={handleCreateCollectionSubmit}
              disabled={newCollectionLoading}
            >
              {newCollectionLoading ? "Creating..." : "Create Exhibit"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title" className="text-[#D2B877] text-lg">
              Title
            </Label>
            <Input
              type="text"
              id="title"
              placeholder="Exhibit Title"
              value={newCollectionForm.title}
              onChange={e => setNewCollectionForm({ ...newCollectionForm, title: e.target.value })}
              className="bg-black/50 border-[#D2B877]/30 text-white focus:border-[#D2B877] focus:ring-0 focus:ring-offset-0 h-12 text-lg outline-none"
            />
            {newCollectionErrors.title && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {newCollectionErrors.title}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description" className="text-[#D2B877] text-lg">
              Description <span className="text-sm text-[#D2B877]/60">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your exhibit"
              value={newCollectionForm.description}
              onChange={e => setNewCollectionForm({ ...newCollectionForm, description: e.target.value })}
              className="bg-black/50 border-[#D2B877]/30 text-white focus:border-[#D2B877] focus:ring-0 focus:ring-offset-0 min-h-[80px] text-lg outline-none"
            />
          </div>
          <div>
            <Label htmlFor="curator" className="text-[#D2B877] text-lg">
              Curator
            </Label>
            <Input
              type="text"
              id="curator"
              placeholder="Curator name"
              value={newCollectionForm.curator}
              disabled
              className="bg-black/50 border-[#D2B877]/30 text-white focus:border-[#D2B877] focus:ring-0 focus:ring-offset-0 h-12 text-lg outline-none opacity-70 cursor-not-allowed"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-[#D2B877] text-lg flex items-center gap-2">
              Location
              <span className="text-sm text-[#D2B877]/60">(Optional)</span>
            </Label>
            <Input
              type="text"
              id="location"
              placeholder="e.g., Museum of Modern Art"
              value={newCollectionForm.location}
              onChange={e => setNewCollectionForm({ ...newCollectionForm, location: e.target.value })}
              className="bg-black/50 border-[#D2B877]/30 text-white focus:border-[#D2B877] focus:ring-0 focus:ring-offset-0 h-12 text-lg outline-none"
            />
          </div>
          <div>
            <Label htmlFor="date" className="text-[#D2B877] text-lg flex items-center gap-2">
              Date
              <span className="text-sm text-[#D2B877]/60">(Optional)</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 bg-black/50 border-[#D2B877]/30 text-white hover:bg-black/60 hover:text-white",
                    !newCollectionForm.date && "text-muted-foreground"
                  )}
                  onClick={() => {
                    if (newCollectionForm.date === null) {
                      setNewCollectionForm({ ...newCollectionForm, date: new Date() })
                    }
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newCollectionForm.date ? format(newCollectionForm.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black/90 border-[#D2B877]/30">
                <div className="p-2 flex justify-between items-center border-b border-[#D2B877]/20">
                  <span className="text-sm text-[#D2B877]">Clear date</span>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-[#D2B877] hover:text-white hover:bg-[#D2B877]/20"
                    onClick={() => setNewCollectionForm({ ...newCollectionForm, date: null })}
                  >
                    ✕
                  </Button>
                </div>
                <DatePicker
                  mode="single"
                  selected={newCollectionForm.date || undefined}
                  onSelect={date => setNewCollectionForm({ ...newCollectionForm, date: date ?? null })}
                  initialFocus
                  className="bg-transparent text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={newCollectionForm.isPublic}
              onChange={e => setNewCollectionForm({ ...newCollectionForm, isPublic: e.target.checked })}
              className="h-4 w-4 rounded border-[#D2B877]/30 bg-black/50 text-[#D2B877] focus:ring-[#D2B877]"
            />
            <Label htmlFor="isPublic" className="text-[#D2B877] text-lg">
              Make this exhibit public
            </Label>
          </div>
        </div>
      </Popup>
    </div>
  )
}
