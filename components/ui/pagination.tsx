import React from "react"

interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  showReturnToTop?: boolean
}

export function Pagination({ page, total, pageSize, onPageChange, showReturnToTop }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize) || 1
  // only show up to 5 page numbers, current page centered
  let start = Math.max(1, page - 2)
  let end = Math.min(totalPages, start + 4)
  if (end - start < 4) start = Math.max(1, end - 4)
  const pageNumbers = []
  for (let i = 0; i < Math.min(5, totalPages); i++) {
    const pageNum = start + i
    if (pageNum > end) break
    pageNumbers.push(pageNum)
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-10">
      <div className="flex gap-4">
        <button
          className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-normal transition-colors disabled:opacity-50 border-2 border-[#222] dark:border-white/40 text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          &lt;
        </button>
        {pageNumbers.map((pageNum) => {
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
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          )
        })}
        <button
          className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-normal transition-colors disabled:opacity-50 border-2 border-[#222] dark:border-white/40 text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white"
          disabled={page * pageSize >= total}
          onClick={() => onPageChange(page + 1)}
        >
          &gt;
        </button>
      </div>
      {showReturnToTop && (
        <button
          className="mt-2 px-8 py-3 border-2 border-[#222] dark:border-white/40 rounded-lg text-lg font-normal transition-colors text-foreground dark:text-foreground bg-transparent hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Return To Top
        </button>
      )}
    </div>
  )
} 