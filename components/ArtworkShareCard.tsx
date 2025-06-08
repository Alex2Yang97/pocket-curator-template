import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArtistIcon, Calendar, ExhibitIcon } from "./shared-icons"
import { Button } from "./button"

export interface ArtworkShareCardProps {
  artwork: {
    id: string
    title?: string
    artist?: string
    artwork_date?: string
    date?: string
    image_url?: string
    imageUrl?: string
    curator?: { username: string, avatar_url?: string, id?: string } | string
    curator_id?: string
    collection?: { id: string, title: string }
    description?: string
    curator_notes?: string
  }
}

export const ArtworkShareCard: React.FC<ArtworkShareCardProps> = ({ artwork }) => {
  const imageUrl = artwork.image_url || artwork.imageUrl || "/placeholder.svg"
  const title = artwork.title || "Untitled"
  const artist = artwork.artist
  const artworkDate = artwork.artwork_date || artwork.date
  const curatorName = typeof artwork.curator === "string" ? artwork.curator : artwork.curator?.username
  const collection = artwork.collection
  const description = artwork.curator_notes || artwork.description

  return (
    <div className="max-w-xl w-full mx-auto rounded-3xl overflow-hidden flex flex-col items-center p-0 bg-[#232323]/80 border border-[#D2B877]/10 shadow-[0_2px_16px_rgba(35,35,35,0.06)]">
      <div className="relative w-full h-96 rounded-t-3xl overflow-hidden">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-[#18181b]/80 via-[#18181b]/30 to-transparent pointer-events-none" />
      </div>
      <div className="w-full px-4 sm:px-6 py-5 flex flex-col items-center bg-[#18181b]/60 backdrop-blur rounded-b-3xl">
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#D2B877] mb-1 text-center tracking-wide leading-tight line-clamp-2">{title}</h1>
        {curatorName && (
          <div className="flex items-center gap-1 text-[#D2B877] mb-1">
            <span className="text-xs font-normal opacity-80">Curated by</span>
            <span className="font-semibold text-[#D2B877]">{curatorName}</span>
          </div>
        )}
        <div className="flex flex-col gap-1 w-full items-center text-sm mb-2">
          {(artist || artworkDate) && (
            <div className="flex items-center gap-2 text-[#E2E8F0]">
              {artist && (
                <span className="flex items-center gap-1">
                  <ArtistIcon className="w-4 h-4 text-[#D2B877]" />
                  <span className="font-medium">{artist}</span>
                </span>
              )}
              {artist && artworkDate && <span className="text-[#D2B877]">·</span>}
              {artworkDate && (
                <span className="flex items-center gap-1 text-[#D2B877]">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[#E2E8F0]">{new Date(artworkDate).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          )}
        </div>
        {description && (
          <p className="text-[#E2E8F0] mt-2 mb-3 text-center leading-snug text-xs sm:text-sm max-w-lg font-normal line-clamp-3" style={{lineHeight: '1.5'}}>{description}</p>
        )}
        <div className="w-full flex flex-row items-center justify-center gap-3 mt-2">
          <div className="w-full flex flex-col items-center gap-2 mt-2 max-w-xs mx-auto">
            <Link href={`/artwork/${artwork.id}`} className="w-full">
              <Button variant="primary" className="w-full min-w-[140px] max-w-xs px-4 py-2 text-sm">
                View Artwork
              </Button>
            </Link>
            {collection && (
              <Link href={`/collections/${collection.id}`} className="w-full">
                <Button variant="secondary" className="w-full min-w-[140px] max-w-xs px-4 py-2 text-sm border border-[#D2B877] text-[#D2B877] flex items-center justify-center gap-2">
                  <ExhibitIcon className="w-4 h-4 mr-1" />
                  <span className="truncate">View Exhibit: {collection.title}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 