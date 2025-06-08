"use client"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/button"
import { MerchandisePreview } from "@/components/merchandise/merchandise-preview"
import { ProductList } from "@/components/merchandise/product-list"
import { useEffect, useState } from "react"
import { getArtworkById } from "@/lib/supabase-data"

export default function ArtworkMerchandisePage() {
  const params = useParams()
  const artworkId = params.id as string

  const [artwork, setArtwork] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getArtworkById(artworkId)
      .then((data) => setArtwork(data))
      .catch(() => setArtwork(null))
      .finally(() => setLoading(false))
  }, [artworkId])

  const curatorId = artwork?.curator_id
  const curatorName = artwork?.curator?.username || "Unknown Curator"
  const collectionId = artwork?.collection_id
  const collectionTitle = artwork?.collection?.title || "Unknown Collection"
  const title = artwork?.title || "Untitled"

  return (
    <div className="flex min-h-screen flex-col bg-background text-[#222] dark:text-foreground">
      <div className="flex-grow flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 md:px-8">
          {/* nav bar: curator / exhibit / artwork / merchandise */}
          <div className="mb-8 flex items-center gap-2 text-base font-medium font-sans text-[#222] dark:text-foreground">
            {curatorId && curatorName && (
              <Link
                href={`/profile/${curatorId}`}
                className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer"
                tabIndex={0}
              >
                {curatorName}
              </Link>
            )}
            <span className="mx-1 text-muted-foreground">/</span>
            {collectionId && collectionTitle && (
              <Link
                href={`/collections/${collectionId}`}
                className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer"
                tabIndex={0}
              >
                {collectionTitle}
              </Link>
            )}
            <span className="mx-1 text-muted-foreground">/</span>
            <Link
              href={`/artwork/${artworkId}`}
              className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer"
              tabIndex={0}
            >
              {title}
            </Link>
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="font-semibold text-[#222] dark:text-foreground">Merchandise</span>
          </div>

          {/* main content: merchandise preview */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-12 max-w-[1800px] mx-auto">
            {/* merchandise preview */}
            <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-8">
              <Card className="w-full max-w-2xl mx-auto bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[40vh] w-full">
                  <MerchandisePreview />
                </CardContent>
              </Card>
              <div className="w-full max-w-2xl mx-auto">
                <ProductList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 