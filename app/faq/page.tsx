"use client"

import { useState } from "react"
import Link from "next/link"

interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqItems: FAQItem[] = [
    {
      question: "What is Pocket Curator?",
      answer: "A simple app to help you record, organize, and share your art and exhibition experiences.",
    },
    {
      question: "How do I add a new artwork or exhibition?",
      answer: "Click 'Start a New Exhibit' and follow the steps to upload photos and add details.",
    },
    {
      question: "Can I keep my collections private?",
      answer: "Yes. You can choose to make any collection private or public.",
    },
    {
      question: "How do I share my collections?",
      answer: "Public collections have a share button. Copy the link or share directly to social media.",
    },
    {
      question: "Is Pocket Curator free?",
      answer: "Yes, the core features are free for everyone.",
    },
    {
      question: "What file types can I upload?",
      answer: "You can upload JPEG, PNG, or WebP images up to 10MB each.",
    },
    {
      question: "How do I delete my account?",
      answer: "Go to your profile settings and select 'Delete Account'. This will remove all your data.",
    },
    {
      question: "Who can see my collections?",
      answer: "Only you can see private collections. Public collections are visible to everyone.",
    },
    {
      question: "How do I contact support?",
      answer: "Email alexyzr2494@gmail.com or use the contact form on our website.",
    },
  ]

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-16 px-4 md:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-[#D2B877] hover:underline font-medium">← Back to Home</Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-playfair text-[#D2B877] mb-8 text-center">
          FAQ
        </h1>
        <div className="bg-[#0B0F19]/80 backdrop-blur-sm border border-[#D2B877]/10 rounded-lg p-6 md:p-8 mb-12 shadow-lg">
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="border border-[#D2B877]/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-4 text-left bg-[#161B2E] hover:bg-[#1A2035] transition-colors"
                >
                  <span className="font-medium text-[#D2B877]">{faq.question}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-[#D2B877] transition-transform ${
                      activeIndex === index ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeIndex === index && (
                  <div className="p-4 bg-[#0F1424] text-gray-300 leading-relaxed">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-[#161B2E] rounded-lg border border-[#D2B877]/10 text-center">
            <h2 className="text-xl font-playfair text-[#D2B877] mb-4">Need more help?</h2>
            <p className="text-gray-300 mb-4">
              Email <a href="mailto:alexyzr2494@gmail.com" className="underline text-[#D2B877]">alexyzr2494@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
