"use client"

import { useAppContext } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

export default function SharedCollectionPage() {
  const params = useParams()
  const collectionId = params.id as string

  const { collections, getArtworksByCollectionId } = useAppContext()
  const collection = collections.find((c) => c.id === collectionId && c.isPublic)
  const artworks = collection ? getArtworksByCollectionId(collectionId) : []

  if (!collection) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
          <p className="text-muted-foreground mb-6">This collection may not exist or is not shared publicly.</p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M9 3h6v4l-6-4Z" />
              <path d="M4 11h16" />
              <path d="M5 11v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
              <path d="M4 11V7a1 1 0 0 1 1-1h2" />
              <path d="M20 11V7a1 1 0 0 0-1-1h-2" />
            </svg>
            <span className="font-bold">Pocket Curator</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          {collection.description && <p className="text-muted-foreground mt-2">{collection.description}</p>}
        </div>

        {artworks.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No artworks in this collection</h2>
            <p className="text-muted-foreground">This collection is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="border rounded-lg overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image
                    src={artwork.imageUrl || "/placeholder.svg"}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{artwork.title}</h3>
                  <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                  {artwork.venue && <p className="text-sm text-muted-foreground mt-1">{artwork.venue}</p>}
                  {artwork.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {artwork.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">Shared via Pocket Curator</div>
      </footer>
    </div>
  )
}
