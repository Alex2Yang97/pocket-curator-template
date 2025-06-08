import { supabase } from "@/lib/utils"

// Create a new collection in Supabase
type CreateCollectionArgs = {
  name: string
  description?: string
  isPublic: boolean
  curator?: string
  location?: string
  date?: Date | null
  ownerId: string
}

export async function createCollection({
  name,
  description,
  isPublic,
  curator,
  location,
  date,
  ownerId,
}: CreateCollectionArgs) {
  const user = await getUserById(ownerId)
  if (user && !user.member) {
    const collectionCount = await getCollectionsCountByUserId(ownerId)
    if (collectionCount >= 2) {
      throw new Error("Non-member users can only create up to 2 collections.")
    }
  }

  const { data, error } = await supabase
    .from("collections")
    .insert([
      {
        title: name,
        description,
        is_public: isPublic,
        curator_id: ownerId,
        location,
        event_date: date ? date.toISOString().split("T")[0] : null,
      },
    ])
    .select()
    .single()
  if (error) throw error
  return data
}

// Add a new artwork in Supabase
type CreateArtworkArgs = {
  title: string
  artist?: string
  date?: string
  curatorNotes?: string
  imageUrl: string
  collectionId: string
  ownerId: string
}

export async function createArtwork({
  title,
  artist,
  date,
  curatorNotes,
  imageUrl,
  collectionId,
  ownerId,
}: CreateArtworkArgs) {
  const collection = await getCollectionById(collectionId)
  if (collection) {
    const curator = await getUserById(collection.curator_id)
    if (curator && !curator.member) {
      const artworkCount = await getArtworksCountByCollectionId(collectionId)
      if (artworkCount >= 8) {
        throw new Error(
          "Non-member users can only have up to 8 artworks in a collection.",
        )
      }
    }
  }

  console.log("Current user id:", ownerId)
  const { data, error } = await supabase
    .from("artworks")
    .insert([
      {
        title,
        artist,
        artwork_date: date,
        curator_notes: curatorNotes,
        image_url: imageUrl,
        collection_id: collectionId,
        curator_id: ownerId,
      },
    ])
    .select()
    .single()
  if (error) throw error
  return data
}

// Add a new user in Supabase
export type CreateUserArgs = {
  id: string
  username: string
  avatarUrl?: string
}

export async function createUser({ id, username, avatarUrl }: CreateUserArgs) {
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        id,
        username,
        avatar_url: avatarUrl || null,
      },
    ])
    .select()
    .single()
  if (error) throw error
  return data
}

// 通用获取collection封面方法
export async function getCollectionCover(collection: any): Promise<string> {
  // 1. 指定cover_artwork_id
  if (collection.cover_artwork_id) {
    try {
      const artwork = await getArtworkById(collection.cover_artwork_id)
      if (artwork?.image_url || artwork?.imageUrl) {
        return artwork.image_url || artwork.imageUrl
      }
    } catch {}
  }
  // 2. collection自带coverImageUrl/cover_image_url
  if (collection.coverImageUrl) return collection.coverImageUrl
  if (collection.cover_image_url) return collection.cover_image_url
  // 3. 用第一个artwork
  try {
    const artworks = await getArtworksByCollectionId(collection.id)
    if (artworks && artworks.length > 0 && (artworks[0].image_url || artworks[0].imageUrl)) {
      return artworks[0].image_url || artworks[0].imageUrl
    }
  } catch {}
  // 4. 默认图
  return "/uncategorized-collection.png"
}

