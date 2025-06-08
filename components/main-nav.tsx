"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Menu, MessageCircle, LogOut, User } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import { ExhibitNavIcon, UploadIcon } from "@/components/shared-icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"
import { LanguageSwitcher } from "./LanguageSwitcher"

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  const navItems = [
    {
      href: "/",
      label: t('homePage'),
      icon: <Home className="h-4 w-4" />,
      active: pathname === "/",
      showAlways: true,
    },
    {
      href: "/collections",
      label: t('exhibits'),
      icon: <ExhibitNavIcon className="h-4 w-4" />,
      active: pathname === "/collections" || pathname.startsWith("/collections/"),
      showAlways: true,
    },
    {
      href: "/artwork/new",
      label: t('upload'),
      icon: <UploadIcon className="h-4 w-4" />,
      active: pathname === "/artwork/new",
      showAlways: true,
    },
  ]

  // All items are shown to all users now
  const filteredNavItems = navItems

  return (
    <div className="mr-4 flex w-full justify-between md:justify-start items-center">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <div className="h-6 w-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            fill="none"
            stroke="var(--logo-color)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full"
          >
            <rect x="5" y="5" width="90" height="90" rx="10" ry="10" />
            <path d="M20 55 L45 30 L58 50 L68 40 L80 55 Z" />
            <path d="M20 55 A30 30 0 0 0 80 55 Q80 85 50 85 Q20 85 20 55 Z" fill="none" />
            <circle cx="75" cy="25" r="5" />
          </svg>
        </div>
        <span className="logo-text">Pocket Curator</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-1">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors relative group",
              item.active ? "text-white" : "text-white hover:text-white/80",
            )}
          >
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:text-white/80 hover:bg-transparent"
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
            {item.active && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4/5 h-[2px] bg-white"></span>
            )}
          </Link>
        ))}
      </nav>

      {/* desktop right: avatar/login + ThemeToggle + LanguageSwitcher */}
      <div className="hidden md:flex items-center space-x-2 ml-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 border border-border cursor-pointer">
                <AvatarFallback className="bg-[#1F2636] text-[#D2B877]">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56 bg-[#1F2636] border-[#2A3246] shadow-xl py-2">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 mb-1">
                <Avatar className="h-9 w-9 border border-[#D2B877]">
                  <AvatarFallback className="bg-[#1F2636] text-[#D2B877] text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 leading-none">
                  <span className="font-medium text-base text-[#D2B877]">{user.name}</span>
                  <span className="w-[160px] truncate text-xs text-gray-400">{user.email}</span>
                </div>
              </div>
              <DropdownMenuItem asChild={false} className="group px-4 py-2 flex items-center gap-3 text-[#D2B877] hover:bg-[#D2B877]/10 hover:text-[#E8C987] transition-colors cursor-pointer">
                <Link href="/profile" className="flex items-center gap-3 w-full">
                  <User className="h-5 w-5 group-hover:text-[#E8C987] transition-colors" />
                  <span className="text-sm">{t('profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-[#2A3246]" />
              <DropdownMenuItem
                className="group px-4 py-2 flex items-center gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                onClick={logout}
              >
                <LogOut className="h-5 w-5 group-hover:text-red-500 transition-colors" />
                <span className="text-sm">{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/auth/login">
            <Button
              variant="outline"
              size="sm"
              className="border-[#D2B877] text-[#D2B877] hover:bg-[#D2B877] hover:text-black"
            >
              {t('login')}
            </Button>
          </Link>
        )}
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <span
              role="button"
              tabIndex={0}
              aria-label="Toggle menu"
              className="inline-flex items-center justify-center h-10 w-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              <Menu className="h-7 w-7 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" />
            </span>
          </SheetTrigger>
          <SheetContent
            className="w-[240px] sm:w-[300px] flex flex-col justify-between bg-[#1F2636] bg-white/5 text-[#D2B877] border-l border-[#2A3246]"
          >
            <div>
              <SheetHeader>
                <SheetTitle className="sr-only">{t('navigation')}</SheetTitle>
              </SheetHeader>
              <div className="flex items-center space-x-2 mb-8">
                <div className="h-6 w-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="var(--logo-color)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-full w-full"
                  >
                    <rect x="5" y="5" width="90" height="90" rx="10" ry="10" />
                    <path d="M20 55 L45 30 L58 50 L68 40 L80 55 Z" />
                    <path d="M20 55 A30 30 0 0 0 80 55 Q80 85 50 85 Q20 85 20 55 Z" fill="none" />
                    <circle cx="75" cy="25" r="5" />
                  </svg>
                </div>
                <span className="logo-text">Pocket Curator</span>
              </div>
              <nav className="flex flex-col gap-4">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-colors",
                      item.active
                        ? "bg-transparent text-[#D2B877] border-b-2 border-[#D2B877]"
                        : "hover:bg-[#23283a] hover:text-[#E8C987] text-[#D2B877]"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            {/* mobile bottom right: avatar/login + ThemeToggle + LanguageSwitcher */}
            <div className="flex items-center space-x-2 mt-8 mb-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 border border-[#D2B877] cursor-pointer">
                      <AvatarFallback className="bg-[#1F2636] text-[#D2B877]">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="w-56 bg-[#1F2636] text-[#D2B877] border border-[#2A3246] shadow-xl py-2">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 mb-1">
                      <Avatar className="h-9 w-9 border border-[#D2B877]">
                        <AvatarFallback className="bg-[#1F2636] text-[#D2B877] text-lg">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5 leading-none">
                        <span className="font-medium text-base text-[#D2B877]">{user.name}</span>
                        <span className="w-[160px] truncate text-xs text-gray-400">{user.email}</span>
                      </div>
                    </div>
                    <DropdownMenuItem asChild={false} className="group px-4 py-2 flex items-center gap-3 text-[#D2B877] hover:bg-[#D2B877]/10 hover:text-[#E8C987] transition-colors cursor-pointer">
                      <Link href="/profile" className="flex items-center gap-3 w-full">
                        <User className="h-5 w-5 group-hover:text-[#E8C987] transition-colors" />
                        <span className="text-sm">{t('profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-[#2A3246]" />
                    <DropdownMenuItem
                      className="group px-4 py-2 flex items-center gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                      onClick={logout}
                    >
                      <LogOut className="h-5 w-5 group-hover:text-red-500 transition-colors" />
                      <span className="text-sm">{t('logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#D2B877] text-[#D2B877] hover:bg-[#D2B877] hover:text-black"
                  >
                    {t('login')}
                  </Button>
                </Link>
              )}
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
