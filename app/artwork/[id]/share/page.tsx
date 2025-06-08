import React from "react"
import { ArtworkShareCard } from "@/components/ArtworkShareCard"
import { getArtworkById } from "@/lib/supabase-data"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params
  const artwork = await getArtworkById(id)
  const imageUrl = artwork?.image_url || artwork?.imageUrl || "/placeholder.svg"
  const title = artwork?.title || "Artwork"
  const artist = artwork?.artist ? `by ${artwork.artist}` : ""
  return {
    title: `${title} ${artist}`.trim(),
    description: artwork?.curator_notes || artwork?.description || "Discover curated artworks.",
    openGraph: {
      title: `${title} ${artist}`.trim(),
      description: artwork?.curator_notes || artwork?.description || "Discover curated artworks.",
      images: [imageUrl],
      url: `https://yourapp.com/artwork/${id}/share`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} ${artist}`.trim(),
      description: artwork?.curator_notes || artwork?.description || "Discover curated artworks.",
      images: [imageUrl],
    },
  }
}

export default async function ArtworkSharePage({ params }: { params: { id: string } }) {
  const { id } = await params
  const artwork = await getArtworkById(id)

  if (!artwork) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">Artwork not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <ArtworkShareCard artwork={artwork} />
    </div>
  )
} 