// Fetch public collections with pagination, including cover, curator info, like count, and artwork count
export async function getPublicCollections({ page = 1, pageSize = 12, sort = "curate_date" } = {}) {
  // 1. Compose sort
  let orderField = "created_at"
  let ascending = false
  if (sort === "likes") {
    orderField = "likes_count"
    ascending = false
  }
  // 2. Range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // 3. Query collections with curator info, only public
  let query = supabase
    .from("collections")
    .select(`*, curator:curator_id (id, username, avatar_url)`, { count: "exact" })
    .eq("is_public", true)
    .order(orderField, { ascending })
    .range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  // 4. Get all collection ids
  const allCollectionIds = (data || []).map((c: any) => c.id)

  // 5. Fetch artwork counts for all collections
  let artworkCounts: Record<string, number> = {}
  if (allCollectionIds.length > 0) {
    const { data: artworksData, error: artworksError } = await supabase
      .from('artworks')
      .select('collection_id', { count: 'exact' })
      .in('collection_id', allCollectionIds)
    if (artworksError) throw artworksError
    artworkCounts = (artworksData || []).reduce((acc: any, curr: any) => {
      acc[curr.collection_id] = (acc[curr.collection_id] || 0) + 1
      return acc
    }, {})
  }

  // 6. Enrich collections with artworkCount, cover, curator
  const collectionsWithExtras = await Promise.all(
    (data || []).map(async (collection) => {
      const coverImage = await getCollectionCover(collection)
      return {
        ...collection,
        coverImageUrl: coverImage,
        curator: collection.curator, // { id, username, avatar_url }
        artworkCount: artworkCounts[collection.id] || 0,
      }
    })
  )
  // 7. Only keep collections with at least 1 artwork
  const filtered = collectionsWithExtras.filter(c => c.artworkCount > 0)
  return { collections: filtered, total: count }
}

// 用户collections也用同样cover逻辑
export async function getCollectionsForUser(userId: string, filter: "all" | "public" | "private" = "all") {
  let query = supabase
    .from("collections")
    .select(`*, curator:curator_id (id, username, avatar_url)`)
    .eq("curator_id", userId)
    .order("created_at", { ascending: false })
  if (filter === "public") {
    query = query.eq("is_public", true)
  } else if (filter === "private") {
    query = query.eq("is_public", false)
  }
  const { data, error } = await query
  if (error) throw error
  // Get all collection ids
  const collectionIds = (data || []).map((c: any) => c.id)

  // Fetch like counts for all collections
  let likeCounts: Record<string, number> = {}
  if (collectionIds.length > 0) {
    const { data: likesData, error: likesError } = await supabase
      .from('collections_likes')
      .select('collection_id', { count: 'exact' })
      .in('collection_id', collectionIds)
    if (likesError) throw likesError
    likeCounts = (likesData || []).reduce((acc: any, curr: any) => {
      acc[curr.collection_id] = (acc[curr.collection_id] || 0) + 1
      return acc
    }, {})
  }

  // Fetch artwork counts for all collections
  let artworkCounts: Record<string, number> = {}
  if (collectionIds.length > 0) {
    const { data: artworksData, error: artworksError } = await supabase
      .from('artworks')
      .select('collection_id', { count: 'exact' })
      .in('collection_id', collectionIds)
    if (artworksError) throw artworksError
    artworkCounts = (artworksData || []).reduce((acc: any, curr: any) => {
      acc[curr.collection_id] = (acc[curr.collection_id] || 0) + 1
      return acc
    }, {})
  }

  // 封面处理 + enrich with like/artwork/curator info
  const collectionsWithExtras = await Promise.all(
    (data || []).map(async (collection) => {
      const coverImage = await getCollectionCover(collection)
      return {
        ...collection,
        coverImageUrl: coverImage,
        curator: collection.curator, // { id, username, avatar_url }
        likeCount: likeCounts[collection.id] || 0,
        artworkCount: artworkCounts[collection.id] || 0,
      }
    })
  )
  return collectionsWithExtras
}

