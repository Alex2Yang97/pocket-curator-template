"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Loader2, Heart, Star } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CollectionCard, ArtworkCard } from "@/components/collection-card"
import { getUserProfile, getCollectionsForUser, getFavoriteCollectionsForUser, getFavoriteArtworksForUser, getArtworkLikeCount } from "@/lib/supabase-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"

export default function OtherProfilePage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const userId = params.userId

  const [profile, setProfile] = useState<any>(null)
  const [collections, setCollections] = useState<any[]>([])
  const [favoriteCollections, setFavoriteCollections] = useState<any[]>([])
  const [favoriteArtworks, setFavoriteArtworks] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("collections")
  const [isLoading, setIsLoading] = useState(true)
  const { user: currentUser } = useAuth()
  const isMobile = useIsMobile()
  const [artworkLikeCounts, setArtworkLikeCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!userId) return
    setIsLoading(true)
    Promise.all([
      getUserProfile(userId),
      getCollectionsForUser(userId, "public"),
      getFavoriteCollectionsForUser(userId),
      getFavoriteArtworksForUser(userId),
    ])
      .then(([profile, collections, favCollections, favArtworks]) => {
        setProfile(profile)
        setCollections(collections)
        setFavoriteCollections(favCollections)
        setFavoriteArtworks(favArtworks)
      })
      .catch(() => {
        setProfile(null)
        setCollections([])
        setFavoriteCollections([])
        setFavoriteArtworks([])
      })
      .finally(() => setIsLoading(false))
  }, [userId])

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="relative z-10 flex-grow">
          <Header />
          <main className="flex-1 container py-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D2B877]" />
          </main>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="relative z-10 flex-grow">
          <Header />
          <main className="flex-1 container py-8 flex items-center justify-center">
            <div className="text-center text-gray-300">User not found or profile is private.</div>
          </main>
        </div>
      </div>
    )
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
                <AvatarImage src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`} alt={profile.username} />
                <AvatarFallback className="bg-[#1F2636] text-[#D2B877] text-2xl">
                  {profile.username
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-[#222] dark:text-[#D2B877] drop-shadow-sm">{profile.username}</h1>
                {profile.email && currentUser && currentUser.id === userId && (
                  <p className="text-muted-foreground mt-1">{profile.email}</p>
                )}
                {profile.created_at && (
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Member since {format(new Date(profile.created_at), "MMMM d, yyyy")}
                  </p>
                )}
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
              {/* Collections Tab Content - only show public exhibits, no filter, no upload card */}
              <TabsContent value="collections">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.length > 0 ? (
                    collections.map((collection) => (
                      <CollectionCard
                        key={collection.id}
                        collection={collection}
                        isOwnedByUser={false}
                        fromPage="profile"
                        size="sm"
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-400 mb-4">This user has no public exhibits yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Favorite Exhibits Tab Content */}
              <TabsContent value="favorite-collections">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteCollections.length > 0 ? (
                    favoriteCollections.map((collection) => (
                      <CollectionCard
                        key={collection.id}
                        collection={collection}
                        isOwnedByUser={false}
                        fromPage="profile"
                        size="sm"
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-400 mb-4">This user hasn't favorited any exhibits yet.</p>
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
                              src={artwork.imageUrl || artwork.image_url || "/placeholder.svg"}
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
                      <p className="text-gray-400 mb-4">This user hasn't favorited any artworks yet.</p>
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