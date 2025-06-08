import React from "react"
import { CollectionShareCard } from "@/components/CollectionShareCard"
import { getCollectionById, getArtworksByCollectionIdPaginated } from "@/lib/supabase-data"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params
  const collection = await getCollectionById(id)
  const { artworks } = await getArtworksByCollectionIdPaginated(id, { page: 1, pageSize: 5 })
  const coverImage = collection?.coverImageUrl || collection?.cover_image_url || artworks[0]?.imageUrl || artworks[0]?.image_url || "/uncategorized-collection.png"
  const curatorName = typeof collection?.curator === "string" ? collection.curator : collection?.curator?.username || "Unknown"
  return {
    title: `${collection?.title || "Collection"} | Curated by ${curatorName}`,
    description: collection?.description || "Discover curated art collections.",
    openGraph: {
      title: `${collection?.title || "Collection"} | Curated by ${curatorName}`,
      description: collection?.description || "Discover curated art collections.",
      images: [coverImage],
      url: `https://yourapp.com/collections/${id}/share`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection?.title || "Collection"} | Curated by ${curatorName}`,
      description: collection?.description || "Discover curated art collections.",
      images: [coverImage],
    },
  }
}

export default async function CollectionSharePage({ params }: { params: { id: string } }) {
  const { id } = await params
  const collection = await getCollectionById(id)
  const { artworks } = await getArtworksByCollectionIdPaginated(id, { page: 1, pageSize: 5 })

  if (!collection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">Collection not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <CollectionShareCard collection={collection} artworks={artworks} />
    </div>
  )
} 