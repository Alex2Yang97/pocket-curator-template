"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { updatePassword } = useAuth() as any

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const type = searchParams.get('type')
    if (type !== 'recovery') {
      router.push('/auth/login')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setIsLoading(true)
    const result = await updatePassword(password)
    setIsLoading(false)
    if (result.success) {
      setSuccess("Password reset successful! Redirecting to login...")
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="flex min-h-screen flex-col relative">
      {/* background image */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="absolute top-4 left-4 md:top-8 md:left-8">
          <Link href="/auth/login" className="flex items-center text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
        </div>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-8 w-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="#D2B877"
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
                <span className="font-bold text-xl text-[#D2B877]">Pocket Curator</span>
              </div>
            </Link>
            <h1 className="text-3xl font-serif font-light tracking-wide text-white mb-2">Set New Password</h1>
            <p className="text-gray-300">Enter your new password below</p>
          </div>
          <div className="backdrop-blur-lg bg-black/40 rounded-xl p-6 border border-white/10">
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-900/40 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-900/40 border-green-800">
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 px-6 font-semibold text-black bg-[#D2B877] hover:bg-[#E8C987] rounded-lg transition-all duration-300 ease-in-out"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Set New Password"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 