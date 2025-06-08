"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { getPublicCollections } from "@/lib/supabase-data"
import { CollectionCard } from "@/components/collection-card"
import { ChevronDown } from "lucide-react"
import { ExhibitNavIcon } from "@/components/shared-icons"

const SORT_OPTIONS = [
  { value: "curate_date", label: "Curate Date" },
  { value: "likes", label: "Likes" },
]

// shared hook: dynamically calculate pageSize, columns match Tailwind grid-cols-X
function useDynamicPageSizeWithTailwindGrid({ minRows = 1, rowHeight = 320, gap = 24 } = {}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [pageSize, setPageSize] = useState(12)

  function getColumnsByBreakpoint() {
    const width = window.innerWidth
    if (width >= 1536) return 5 // 2xl:grid-cols-5
    if (width >= 1280) return 4 // xl:grid-cols-4
    if (width >= 768) return 3  // md:grid-cols-3
    return 2 // base:grid-cols-2
  }

  // expose updatePageSize for external use
  const updatePageSize = useCallback(() => {
    if (!gridRef.current) return
    const columns = getColumnsByBreakpoint()
    const gridTop = gridRef.current.getBoundingClientRect().top
    const availableHeight = window.innerHeight - gridTop - 180
    const rows = Math.max(minRows, Math.floor((availableHeight + gap) / (rowHeight + gap)))
    setPageSize(columns * rows)
  }, [gap, minRows, rowHeight])

  useLayoutEffect(() => {
    updatePageSize()
    window.addEventListener('resize', updatePageSize)
    return () => window.removeEventListener('resize', updatePageSize)
  }, [updatePageSize])

  return { gridRef, pageSize, updatePageSize }
}

export default function CollectionsPage() {
  const { user } = useAuth()
  const [publicCollections, setPublicCollections] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState("curate_date")
  const [sortLabel, setSortLabel] = useState("Curate Date")
  const [showSort, setShowSort] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // use columns match Tailwind grid-cols-X for dynamic pageSize
  const { gridRef, pageSize, updatePageSize } = useDynamicPageSizeWithTailwindGrid({ minRows: 4, rowHeight: 320, gap: 24 })

  useEffect(() => {
    setLoading(true)
    getPublicCollections({ page, pageSize, sort })
      .then(({ collections, total }) => {
        setPublicCollections(collections)
        setTotal(typeof total === 'number' ? total : 0)
      })
      .finally(() => setLoading(false))
  }, [page, pageSize, sort])

  // after publicCollections loaded, ensure pageSize is calculated once (first screen/data change)
  useEffect(() => {
    if (publicCollections.length > 0) {
      requestAnimationFrame(() => updatePageSize())
    }
  }, [publicCollections, updatePageSize])

  // click outside to automatically close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSort(false)
      }
    }
    if (showSort) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSort])

  function handleSortChange(value: string, label: string) {
    setSort(value)
    setSortLabel(label)
    setPage(1)
    setShowSort(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* content - relative position with z-index */}
      <div className="flex-grow flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className={"mt-8 md:mt-12 text-2xl md:text-3xl font-sans font-bold text-[#222] dark:text-foreground tracking-tight drop-shadow-sm flex items-center gap-2"}>
              <ExhibitNavIcon className="h-7 w-7 md:h-8 md:w-8 -mt-1" style={{ color: 'currentColor' }} />
              Exhibits
            </h2>
          </div>
          {/* sort dropdown - vertically placed below Exhibits */}
          <div className="relative mt-4 mb-2 flex justify-end" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card text-foreground font-medium hover:bg-accent transition-colors"
              onClick={() => setShowSort((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={showSort}
            >
              Sort by: {sortLabel}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSort && (
              <ul className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181818] border border-border rounded-lg shadow-lg z-30">
                {SORT_OPTIONS.map((opt) => (
                  <li
                    key={opt.value}
                    className={`px-4 py-2 cursor-pointer hover:bg-accent
                      ${sort === opt.value
                        ? 'text-[#D2B877] font-bold bg-[#D2B877]/10 dark:bg-[#D2B877]/20'
                        : 'text-foreground dark:text-foreground'}
                    `}
                    onClick={() => handleSortChange(opt.value, opt.label)}
                    role="option"
                    aria-selected={sort === opt.value}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading exhibits...</div>
          ) : publicCollections.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border shadow-lg px-6 md:px-20 my-16">
              <h2 className="text-xl font-semibold mb-2 text-foreground">No exhibits yet</h2>
              <p className="text-muted-foreground mb-6">Be the first to create an exhibit!</p>
              {user ? (
                <Link href="/profile">
                  <Button className="min-w-[180px] h-12 px-6 font-semibold text-[#D2B877] bg-transparent border border-[#D2B877] rounded-lg hover:bg-[#D2B877] hover:text-black transition-all duration-300 ease-in-out">
                    Go to Profile
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button className="min-w-[180px] h-12 px-6 font-semibold text-[#D2B877] bg-transparent border border-[#D2B877] rounded-lg hover:bg-[#D2B877] hover:text-black transition-all duration-300 ease-in-out">
                    Sign In to View Exhibits
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="px-0 md:px-4 lg:px-0 py-8 md:py-12">
              <div
                ref={gridRef}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 xl:gap-8"
              >
                {publicCollections.map((collection) => {
                  const isOwnedByUser = !!(user && (collection.curator_id === user.id || collection.ownerId === user.id))
                  return (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      isOwnedByUser={isOwnedByUser}
                      fromPage="explore"
                    />
                  )
                })}
              </div>
              {/* pagination controls */}
              <div className="flex flex-col items-center gap-6 mt-10">
                <div className="flex gap-4">
                  <button
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-normal transition-colors disabled:opacity-50 border-2 border-[#222] dark:border-white/40 text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                    let start = Math.max(1, page - 2)
                    let end = Math.min(Math.ceil(total / pageSize), start + 4)
                    if (end - start < 4) start = Math.max(1, end - 4)
                    const pageNum = start + i
                    if (pageNum > end) return null
                    const isActive = pageNum === page
                    return (
                      <button
                        key={pageNum}
                        className={
                          `w-16 h-16 rounded-lg flex items-center justify-center text-xl font-normal transition-colors
                          ${isActive
                            ? 'bg-transparent border-none text-muted-foreground dark:text-muted-foreground cursor-default'
                            : 'border-2 border-[#222] dark:border-white/40 text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white'}
                          `
                        }
                        disabled={isActive}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-normal transition-colors disabled:opacity-50 border-2 border-[#222] dark:border-white/40 text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white"
                    disabled={page * pageSize >= total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    &gt;
                  </button>
                </div>
                <button
                  className="mt-2 px-8 py-3 border-2 border-[#222] dark:border-white/40 rounded-lg text-lg font-normal transition-colors text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Return To Top
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
