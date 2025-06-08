"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, AlertCircle, Check, Mail, Github } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { register, oauthLogin } = useAuth()
  const router = useRouter()
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      const result = await register(username, email, password)
      if (result.success) {
        // 判断是否需要邮箱验证
        if (result.message.includes("verify your account") || result.message.includes("验证")) {
          setSuccess(result.message)
          // 不跳转，提示用户去邮箱验证
        } else {
          setSuccess("Registration successful! Redirecting to your profile...")
          setTimeout(() => {
            router.push("/profile")
          }, 2000)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col relative">
      {/* background image */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="absolute top-4 left-4 md:top-8 md:left-8">
          <Link href="/" className="flex items-center text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
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
            <h1 className="text-3xl font-serif font-light tracking-wide text-white mb-2">Create Account</h1>
            <p className="text-gray-300">Join Pocket Curator to start your art journey</p>
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

            {/* Email registration form - temporarily disabled
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-200">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  Password
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
                  Confirm Password
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            */}

            {/* OAuth registration buttons */}
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-2 text-gray-100 border-gray-700 bg-black/60 hover:bg-black/80"
                disabled={!!oauthLoading}
                onClick={async () => {
                  setOauthLoading('google')
                  try {
                    await oauthLogin('google')
                  } finally {
                    setOauthLoading(null)
                  }
                }}
              >
                {oauthLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="h-5 w-5" />}
                Sign up with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-2 text-gray-100 border-gray-700 bg-black/60 hover:bg-black/80"
                disabled={!!oauthLoading}
                onClick={async () => {
                  setOauthLoading('github')
                  try {
                    await oauthLogin('github')
                  } finally {
                    setOauthLoading(null)
                  }
                }}
              >
                {oauthLoading === 'github' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="h-5 w-5" />}
                Sign up with GitHub
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#D2B877] hover:text-[#E8C987]">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
