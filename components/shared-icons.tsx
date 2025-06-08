import { Share2, ArrowLeft, Calendar, ChevronLeft, ChevronRight, Star, Heart, Image as ImageIcon } from "lucide-react"
import React from "react"
import type { SVGProps } from "react"

/**
 * All shared icons used in Artwork detail page
 * Exported for global reuse and style consistency
 */

// 1. Lucide icons
export { Share2, ArrowLeft, Calendar, ChevronLeft, ChevronRight, Star, Heart, ImageIcon }

// 2. Custom SVG icons

/**
 * User/Artist icon
 * Used to display icons next to artist/curator profile
 */
export function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
    </svg>
  )
}

/**
 * Book/Notes icon
 * Used for curator notes block title
 */
export function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" />
      <path d="M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4H3v4Z" />
    </svg>
  )
}

/**
 * Collection icon
 * Used for collection block title
 */
export function CollectionIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  )
}

/**
 * Location/Pin icon
 * Used for exhibition location information
 */
export function LocationPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  )
}

/**
 * Exhibit icon
 * Used for exhibition block title
 */
export function ExhibitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 8h18" />
      <circle cx="8.5" cy="11.5" r="1.5" />
      <path d="M12 13l2-2 4 4" />
    </svg>
  )
}

/**
 * StickyNote icon
 * Used for curator notes block title
 */
export function StickyNoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 4v4a2 2 0 0 0 2 2h4" />
      <path d="M16 20v-4a2 2 0 0 0-2-2h-4" />
    </svg>
  )
}

/**
 * Artist icon
 * Used for artist block, and User/Curator distinction
 */
export function ArtistIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <ellipse cx="12" cy="12" rx="8" ry="6" />
      <circle cx="8.5" cy="10.5" r="1" />
      <circle cx="15.5" cy="10.5" r="1" />
      <circle cx="12" cy="14" r="1" />
      <path d="M17 16c0 1.5-2 2-3 2s-2-1-2-2 1-2 2-2 3 .5 3 2z" />
    </svg>
  )
}

/**
 * ExhibitNavIcon
 * More intuitive exhibition navigation icon (simple gallery/frame style)
 */
export function ExhibitNavIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="7" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

/**
 * UploadIcon
 * More intuitive upload icon (up arrow + tray/cloud)
 */
export function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 17V5" />
      <path d="M8 9l4-4 4 4" />
      <rect x="4" y="17" width="16" height="3" rx="1.5" />
    </svg>
  )
}

export function SparkleIcon({ width = 20, height = 20, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 14 14" {...props}>
      <g fill="none">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M7.391 10.677c-.35-.061-.35-.565 0-.626a3.176 3.176 0 0 0 2.556-2.437l.024-.11c.076-.347.57-.349.649-.003l.03.133a3.192 3.192 0 0 0 2.56 2.415c.353.062.353.568 0 .63a3.193 3.193 0 0 0-2.565 2.435l-.025.112c-.08.347-.573.344-.65-.002l-.02-.097a3.176 3.176 0 0 0-2.559-2.45"/>
        <path fill="currentColor" d="M7.391 10.677c-.35-.061-.35-.565 0-.626a3.176 3.176 0 0 0 2.556-2.437l.024-.11c.076-.347.57-.349.649-.003l.03.133a3.192 3.192 0 0 0 2.56 2.415c.353.062.353.568 0 .63a3.193 3.193 0 0 0-2.565 2.435l-.025.112c-.08.347-.573.344-.65-.002l-.02-.097a3.176 3.176 0 0 0-2.559-2.45"/>
        <path fill="currentColor" fillRule="evenodd" d="M.025 8.798c0 .944.765 1.708 1.708 1.708h3.65a2.113 2.113 0 0 1 .479-1.5H1.775a.25.25 0 0 1-.25-.25V5.84l.203-.036a5.25 5.25 0 0 1 5.12 2.008l.368.487a1.423 1.423 0 0 0 1.022-1.065l.023-.104c.295-1.345 1.593-1.863 2.656-1.548V1.723c0-.943-.765-1.708-1.708-1.708H1.733C.79.015.025.78.025 1.723zm7.857-4.265a1.371 1.371 0 1 0 0-2.742a1.371 1.371 0 0 0 0 2.742" clipRule="evenodd"/>
      </g>
    </svg>
  )
}

/**
 * Download icon
 */
export function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
      <rect x="4" y="17" width="16" height="3" rx="1.5" />
    </svg>
  )
}

/**
 * MagicWand icon (for background removal)
 */
export function MagicWandIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 4V2m0 20v-2m7-7h-2M4 12H2m16.95-6.95l-1.414 1.414M6.464 17.536l-1.414 1.414M19.778 19.778l-1.414-1.414M6.464 6.464L5.05 5.05" />
      <rect x="8" y="8" width="8" height="8" rx="2" />
    </svg>
  )
} 