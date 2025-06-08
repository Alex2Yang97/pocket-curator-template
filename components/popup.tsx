"use client"
import React, { ReactNode, useEffect } from "react"
import { X, Info, Edit2, Calendar, FileText } from "lucide-react"

interface PopupProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  actions?: ReactNode
  width?: number | string
  maxWidth?: number | string
  className?: string
}

export const Popup: React.FC<PopupProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  width = 420,
  maxWidth = "95vw",
  className = "",
}) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[3px] transition-all"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`
          relative bg-black/50 border border-[#D2B877]/40 rounded-2xl shadow-2xl
          backdrop-blur-xl p-6 md:p-8
          flex flex-col
          animate-fade-in
          ${className}
        `}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
          minWidth: "min(320px, 90vw)",
          boxShadow: "0 8px 32px 0 rgba(34, 34, 34, 0.25)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* close button */}
        <button
          className="absolute top-4 right-4 text-[#D2B877] hover:text-white transition"
          onClick={onClose}
          aria-label="关闭"
        >
          <X className="w-6 h-6" />
        </button>
        {/* title */}
        {title && (
          <div className="mb-4 text-xl font-bold text-[#D2B877] text-center drop-shadow">
            {title}
          </div>
        )}
        {/* content area */}
        <div className="flex-1 text-white mb-4">
          {/* form label style suggestion:
            <label className="flex items-center gap-2 text-[#D2B877] font-medium text-base mb-1">
              <Info className="w-4 h-4" />
              label content
            </label>
          */}
          {children}
        </div>
        {/* button area */}
        {actions && (
          <div className="flex justify-end gap-2 mt-2">
            {/* suggestion main button: bg-[#D2B877] text-black, hover:bg-[#E8C987]; suggestion secondary button: border border-[#D2B877]/60 text-[#D2B877] bg-transparent hover:bg-[#D2B877]/20 */}
            {actions}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px) scale(0.98);}
          to { opacity: 1; transform: none;}
        }
        .animate-fade-in { animation: fade-in 0.25s cubic-bezier(.4,0,.2,1);}
      `}</style>
    </div>
  )
} 