"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { useAuth } from "@/context/auth-context"
import { useAppContext } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, PlusCircle, User, Heart, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import Image from "next/image"
import type { Collection, Artwork } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CollectionCard, ArtworkCard } from "@/components/collection-card"
import { getCollectionsForUser, getFavoriteCollectionsForUser, getFavoriteArtworksForUser, getArtworkLikeCount } from "@/lib/supabase-data"
import { useIsMobile } from "@/hooks/use-mobile"

export default function ProfilePage() {
  const { user, isLoading, getUserCollections, createUserCollection } = useAuth()
  const router = useRouter()
  const [userCollections, setUserCollections] = useState<Collection[]>([])
  const [favoriteCollections, setFavoriteCollections] = useState<Collection[]>([])
  const [favoriteArtworks, setFavoriteArtworks] = useState<Artwork[]>([])
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    isPublic: false,
  })
  const [collectionFilter, setCollectionFilter] = useState<"all" | "public" | "private">("all")
  const PAGE_SIZE = 12
  const [page, setPage] = useState(1)
  const [totalCollections, setTotalCollections] = useState(0)
  const [activeTab, setActiveTab] = useState("collections")
  const isMobile = useIsMobile()
  const [artworkLikeCounts, setArtworkLikeCounts] = useState<Record<string, number>>({})

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login?redirect=/profile")
    }
  }, [isLoading, user, router])

  // Load user collections and artwork counts from Supabase
  useEffect(() => {
    async function fetchCollectionsAndCounts() {
      if (user) {
        const collections = await getCollectionsForUser(user.id, collectionFilter)
        setUserCollections(collections)
        setTotalCollections(collections.length)
      }
    }
    fetchCollectionsAndCounts()
  }, [user, collectionFilter])

  // Load favorite collections and artworks from Supabase
  useEffect(() => {
    async function fetchFavorites() {
      if (user) {
        const [favCollections, favArtworks] = await Promise.all([
          getFavoriteCollectionsForUser(user.id),
          getFavoriteArtworksForUser(user.id),
        ])
        setFavoriteCollections(favCollections)
        setFavoriteArtworks(
          favArtworks.map((art: any) => ({
            ...art,
            imageUrl: art.imageUrl || art.image_url || "/placeholder.svg",
          }))
        )
      }
    }
    fetchFavorites()
  }, [user])

  useEffect(() => {
    if (favoriteArtworks.length === 0) return
    let isMounted = true
    Promise.all(
      favoriteArtworks.map(async (artwork) => {
        try {
          const count = await getArtworkLikeCount(artwork.id)
          return { id: artwork.id, count }
        } catch {
          return { id: artwork.id, count: 0 }
        }
      })
    ).then((results) => {
      if (!isMounted) return
      const counts: Record<string, number> = {}
      results.forEach(({ id, count }) => {
        counts[id] = count
      })
      setArtworkLikeCounts(counts)
    })
    return () => { isMounted = false }
  }, [favoriteArtworks])

  const handleCreateCollection = () => {
    if (newCollection.name.trim()) {
      createUserCollection({
        name: newCollection.name,
        description: newCollection.description,
        coverImageUrl: "/eclectic-gallery-wall.png",
        artworkIds: [],
        isPublic: newCollection.isPublic,
      })
      setNewCollection({ name: "", description: "", isPublic: false })
    }
  }

  // Filter collections based on selected filter
  const filteredCollections = userCollections.filter(collection => {
    if (collectionFilter === "all") return true
    if (collectionFilter === "public") return collection.isPublic
    if (collectionFilter === "private") return !collection.isPublic
    return true
  })
  const pagedCollections = userCollections.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(userCollections.length / PAGE_SIZE) || 1

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col relative">
        <div className="relative z-10 flex-grow">
          <Header />
          <main className="flex-1 container py-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D2B877]" />
          </main>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="relative z-10 flex-grow">
        <Header />
        <main className="flex-1 container py-8">
          {/* User Profile Section */}
          <div className="backdrop-blur-lg bg-card/70 dark:bg-[#181818]/70 rounded-xl p-6 border border-border mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-[#D2B877] bg-background">
                <AvatarImage src="/avatars/avatar2.png" alt="User Avatar" />
                <AvatarFallback className="bg-[#1F2636] text-[#D2B877] text-2xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-[#222] dark:text-[#D2B877] drop-shadow-sm">{user.name}</h1>
                <p className="text-muted-foreground mt-1">{user.email}</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Member since {format(new Date(user.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* tabs area optimization, mobile dropdown menu, desktop horizontal tabs, tabs component always wrap content */}
          <div className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {isMobile ? (
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full px-4 py-3 rounded-xl border-2 border-[#D2B877] bg-background text-foreground text-base font-semibold shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collections">Exhibits</SelectItem>
                    <SelectItem value="favorite-collections">Favorite Exhibits</SelectItem>
                    <SelectItem value="favorite-artworks">Favorite Artworks</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <TabsList className="flex gap-8 border-b border-[#D2B877]/40 bg-transparent px-0 mb-6 overflow-x-auto scrollbar-none whitespace-nowrap">
                  <TabsTrigger
                    value="collections"
                    className="relative px-1 pb-3 text-lg font-semibold text-foreground data-[state=active]:text-[#D2B877] data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:w-full data-[state=active]:after:h-1 data-[state=active]:after:bg-[#D2B877] data-[state=active]:after:rounded-full"
                  >
                    Exhibits
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorite-collections"
                    className="relative px-1 pb-3 text-lg font-semibold text-foreground data-[state=active]:text-[#D2B877] data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:w-full data-[state=active]:after:h-1 data-[state=active]:after:bg-[#D2B877] data-[state=active]:after:rounded-full"
                  >
                    Favorite Exhibits
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorite-artworks"
                    className="relative px-1 pb-3 text-lg font-semibold text-foreground data-[state=active]:text-[#D2B877] data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:w-full data-[state=active]:after:h-1 data-[state=active]:after:bg-[#D2B877] data-[state=active]:after:rounded-full"
                  >
                    Favorite Artworks
                  </TabsTrigger>
                </TabsList>
              )}
              {/* Collections Tab Content - no outer border, first is upload card */}
              <TabsContent value="collections">
                <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-bold text-[#D2B877]">Your Exhibits</h2>
                  {/* Filter Select - use Shadcn UI Select instead of native select */}
                  <div className="w-full sm:w-auto">
                    <Select value={collectionFilter} onValueChange={v => setCollectionFilter(v as "all" | "public" | "private")}> 
                      <SelectTrigger className="w-full sm:w-[180px] px-3 py-2 rounded-lg border border-[#D2B877]/30 bg-background text-foreground focus:border-[#D2B877] focus:ring-[#D2B877]/20 text-base">
                        <SelectValue placeholder="Filter exhibits" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Curate New Exhibit card */}
                  <div
                    className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-[#D2B877] bg-background hover:bg-[#D2B877]/10 cursor-pointer transition group min-h-[100px] h-full w-full overflow-hidden"
                    onClick={() => window.location.href = '/artwork/new'}
                    tabIndex={0}
                    role="button"
                    aria-label="Curate new exhibit"
                  >
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-[#D2B877] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="mt-2 text-[#D2B877] font-medium text-sm sm:text-base text-center">Curate New Exhibit</span>
                  </div>
                  {/* other exhibit cards */}
                  {pagedCollections.map((collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      isOwnedByUser={true}
                      fromPage="profile"
                      size="sm"
                    />
                  ))}
                  {pagedCollections.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-400 mb-4">
                        {collectionFilter === "all"
                          ? "You don't have any exhibits yet."
                          : `You don't have any ${collectionFilter} exhibits yet.`}
                      </p>
                    </div>
                  )}
                </div>
                {/* pagination controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-4 mt-10">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-[#D2B877] font-medium self-center">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Favorite Exhibits Tab Content */}
              <TabsContent value="favorite-collections">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteCollections.map((collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      isOwnedByUser={false}
                      fromPage="profile"
                      size="sm"
                    />
                  ))}
                  {favoriteCollections.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-400 mb-4">You haven't favorited any exhibits yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Favorite Artworks Tab Content */}
              <TabsContent value="favorite-artworks">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteArtworks.length > 0 ? (
                    favoriteArtworks.map((artwork) => (
                      <a
                        key={artwork.id}
                        href={`/artwork/${artwork.id}`}
                        className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B877] focus-visible:ring-offset-2 rounded-xl h-full group"
                        tabIndex={0}
                        style={{ textDecoration: 'none' }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            window.location.href = `/artwork/${artwork.id}`;
                          }
                        }}
                      >
                        <div className="flex flex-col h-full items-start">
                          <div className="relative w-full aspect-[1/1] overflow-hidden rounded-xl">
                            <img
                              src={artwork.imageUrl || "/placeholder.svg"}
                              alt={artwork.title}
                              className="object-cover w-full h-full transition-all duration-200 group-hover:shadow-xl group-hover:scale-[1.03]"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex items-center justify-between w-full mt-4 mb-2">
                            <h3 className="text-lg font-bold font-sans text-black dark:text-foreground leading-tight line-clamp-1" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{artwork.title}</h3>
                            <div className="flex items-center gap-1 ml-4">
                              <svg className="inline-block align-middle w-5 h-5 text-black dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                              <span className="text-black dark:text-foreground font-medium">{artworkLikeCounts[artwork.id] ?? 0}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-400 mb-4">You haven't favorited any artworks yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
