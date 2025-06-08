import React from "react"
import clsx from "clsx"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost"
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Button({
  variant = "primary",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyle =
    "min-w-[140px] h-12 px-6 font-semibold rounded-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"

  const primaryStyle =
    "text-[#D2B877] border border-[#D2B877] bg-transparent hover:bg-[#D2B877] hover:text-black duration-300 ease-in-out"

  const secondaryStyle =
    "text-[#D2B877] border border-transparent bg-transparent hover:bg-[#D2B877]/10 hover:text-[#D2B877] duration-200 ease-in"

  const ghostStyle =
    "text-[#D2B877] border-none bg-transparent hover:bg-[#D2B877]/10 hover:text-[#D2B877] duration-200 ease-in"

  return (
    <button
      className={clsx(
        baseStyle,
        variant === "primary"
          ? primaryStyle
          : variant === "secondary"
          ? secondaryStyle
          : variant === "ghost"
          ? ghostStyle
          : secondaryStyle,
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </button>
  )
} 