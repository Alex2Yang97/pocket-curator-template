"use client"

import type React from "react"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-16 px-4 md:px-8">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="text-[#D2B877] hover:underline font-medium">← Back to Home</Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-playfair text-[#D2B877] mb-8 text-center">Contact Us</h1>

        <div className="bg-[#0B0F19]/80 backdrop-blur-sm border border-[#D2B877]/10 rounded-lg p-6 md:p-8 shadow-lg">
          <h2 className="text-2xl font-playfair text-[#D2B877] mb-6">Get in Touch</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Have questions, suggestions, or just want to say hello? We'd love to hear from you. Feel free to reach out through any of the following channels.
          </p>

          <div className="space-y-4 text-gray-300">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#D2B877] mr-3 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <h3 className="font-medium text-[#D2B877]">Email</h3>
                <p className="mt-1">alexyzr2494@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#D2B877] mr-3 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <div>
                <h3 className="font-medium text-[#D2B877]">GitHub</h3>
                <a href="https://github.com/Alex2Yang97/pocket-curator-template" target="_blank" rel="noopener noreferrer" className="mt-1 text-[#D2B877] hover:underline">
                  Open an issue on GitHub
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#D2B877] mr-3 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <div>
                <h3 className="font-medium text-[#D2B877]">Twitter</h3>
                <a href="https://x.com/WAZXDE123" target="_blank" rel="noopener noreferrer" className="mt-1 text-[#D2B877] hover:underline">
                  @WAZXDE123
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
