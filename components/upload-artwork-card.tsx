import React, { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Plus, Upload, X, AlertCircle } from "lucide-react"
import Image from "next/image"

// Upload entry card
export function UploadArtworkEntryCard({ onFiles }: { onFiles: (files: File[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <Card className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D2B877] bg-black/10 rounded-xl min-h-[340px] w-full cursor-pointer hover:bg-[#D2B877]/10 transition" onClick={() => fileInputRef.current?.click()}>
      <Upload className="h-10 w-10 text-[#D2B877] mb-2" />
      <span className="text-[#D2B877] font-medium text-lg mb-1">Add Artwork</span>
      <span className="text-[#D2B877]/70 text-sm mb-2">Click or drag to upload images</span>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={e => {
          const files = Array.from(e.target.files || [])
          if (files.length > 0) onFiles(files)
        }}
      />
    </Card>
  )
}

// Single artwork form card
export function UploadArtworkFormCard({
  meta,
  onMetaChange,
  onDelete,
  isUploading,
}: {
  meta: {
    file: File
    previewUrl: string
    title: string
    artist: string
    date: string
    curatorNotes: string
  }
  onMetaChange: (field: string, value: string) => void
  onDelete: () => void
  isUploading: boolean
}) {
  return (
    <Card className="relative flex flex-col items-center border border-[#D2B877]/30 rounded-xl p-4 bg-black/20 min-h-[340px] w-full">
      <button
        type="button"
        className="absolute top-2 right-2 text-[#D2B877] hover:text-red-500"
        onClick={onDelete}
        aria-label="Delete"
        tabIndex={0}
      >
        <X className="h-5 w-5" />
      </button>
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-[#D2B877]/20 bg-black/30 min-h-[120px] mb-2">
        <Image src={meta.previewUrl} alt="preview" fill className="object-contain" />
      </div>
      <Input
        type="text"
        placeholder="Title*"
        value={meta.title}
        onChange={e => onMetaChange("title", e.target.value)}
        className="bg-black/30 border-[#D2B877]/30 text-white focus:border-[#D2B877] mt-2"
        disabled={isUploading}
      />
      <Input
        type="text"
        placeholder="Artist (optional)"
        value={meta.artist}
        onChange={e => onMetaChange("artist", e.target.value)}
        className="bg-black/30 border-[#D2B877]/30 text-white focus:border-[#D2B877] mt-2"
        disabled={isUploading}
      />
      <Input
        type="date"
        value={meta.date}
        onChange={e => onMetaChange("date", e.target.value)}
        className="bg-black/30 border-[#D2B877]/30 text-white focus:border-[#D2B877] mt-2"
        disabled={isUploading}
      />
      <Textarea
        placeholder="Curator Notes (optional)"
        value={meta.curatorNotes}
        onChange={e => onMetaChange("curatorNotes", e.target.value)}
        className="bg-black/30 border-[#D2B877]/30 text-white focus:border-[#D2B877] mt-2"
        disabled={isUploading}
      />
      {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10"><Loader2 className="h-8 w-8 animate-spin text-[#D2B877]" /></div>}
    </Card>
  )
} 