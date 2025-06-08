export type Artwork = {
  id: string
  title: string
  artist: string
  imageUrl: string
  venue?: string
  date?: string
  description?: string
  aiSummary?: string
  tags: string[]
  collectionIds: string[]
  createdAt: string
  ownerId?: string
}

export type Collection = {
  id: string
  name: string
  description?: string
  coverImageUrl?: string
  artworkIds: string[]
  isPublic: boolean
  createdAt: string
  ownerId?: string
  curator?: string
  location?: string
  date?: string
} 