export async function uploadArtworkImage(file: File, userId: string): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed')
  }
  console.log("Uploading image for user:", userId)
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/${timestamp}_${Math.random().toString(36).slice(2)}.${fileExt}`
  const { data, error } = await supabase.storage.from('artworks').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('artworks').getPublicUrl(filePath)
  if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL for uploaded image')
  return publicUrlData.publicUrl
}

// Get all artworks for a user
export async function getArtworksForUser(userId: string) {
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("curator_id", userId)
  if (error) throw error
  return data
}

// Get artworks by collection id
export async function getArtworksByCollectionId(collectionId: string) {
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

// Get artworks by collection id with pagination
export async function getArtworksByCollectionIdPaginated(collectionId: string, { page = 1, pageSize = 12 } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from("artworks")
    .select("*", { count: "exact" })
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: false })
    .range(from, to)
  if (error) throw error
  return { artworks: data, total: count }
}

// Get a single artwork by id
export async function getArtworkById(artworkId: string) {
  const { data, error } = await supabase
    .from("artworks")
    .select(`*,
      collection:collection_id (id, title),
      curator:curator_id (id, username, avatar_url)
    `)
    .eq("id", artworkId)
    .single()
  if (error) throw error
  return data
}

// Like or unlike an artwork
export async function toggleLikeArtwork(artworkId: string, userId: string) {
  // Check if already liked
  const { data: existing, error: checkError } = await supabase
    .from('artworks_likes')
    .select('*')
    .eq('artwork_id', artworkId)
    .eq('user_id', userId)
    .single()
  if (checkError && checkError.code !== 'PGRST116') throw checkError

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('artworks_likes')
      .delete()
      .eq('artwork_id', artworkId)
      .eq('user_id', userId)
    if (error) throw error
    return { liked: false }
  } else {
    // Like
    const { error } = await supabase
      .from('artworks_likes')
      .insert({ artwork_id: artworkId, user_id: userId })
    if (error) throw error
    return { liked: true }
  }
}

// Get total like count for an artwork
export async function getArtworkLikeCount(artworkId: string): Promise<number> {
  const { count, error } = await supabase
    .from('artworks_likes')
    .select('*', { count: 'exact', head: true })
    .eq('artwork_id', artworkId)
  if (error) throw error
  return count || 0
}

// Check if a user liked an artwork
export async function getUserLikedArtwork(artworkId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('artworks_likes')
    .select('*')
    .eq('artwork_id', artworkId)
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Like or unlike a collection
export async function toggleLikeCollection(collectionId: string, userId: string) {
  // Check if already liked
  const { data: existing, error: checkError } = await supabase
    .from('collections_likes')
    .select('*')
    .eq('collection_id', collectionId)
    .eq('user_id', userId)
    .single()
  if (checkError && checkError.code !== 'PGRST116') throw checkError

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('collections_likes')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', userId)
    if (error) throw error
    return { liked: false }
  } else {
    // Like
    const { error } = await supabase
      .from('collections_likes')
      .insert({ collection_id: collectionId, user_id: userId })
    if (error) throw error
    return { liked: true }
  }
}

// Get total like count for a collection
export async function getCollectionLikeCount(collectionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('collections_likes')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', collectionId)
  if (error) throw error
  return count || 0
}

// Check if a user liked a collection
export async function getUserLikedCollection(collectionId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('collections_likes')
    .select('*')
    .eq('collection_id', collectionId)
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Get a single collection by id, including curator info
export async function getCollectionById(collectionId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select(`*, curator:curator_id (id, username, avatar_url)`)
    .eq('id', collectionId)
    .single()
  if (error) throw error
  return data
}

// Get collections liked by a user (favorite collections)
export async function getFavoriteCollectionsForUser(userId: string) {
  // Get liked collection ids
  const { data: likes, error: likesError } = await supabase
    .from('collections_likes')
    .select('collection_id')
    .eq('user_id', userId)
  if (likesError) throw likesError
  const collectionIds = (likes || []).map((like: any) => like.collection_id)
  if (collectionIds.length === 0) return []
  // Fetch collections with curator info
  const { data: collections, error: collectionsError } = await supabase
    .from('collections')
    .select('*, curator:curator_id (id, username, avatar_url)')
    .in('id', collectionIds)
  if (collectionsError) throw collectionsError
  // Fetch like counts for all collections
  let likeCounts: Record<string, number> = {}
  if (collectionIds.length > 0) {
    const { data: likesData, error: likesError2 } = await supabase
      .from('collections_likes')
      .select('collection_id', { count: 'exact' })
      .in('collection_id', collectionIds)
    if (likesError2) throw likesError2
    likeCounts = (likesData || []).reduce((acc: any, curr: any) => {
      acc[curr.collection_id] = (acc[curr.collection_id] || 0) + 1
      return acc
    }, {})
  }
  // Fetch artwork counts for all collections
  let artworkCounts: Record<string, number> = {}
  if (collectionIds.length > 0) {
    const { data: artworksData, error: artworksError } = await supabase
      .from('artworks')
      .select('collection_id', { count: 'exact' })
      .in('collection_id', collectionIds)
    if (artworksError) throw artworksError
    artworkCounts = (artworksData || []).reduce((acc: any, curr: any) => {
      acc[curr.collection_id] = (acc[curr.collection_id] || 0) + 1
      return acc
    }, {})
  }
  // Add cover image and enrich with like/artwork/curator info
  const collectionsWithExtras = await Promise.all(
    (collections || []).map(async (collection) => {
      const coverImage = await getCollectionCover(collection)
      return {
        ...collection,
        coverImageUrl: coverImage,
        curator: collection.curator, // { id, username, avatar_url }
        likeCount: likeCounts[collection.id] || 0,
        artworkCount: artworkCounts[collection.id] || 0,
      }
    })
  )
  return collectionsWithExtras
}

// Get artworks liked by a user (favorite artworks)
export async function getFavoriteArtworksForUser(userId: string) {
  // Get liked artwork ids
  const { data: likes, error: likesError } = await supabase
    .from('artworks_likes')
    .select('artwork_id')
    .eq('user_id', userId)
  if (likesError) throw likesError
  const artworkIds = (likes || []).map((like: any) => like.artwork_id)
  if (artworkIds.length === 0) return []
  // Fetch artworks
  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select('*')
    .in('id', artworkIds)
  if (artworksError) throw artworksError
  return artworks
}

// 获取点赞数最多的前N个公开collection
export async function getTopCollectionsByLikes(topN = 5) {
  // 查出所有公开collection及其点赞数和curator信息
  const { data: collections, error } = await supabase
    .from('collections')
    .select('*, curator:curator_id (id, username, avatar_url), likes:collections_likes(count)')
    .eq('is_public', true)
  if (error) throw error
  // 计算点赞数
  const collectionsWithLikes = (collections || []).map((c: any) => ({
    ...c,
    likesCount: Array.isArray(c.likes) ? c.likes.length : 0,
  }))
  // 按点赞数排序，取前N
  const topCollections = collectionsWithLikes
    .sort((a, b) => b.likesCount - a.likesCount)
    .slice(0, topN)

  // 查artwork数量
  const collectionIds = topCollections.map((c: any) => c.id)
  let artworkCounts: Record<string, number> = {}
  if (collectionIds.length > 0) {
    const { data: artworksData, error: artworksError } = await supabase
      .from('artworks')
      .select('collection_id', { count: 'exact' })
      .in('collection_id', collectionIds)
    if (artworksError) throw artworksError
    artworkCounts = (artworksData || []).reduce((acc: any, curr: any) => {
      acc[curr.collection_id] = (acc[curr.collection_id] || 0) + 1
      return acc
    }, {})
  }

  // 加coverImageUrl、curator、likeCount、artworkCount
  const withCover = await Promise.all(
    topCollections.map(async (collection) => {
      const coverImage = await getCollectionCover(collection)
      return {
        ...collection,
        coverImageUrl: coverImage,
        curator: collection.curator, // { id, username, avatar_url }
        likeCount: collection.likesCount,
        artworkCount: artworkCounts[collection.id] || 0,
      }
    })
  )
  return withCover
}

// 获取用户公开profile信息
export async function getUserProfile(userId: string) {
  // 查自建 users
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, username, avatar_url, member")
    .eq("id", userId)
    .single()
  if (userError) throw userError

  // 查 public_user_info
  const { data: authData, error: authError } = await supabase
    .from("public_user_info")
    .select("id, email, created_at, last_sign_in_at, phone")
    .eq("id", userId)
    .single()
  if (authError) throw authError

  return { ...userData, ...authData }
}

// Update an artwork in Supabase
export async function updateArtwork(artworkId: string, updateFields: Partial<{
  title: string
  artist: string
  artwork_date: string | null | undefined
  curator_notes: string
  image_url: string
  collection_id: string
}>) {
  const { data, error } = await supabase
    .from("artworks")
    .update(updateFields)
    .eq("id", artworkId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Delete an artwork in Supabase
export async function deleteArtwork(artworkId: string) {
  // 1. fetch the image_url of the artwork
  const { data: artwork, error: fetchError } = await supabase
    .from("artworks")
    .select("image_url")
    .eq("id", artworkId)
    .single()
  if (fetchError) throw fetchError

  // 2. delete the image (if any)
  if (artwork?.image_url) {
    const filePath = getStorageFilePathFromUrl(artwork.image_url)
    if (filePath) {
      const { error: removeError } = await supabase.storage.from('artworks').remove([filePath])
      if (removeError) console.warn('Failed to remove image from storage:', removeError)
    }
  }

  // 3. delete the database record
  const { error } = await supabase
    .from("artworks")
    .delete()
    .eq("id", artworkId)
  if (error) throw error
  return true
}

// Delete a collection and all its artworks in Supabase
export async function deleteCollectionAndArtworks(collectionId: string) {
  // 1. fetch the image_url of all artworks in the collection
  const { data: artworks, error: fetchError } = await supabase
    .from("artworks")
    .select("image_url")
    .eq("collection_id", collectionId)
  if (fetchError) throw fetchError

  // 2. delete the images (if any)
  const filePaths = (artworks || [])
    .map((a: any) => getStorageFilePathFromUrl(a.image_url))
    .filter((p): p is string => Boolean(p))
  if (filePaths.length > 0) {
    const { error: removeError } = await supabase.storage.from('artworks').remove(filePaths)
    if (removeError) console.warn('Failed to remove images from storage:', removeError)
  }

  // 3. delete all artworks
  const { error: artworksError } = await supabase
    .from("artworks")
    .delete()
    .eq("collection_id", collectionId)
  if (artworksError) throw artworksError

  // 4. delete all likes
  const { error: likesError } = await supabase
    .from("collections_likes")
    .delete()
    .eq("collection_id", collectionId)
  if (likesError) throw likesError

  // 5. delete the collection itself
  const { error: collectionError } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
  if (collectionError) throw collectionError

  return true
}

// helper function: extract bucket path from public url
function getStorageFilePathFromUrl(publicUrl: string): string | null {
  // example: /storage/v1/object/public/artworks/userid/xxx.webp
  // only keep the part after artworks/
  const match = publicUrl.match(/artworks\/(.+)$/)
  return match ? match[1] : null
}

// Update a collection in Supabase
export async function updateCollection(collectionId: string, updateFields: Partial<{
  title: string
  description: string
  is_public: boolean
  location: string
  event_date: string | null | undefined
}>) {
  const { data, error } = await supabase
    .from("collections")
    .update(updateFields)
    .eq("id", collectionId)
    .select()
    .single()
  if (error) throw error
  return data
}

// get the latest collection created by the user
export async function getLatestCollectionForUser(userId: string) {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("curator_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== "PGRST116") throw error
  return data
}

/**
 * Look up a user's email by their username from the users table (joined with auth.users)
 * Returns the email if found, otherwise null.
 */
export async function getEmailByUsername(username: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', username)
    .single();
  if (error || !data) return null;
  // For security reasons, we don't return email from this function
  return null;
}

// Get user by ID
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, member")
    .eq("id", userId)
    .single()
  if (error) {
    if (error.code === "PGRST116") return null // user not found is ok
    throw error
  }
  return data
}

// Get collections count for a user
export async function getCollectionsCountByUserId(
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("collections")
    .select("id", { count: "exact", head: true })
    .eq("curator_id", userId)

  if (error) {
    console.error("Error fetching collections count:", error)
    return 0
  }

  return count || 0
}

// Get artworks count for a collection
export async function getArtworksCountByCollectionId(
  collectionId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("artworks")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", collectionId)

  if (error) {
    console.error("Error fetching artworks count:", error)
    return 0
  }

  return count || 0
}

// Get trending curators with their collection counts and like counts
export async function getTrendingCurators(limit = 7) {
  // Get users who have created public collections with total likes
  const { data, error } = await supabase
    .from("collections")
    .select(`
      curator_id,
      curator:curator_id (id, username, avatar_url),
      likes_count
    `)
    .eq("is_public", true)
    .not("curator_id", "is", null)

  if (error) throw error

  // Group by curator and calculate total likes
  const curatorStats: Record<string, { curator: any; totalLikes: number; collectionCount: number }> = {}
  
  for (const collection of data || []) {
    if (!collection.curator) continue
    
    const curatorId = collection.curator_id
    if (!curatorStats[curatorId]) {
      curatorStats[curatorId] = {
        curator: collection.curator,
        totalLikes: 0,
        collectionCount: 0
      }
    }
    
    curatorStats[curatorId].totalLikes += collection.likes_count || 0
    curatorStats[curatorId].collectionCount += 1
  }

  // Convert to array and sort by total likes, then by collection count
  const trendingCurators = Object.values(curatorStats)
    .sort((a, b) => {
      if (b.totalLikes !== a.totalLikes) {
        return b.totalLikes - a.totalLikes
      }
      return b.collectionCount - a.collectionCount
    })
    .slice(0, limit)
    .map(stats => ({
      id: stats.curator.id,
      username: stats.curator.username,
      avatarUrl: stats.curator.avatar_url,
      totalLikes: stats.totalLikes,
      collectionCount: stats.collectionCount,
      isMockData: false
    }))

  return trendingCurators
} 