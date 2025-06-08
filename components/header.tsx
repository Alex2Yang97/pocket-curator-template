"use client"

import { MainNav } from "@/components/main-nav"
import { useAuth } from "@/context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-transparent bg-[rgba(30,30,40,0.85)] shadow-lg dark:bg-black/40 backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(30,30,40,0.85)] dark:supports-[backdrop-filter]:bg-black/40">
      <div className="container flex h-16 items-center justify-between">
        <MainNav />
      </div>
    </header>
  )
}
