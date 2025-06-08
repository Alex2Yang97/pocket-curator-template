import React from "react"
import Image from "next/image"
import Link from "next/link"
import { LocationPinIcon, Calendar } from "./shared-icons"
import { Button } from "./button"

export interface CollectionShareCardProps {
  collection: {
    id: string
    title: string
    description?: string
    coverImageUrl?: string
    cover_image_url?: string
    curator?: { username: string, avatar_url?: string, id?: string } | string
    curator_id?: string
    location?: string
    event_date?: string
    date?: string
  }
  artworks: Array<{
    id: string
    title: string
    imageUrl?: string
    image_url?: string
  }>
}

export const CollectionShareCard: React.FC<CollectionShareCardProps> = ({ collection, artworks }) => {
  const coverImage = collection.coverImageUrl || collection.cover_image_url || artworks[0]?.imageUrl || artworks[0]?.image_url || "/uncategorized-collection.png"
  const curatorName = typeof collection.curator === "string" ? collection.curator : collection.curator?.username || "Unknown"
  const curatorAvatar = typeof collection.curator === "object" ? collection.curator.avatar_url : undefined
  const eventDate = collection.event_date || collection.date
  const previewArtworks = artworks.slice(0, 3)
  const extraArtworks = artworks.length > 3 ? artworks.length - 3 : 0

  return (
    <div className="max-w-xl w-full mx-auto rounded-3xl overflow-hidden flex flex-col items-center p-0 bg-[#232323]/80 border border-[#D2B877]/10 shadow-[0_2px_16px_rgba(35,35,35,0.06)] sm:max-w-lg md:max-w-xl">
      <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-t-3xl overflow-hidden">
        <Image src={coverImage} alt={collection.title} fill className="object-cover" />
        {/* Higher, softer gradient overlay for smoother transition */}
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-[#18181b]/80 via-[#18181b]/30 to-transparent pointer-events-none" />
      </div>
      <div className="w-full px-4 sm:px-6 py-5 flex flex-col items-center bg-[#18181b]/60 backdrop-blur rounded-b-3xl">
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-[#D2B877] mb-1 text-center tracking-wide drop-shadow-none leading-tight">{collection.title}</h1>
        {curatorName && (
          <div className="flex items-center gap-1 text-[#D2B877] mb-1">
            <span className="text-xs font-normal opacity-80">Curated by</span>
            <span className="font-semibold text-[#D2B877]">{curatorName}</span>
          </div>
        )}
        {collection.description && (
          <p className="text-[#E2E8F0] mb-2 text-center leading-snug text-sm max-w-lg font-normal" style={{lineHeight: '1.5'}}>{collection.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-[#D2B877] mb-3 items-center justify-center">
          {collection.location && (
            <span className="flex items-center gap-1"><LocationPinIcon className="w-4 h-4" /><span className="text-[#E2E8F0]">{collection.location}</span></span>
          )}
          {eventDate && (
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span className="text-[#E2E8F0]">{new Date(eventDate).toLocaleDateString()}</span></span>
          )}
        </div>
        <div className="flex items-center justify-center mb-4 relative min-h-[48px]">
          {previewArtworks.map((art, idx) => (
            <div
              key={art.id}
              className={`relative w-12 h-12 rounded-xl overflow-hidden border border-[#D2B877]/30 bg-[#18181b] ${idx !== 0 ? '-ml-3' : ''} shadow-sm`}
              style={{ zIndex: 10 - idx }}
            >
              <Image src={art.imageUrl || art.image_url || "/placeholder.svg"} alt={art.title} fill className="object-cover" />
              {idx === 2 && extraArtworks > 0 && (
                <div className="absolute inset-0 bg-[#18181b]/70 flex items-center justify-center text-[#D2B877] text-base font-semibold">
                  +{extraArtworks}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="w-full flex flex-col items-center gap-2 mt-2 max-w-xs mx-auto">
          <Link href={`/collections/${collection.id}`} className="w-full">
            <Button variant="primary" className="w-full min-w-[140px] max-w-xs px-4 py-2 text-sm">
              View Full Collection
            </Button>
          </Link>
          <Link href="/collections" className="w-full">
            <Button variant="secondary" className="w-full min-w-[140px] max-w-xs px-4 py-2 text-sm border border-[#D2B877] text-[#D2B877]">
              Explore More Curations
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 