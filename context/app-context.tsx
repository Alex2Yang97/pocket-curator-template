"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Artwork, type Collection } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "@/context/auth-context"

type AppContextType = {
  artworks: Artwork[]
  collections: Collection[]
  addArtwork: (artwork: Omit<Artwork, "id" | "createdAt" | "ownerId">) => string
  updateArtwork: (artwork: Artwork) => void
  deleteArtwork: (id: string) => void
  addCollection: (collection: Omit<Collection, "id" | "createdAt" | "ownerId">) => string
  updateCollection: (collection: Collection) => void
  deleteCollection: (id: string) => void
  addArtworkToCollection: (artworkId: string, collectionId: string) => void
  removeArtworkFromCollection: (artworkId: string, collectionId: string) => void
  getArtworksByCollectionId: (collectionId: string) => Artwork[]
  getCollectionsByArtworkId: (artworkId: string) => Collection[]
  getPublicCollections: () => Collection[]
  defaultCollectionId: string
}

// Default collection ID - using a constant to ensure consistency
const DEFAULT_COLLECTION_ID = "default-collection"

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [defaultCollectionId, setDefaultCollectionId] = useState<string>(DEFAULT_COLLECTION_ID)
  const { user } = useAuth()

  // Initialize data
  useEffect(() => {
    // Load artworks from localStorage
    const storedArtworks = localStorage.getItem("pocketCuratorAllArtworks")
    if (storedArtworks) {
      try {
        const artworksObj = JSON.parse(storedArtworks)
        setArtworks(Object.values(artworksObj))
      } catch (error) {
        console.error("Failed to parse stored artworks:", error)
        setArtworks([])
      }
    } else {
      setArtworks([])
    }

    // Load collections from localStorage
    const storedCollections = localStorage.getItem("pocketCuratorAllCollections")
    if (storedCollections) {
      try {
        const collectionsObj = JSON.parse(storedCollections)
        setCollections(Object.values(collectionsObj))
      } catch (error) {
        console.error("Failed to parse stored collections:", error)
        setCollections([])
      }
    } else {
      setCollections([])
    }

    // Set default collection ID for the current user
    if (user) {
      setDefaultCollectionId(`${DEFAULT_COLLECTION_ID}-${user.id}`)
    }
  }, [user])

  const addArtwork = (artworkData: Omit<Artwork, "id" | "createdAt" | "ownerId">) => {
    const id = uuidv4()
    const ownerId = user?.id || "anonymous"

    const newArtwork: Artwork = {
      ...artworkData,
      id,
      createdAt: new Date().toISOString(),
      ownerId,
    }

    // If no collections specified, add to default collection
    if (newArtwork.collectionIds.length === 0) {
      const userDefaultCollectionId = `${DEFAULT_COLLECTION_ID}-${ownerId}`
      newArtwork.collectionIds = [userDefaultCollectionId]

      // Also update the default collection
      setCollections((prev) =>
        prev.map((col) => (col.id === userDefaultCollectionId ? { ...col, artworkIds: [...col.artworkIds, id] } : col)),
      )

      // Update in localStorage
      const storedCollections = localStorage.getItem("pocketCuratorAllCollections")
      if (storedCollections) {
        try {
          const collectionsObj = JSON.parse(storedCollections)
          if (collectionsObj[userDefaultCollectionId]) {
            collectionsObj[userDefaultCollectionId].artworkIds.push(id)
            localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collectionsObj))
          }
        } catch (error) {
          console.error("Failed to update collections in localStorage:", error)
        }
      }
    }

    setArtworks((prev) => [...prev, newArtwork])

    // Update in localStorage
    const storedArtworks = localStorage.getItem("pocketCuratorAllArtworks")
    if (storedArtworks) {
      try {
        const artworksObj = JSON.parse(storedArtworks)
        artworksObj[id] = newArtwork
        localStorage.setItem("pocketCuratorAllArtworks", JSON.stringify(artworksObj))
      } catch (error) {
        console.error("Failed to update artworks in localStorage:", error)
      }
    } else {
      const artworksObj: Record<string, Artwork> = { [id]: newArtwork }
      localStorage.setItem("pocketCuratorAllArtworks", JSON.stringify(artworksObj))
    }

    return id
  }

  const updateArtwork = (artwork: Artwork) => {
    // If artwork has no collections, add it to the default collection
    if (artwork.collectionIds.length === 0 && user) {
      const userDefaultCollectionId = `${DEFAULT_COLLECTION_ID}-${user.id}`
      artwork.collectionIds = [userDefaultCollectionId]

      // Update default collection to include this artwork
      setCollections((prev) =>
        prev.map((col) =>
          col.id === userDefaultCollectionId
            ? { ...col, artworkIds: [...col.artworkIds.filter((id) => id !== artwork.id), artwork.id] }
            : col,
        ),
      )

      // Update in localStorage
      const storedCollections = localStorage.getItem("pocketCuratorAllCollections")
      if (storedCollections) {
        try {
          const collectionsObj = JSON.parse(storedCollections)
          if (collectionsObj[userDefaultCollectionId]) {
            collectionsObj[userDefaultCollectionId].artworkIds = [
              ...collectionsObj[userDefaultCollectionId].artworkIds.filter((id: string) => id !== artwork.id),
              artwork.id,
            ]
            localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collectionsObj))
          }
        } catch (error) {
          console.error("Failed to update collections in localStorage:", error)
        }
      }
    }

    setArtworks((prev) => prev.map((art) => (art.id === artwork.id ? artwork : art)))

    // Update in localStorage
    const storedArtworks = localStorage.getItem("pocketCuratorAllArtworks")
    if (storedArtworks) {
      try {
        const artworksObj = JSON.parse(storedArtworks)
        artworksObj[artwork.id] = artwork
        localStorage.setItem("pocketCuratorAllArtworks", JSON.stringify(artworksObj))
      } catch (error) {
        console.error("Failed to update artworks in localStorage:", error)
      }
    }
  }

  const deleteArtwork = (id: string) => {
    setArtworks((prev) => prev.filter((art) => art.id !== id))

    // Remove artwork from all collections
    setCollections((prev) =>
      prev.map((col) => ({
        ...col,
        artworkIds: col.artworkIds.filter((artId) => artId !== id),
      })),
    )

    // Update in localStorage
    const storedArtworks = localStorage.getItem("pocketCuratorAllArtworks")
    if (storedArtworks) {
      try {
        const artworksObj = JSON.parse(storedArtworks)
        delete artworksObj[id]
        localStorage.setItem("pocketCuratorAllArtworks", JSON.stringify(artworksObj))
      } catch (error) {
        console.error("Failed to update artworks in localStorage:", error)
      }
    }

    const storedCollections = localStorage.getItem("pocketCuratorAllCollections")
    if (storedCollections) {
      try {
        const collectionsObj = JSON.parse(storedCollections)
        Object.keys(collectionsObj).forEach((colId) => {
          collectionsObj[colId].artworkIds = collectionsObj[colId].artworkIds.filter((artId: string) => artId !== id)
        })
        localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collectionsObj))
      } catch (error) {
        console.error("Failed to update collections in localStorage:", error)
      }
    }
  }

  const addCollection = (collectionData: Omit<Collection, "id" | "createdAt" | "ownerId">) => {
    const id = uuidv4()
    const ownerId = user?.id || "anonymous"

    const newCollection: Collection = {
      ...collectionData,
      id,
      createdAt: new Date().toISOString(),
      ownerId,
    }

    setCollections((prev) => [...prev, newCollection])

    // Update in localStorage
    const storedCollections = localStorage.getItem("pocketCuratorAllCollections")
    if (storedCollections) {
      try {
        const collectionsObj = JSON.parse(storedCollections)
        collectionsObj[id] = newCollection
        localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collectionsObj))
      } catch (error) {
        console.error("Failed to update collections in localStorage:", error)
      }
    } else {
      const collectionsObj: Record<string, Collection> = { [id]: newCollection }
      localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collectionsObj))
    }

    // Add to user's collections if logged in
    if (user) {
      const storedUsers = localStorage.getItem("pocketCuratorUsers")
      if (storedUsers) {
        try {
          const usersObj = JSON.parse(storedUsers)
          if (usersObj[user.id]) {
            if (!usersObj[user.id].collections) {
              usersObj[user.id].collections = [id]
            } else {
              usersObj[user.id].collections.push(id)
            }
            localStorage.setItem("pocketCuratorUsers", JSON.stringify(usersObj))
          }
        } catch (error) {
          console.error("Failed to update user collections in localStorage:", error)
        }
      }
    }

    return id
  }

  const updateCollection = (collection: Collection) => {
    // Don't allow renaming or deleting the default collection
    if (collection.id.startsWith(DEFAULT_COLLECTION_ID)) {
      collection.name = "Uncategorized"
      collection.description = "Artworks that haven't been added to any collection"
    }

    setCollections((prev) => prev.map((col) => (col.id === collection.id ? collection : col)))

    // Update in localStorage
    const storedCollections = localStorage.getItem("pocketCuratorAllCollections")
    if (storedCollections) {
      try {
        const collectionsObj = JSON.parse(storedCollections)
        collectionsObj[collection.id] = collection
        localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collectionsObj))
      } catch (error) {
        console.error("Failed to update collections in localStorage:", error)
      }
    }
  }

  const deleteCollection = (id: string) => {
    // Don't allow deleting the default collection
    if (id.startsWith(DEFAULT_COLLECTION_ID)) {
      return
    }

    // Get artworks in this collection
    const collectionArtworks = artworks.filter((art) => art.collectionIds.includes(id))

    // For each artwork, remove this collection
    const updatedArtworks = artworks.map((art) => {
      if (art.collectionIds.includes(id)) {
        const updatedCollectionIds = art.collectionIds.filter((colId) => colId !== id)

        // If no collections left and user is logged in, add to default collection
        if (updatedCollectionIds.length === 0 && user) {
          const userDefaultCollectionId = `${DEFAULT_COLLECTION_ID}-${user.id}`
          return {
            ...art,
            collectionIds: [userDefaultCollectionId],
          }
        }

        return {
          ...art,
          collectionIds: updatedCollectionIds,
        }
      }
      return art
    })

    // Update default collection to include artworks that now have no collections
    const artworksToAddToDefault = user
      ? collectionArtworks
          .filter((art) => art.collectionIds.length === 1 && art.collectionIds[0] === id)
          .map((art) => art.id)
      : []

    setArtworks(updatedArtworks)

    setCollections((prev) => {
      const filteredCollections = prev.filter((col) => col.id !== id)

      // Update default collection if user is logged in
      if (user) {
        const userDefaultCollectionId = `${DEFAULT_COLLECTION_ID}-${user.id}`
        return filteredCollections.map((col) => {
          if (col.id === userDefaultCollectionId && artworksToAddToDefault.length > 0) {
            return {
              ...col,
              artworkIds: [...new Set([...col.artworkIds, ...artworksToAddToDefault])],
            }
          }
          return col
        })
      }

      return filteredCollections
    })

    // Update in localStorage
    const storedCollections = localStorage.getItem("pocketCuratorAllCollections")
    if (storedCollections) {
      try {
        const collectionsObj = JSON.parse(storedCollections)
        delete collectionsObj[id]

        // Update default collection if user is logged in
        if (user && artworksToAddToDefault.length > 0) {
          const userDefaultCollectionId = `${DEFAULT_COLLECTION_ID}-${user.id}`
          if (collectionsObj[userDefaultCollectionId]) {
            collectionsObj[userDefaultCollectionId].artworkIds = [
              ...new Set([...collectionsObj[userDefaultCollectionId].artworkIds, ...artworksToAddToDefault]),
            ]
          }
        }

        localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collectionsObj))
      } catch (error) {
        console.error("Failed to update collections in localStorage:", error)
      }
    }

    // Update artworks in localStorage
    const storedArtworks = localStorage.getItem("pocketCuratorAllArtworks")
    if (storedArtworks) {
      try {
        const artworksObj = JSON.parse(storedArtworks)
        updatedArtworks.forEach((art) => {
          if (artworksObj[art.id]) {
            artworksObj[art.id] = art
          }
        })
        localStorage.setItem("pocketCuratorAllArtworks", JSON.stringify(artworksObj))
      } catch (error) {
        console.error("Failed to update artworks in localStorage:", error)
      }
    }

    // Remove from user's collections if logged in
    if (user) {
      const storedUsers = localStorage.getItem("pocketCuratorUsers")
      if (storedUsers) {
        try {
          const usersObj = JSON.parse(storedUsers)
          if (usersObj[user.id] && usersObj[user.id].collections) {
            usersObj[user.id].collections = usersObj[user.id].collections.filter((colId: string) => colId !== id)
            localStorage.setItem("pocketCuratorUsers", JSON.stringify(usersObj))
          }
        } catch (error) {
          console.error("Failed to update user collections in localStorage:", error)
        }
      }
    }
  }

  const addArtworkToCollection = (artworkId: string, collectionId: string) => {
    // Add collection to artwork
    setArtworks((prev) =>
      prev.map((art) =>
        art.id === artworkId && !art.collectionIds.includes(collectionId)
          ? { ...art, collectionIds: [...art.collectionIds, collectionId] }
          : art,
      ),
    )

    // Add artwork to collection
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId && !col.artworkIds.includes(artworkId)
          ? { ...col, artworkIds: [...col.artworkIds, artworkId] }
          : col,
      ),
    )

    // If artwork is being added to a non-default collection and user is logged in, check if it should be removed from default
    if (!collectionId.startsWith(DEFAULT_COLLECTION_ID) && user) {
      const userDefaultCollectionId = `${DEFAULT_COLLECTION_ID}-${user.id}`
      const artwork = artworks.find((art) => art.id === artworkId)

      // If artwork is only in the default collection, remove it from default when adding to another
      if (artwork && artwork.collectionIds.length === 1 && artwork.collectionIds[0] === userDefaultCollectionId) {
        removeArtworkFromCollection(artworkId, userDefaultCollectionId)
      }
    }

    // Update in localStorage
    const storedArtworks = localStorage.getItem("pocketCuratorAllArtworks")
    if (storedArtworks) {
      try {
        const artworksObj = JSON.parse(storedArtworks)
        if (artworksObj[artworkId]) {
          if (!artworksObj[artworkId].collectionIds.includes(collectionId)) {
            artworksObj[artworkId].collectionIds.push(collectionId)
          }
          localStorage.setItem("pocketCuratorAllArtworks", JSON.stringify(artworksObj))
        }
      } catch (error) {
        console.error("Failed to update artworks in localStorage:", error)
      }
    }

    const storedCollections = localStorage.getItem("pocketCuratorAllCollections")
    if (storedCollections) {
      try {
        const collectionsObj = JSON.parse(storedCollections)
        if (collectionsObj[collectionId]) {
          if (!collectionsObj[collectionId].artworkIds.includes(artworkId)) {
            collectionsObj[collectionId].artworkIds.push(artworkId)
          }
          localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collectionsObj))
        }
      } catch (error) {
        console.error("Failed to update collections in localStorage:", error)
      }
    }
  }

  const removeArtworkFromCollection = (artworkId: string, collectionId: string) => {
    // Don't allow removing from default collection if it's the only collection and user is logged in
    if (user && collectionId.startsWith(DEFAULT_COLLECTION_ID)) {
      const artwork = artworks.find((art) => art.id === artworkId)
      if (artwork && artwork.collectionIds.length === 1) {
        return
      }
    }

    // Remove collection from artwork
    setArtworks((prev) =>
      prev.map((art) =>
        art.id === artworkId ? { ...art, collectionIds: art.collectionIds.filter((id) => id !== collectionId) } : art,
      ),
    )

    // Remove artwork from collection
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId ? { ...col, artworkIds: col.artworkIds.filter((id) => id !== artworkId) } : col,
      ),
    )

    // If artwork now has no collections and user is logged in, add it to the default collection
    if (user) {
      const userDefaultCollectionId = `${DEFAULT_COLLECTION_ID}-${user.id}`
      const updatedArtwork = artworks.find((art) => art.id === artworkId)
      if (updatedArtwork && updatedArtwork.collectionIds.filter((id) => id !== collectionId).length === 0) {
        addArtworkToCollection(artworkId, userDefaultCollectionId)
      }
    }

    // Update in localStorage
    const storedArtworks = localStorage.getItem("pocketCuratorAllArtworks")
    if (storedArtworks) {
      try {
        const artworksObj = JSON.parse(storedArtworks)
        if (artworksObj[artworkId]) {
          artworksObj[artworkId].collectionIds = artworksObj[artworkId].collectionIds.filter(
            (id: string) => id !== collectionId,
          )
          localStorage.setItem("pocketCuratorAllArtworks", JSON.stringify(artworksObj))
        }
      } catch (error) {
        console.error("Failed to update artworks in localStorage:", error)
      }
    }

    const storedCollections = localStorage.getItem("pocketCuratorAllCollections")
    if (storedCollections) {
      try {
        const collectionsObj = JSON.parse(storedCollections)
        if (collectionsObj[collectionId]) {
          collectionsObj[collectionId].artworkIds = collectionsObj[collectionId].artworkIds.filter(
            (id: string) => id !== artworkId,
          )
          localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collectionsObj))
        }
      } catch (error) {
        console.error("Failed to update collections in localStorage:", error)
      }
    }
  }

  const getArtworksByCollectionId = (collectionId: string) => {
    return artworks.filter((art) => art.collectionIds.includes(collectionId))
  }

  const getCollectionsByArtworkId = (artworkId: string) => {
    return collections.filter((col) => col.artworkIds.includes(artworkId))
  }

  const getPublicCollections = () => {
    return collections.filter((col) => col.isPublic)
  }

  return (
    <AppContext.Provider
      value={{
        artworks,
        collections,
        addArtwork,
        updateArtwork,
        deleteArtwork,
        addCollection,
        updateCollection,
        deleteCollection,
        addArtworkToCollection,
        removeArtworkFromCollection,
        getArtworksByCollectionId,
        getCollectionsByArtworkId,
        getPublicCollections,
        defaultCollectionId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
