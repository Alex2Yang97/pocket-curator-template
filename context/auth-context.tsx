"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type { Collection } from "@/lib/types"
import { supabase } from "@/lib/utils"
import {
  createUser,
  getEmailByUsername,
  getUserProfile,
} from "@/lib/supabase-data"

export type User = {
  id: string
  name: string
  email: string
  createdAt: string
  collections: string[] // Collection IDs owned by this user
  member: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  getUserCollections: () => Collection[]
  createUserCollection: (collection: Omit<Collection, "id" | "createdAt">) => string
  oauthLogin: (provider: "google" | "github") => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>
  updatePassword: (password: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default collection ID - using a constant to ensure consistency
const DEFAULT_COLLECTION_ID = "default-collection"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // fetch full user profile and set state
  async function fetchAndSetUser(authUser: any) {
    try {
      const profile = await getUserProfile(authUser.id)
      const userData = {
        id: authUser.id,
        name: profile?.username || authUser.email || "User",
        email: authUser.email || "",
        createdAt: authUser.created_at || new Date().toISOString(),
        collections: [],
        member: profile?.member || false,
      }
      setUser(userData)
      localStorage.setItem("pocketCuratorUser", JSON.stringify(userData))
    } catch (error) {
      console.error("Error fetching user profile:", error)
      // Fallback for when profile fetch fails
      const fallbackUserData = {
        id: authUser.id,
        name: authUser.user_metadata?.username || authUser.email || "User",
        email: authUser.email || "",
        createdAt: authUser.created_at || new Date().toISOString(),
        collections: [],
        member: false,
      }
      setUser(fallbackUserData)
      localStorage.setItem(
        "pocketCuratorUser",
        JSON.stringify(fallbackUserData),
      )
    }
  }

  // session persistence: detect supabase current session when page loads
  useEffect(() => {
    const getSessionUser = async () => {
      setIsLoading(true)
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        await fetchAndSetUser(authUser)
      } else {
        setUser(null)
        localStorage.removeItem("pocketCuratorUser")
      }
      setIsLoading(false)
    }
    getSessionUser()
    // listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user
        if (authUser) {
          await fetchAndSetUser(authUser)
        } else {
          setUser(null)
          localStorage.removeItem("pocketCuratorUser")
        }
      },
    )
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  // Mock user database in localStorage
  const getUsersFromStorage = (): Record<
    string,
    { name: string; email: string; password: string; createdAt: string; collections: string[] }
  > => {
    const users = localStorage.getItem("pocketCuratorUsers")
    return users ? JSON.parse(users) : {}
  }

  const saveUsersToStorage = (users: Record<string, any>) => {
    localStorage.setItem("pocketCuratorUsers", JSON.stringify(users))
  }

  // Mock collections database in localStorage
  const getCollectionsFromStorage = (): Record<string, Collection> => {
    const collections = localStorage.getItem("pocketCuratorAllCollections")
    return collections ? JSON.parse(collections) : {}
  }

  const saveCollectionsToStorage = (collections: Record<string, Collection>) => {
    localStorage.setItem("pocketCuratorAllCollections", JSON.stringify(collections))
  }

  // Create default uncategorized collection for a user
  const createDefaultCollection = (userId: string): string => {
    const collections = getCollectionsFromStorage()
    const defaultCollectionId = `${DEFAULT_COLLECTION_ID}-${userId}`

    // Check if default collection already exists
    if (collections[defaultCollectionId]) {
      return defaultCollectionId
    }

    // Create default collection
    collections[defaultCollectionId] = {
      id: defaultCollectionId,
      name: "Uncategorized",
      description: "Artworks that haven't been added to any collection",
      coverImageUrl: "/uncategorized-collection.png",
      artworkIds: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      ownerId: userId,
    }

    saveCollectionsToStorage(collections)
    return defaultCollectionId
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      })
      if (error) {
        return { success: false, message: error.message }
      }
      // email verification prompt
      if (data.user && !data.user.email_confirmed_at) {
        // Insert into users table after registration
        try {
          await createUser({
            id: data.user.id,
            username,
            avatarUrl: data.user.user_metadata?.avatar_url || null,
          })
        } catch (e) {
          // Optionally handle user table insert error
        }
        await fetchAndSetUser(data.user)
        return { success: true, message: "Registration successful! Please check your email to verify your account before logging in." }
      }
      // compatibility for rare cases where email is directly activated
      if (data.user) {
        // Insert into users table after registration
        try {
          await createUser({
            id: data.user.id,
            username,
            avatarUrl: data.user.user_metadata?.avatar_url || null,
          })
        } catch (e) {
          // Optionally handle user table insert error
        }
        await fetchAndSetUser(data.user)
      }
      return { success: true, message: "Registration successful" }
    } catch (err: any) {
      return { success: false, message: err.message || "Registration failed" }
    }
  }

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      let email = usernameOrEmail
      // If input is not an email, look up by username in the real users table
      if (!usernameOrEmail.includes("@")) {
        const foundEmail = await getEmailByUsername(usernameOrEmail)
        if (!foundEmail) {
          return { success: false, message: "User not found" }
        }
        email = foundEmail
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          return { success: false, message: "Email not confirmed. Please check your inbox to verify your email." }
        }
        return { success: false, message: error.message }
      }
      const user = data.user
      if (!user) {
        return { success: false, message: "Login failed" }
      }
      await fetchAndSetUser(user)
      return { success: true, message: "Login successful" }
    } catch (err: any) {
      return { success: false, message: err.message || "Login failed" }
    }
  }

  // logout: call supabase.auth.signOut
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem("pocketCuratorUser")
    router.push("/")
  }

  // Get all collections owned by the current user
  const getUserCollections = (): Collection[] => {
    if (!user) return []

    const allCollections = getCollectionsFromStorage()
    return Object.values(allCollections).filter((collection) => user.collections.includes(collection.id))
  }

  // Create a new collection for the current user
  const createUserCollection = (collectionData: Omit<Collection, "id" | "createdAt">): string => {
    if (!user) return ""

    const id = uuidv4()
    const newCollection: Collection = {
      ...collectionData,
      id,
      createdAt: new Date().toISOString(),
      ownerId: user.id,
    }

    // Save to collections storage
    const collections = getCollectionsFromStorage()
    collections[id] = newCollection
    saveCollectionsToStorage(collections)

    // Add to user's collections list
    const users = getUsersFromStorage()
    if (users[user.id]) {
      if (!users[user.id].collections) {
        users[user.id].collections = [id]
      } else {
        users[user.id].collections.push(id)
      }
      saveUsersToStorage(users)
    }

    // Update current user state
    setUser({
      ...user,
      collections: [...user.collections, id],
    })
    localStorage.setItem(
      "pocketCuratorUser",
      JSON.stringify({
        ...user,
        collections: [...user.collections, id],
      }),
    )

    return id
  }

  // OAuth login function
  const oauthLogin = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/profile` : undefined,
      },
    })
  }

  // Reset password: send reset email via supabase
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" 
          ? `${window.location.origin}/auth/reset-password?type=recovery` 
          : undefined,
      })
      if (error) {
        return { success: false, message: error.message }
      }
      return { success: true, message: "If an account exists with this email, you will receive password reset instructions." }
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to send reset email" }
    }
  }

  // Update password for reset password page
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        return { success: false, message: error.message }
      }
      return { success: true, message: "Password updated successfully." }
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to update password" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        getUserCollections,
        createUserCollection,
        oauthLogin,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
