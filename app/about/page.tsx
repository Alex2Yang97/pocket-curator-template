import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-16 px-4 md:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-[#D2B877] hover:underline font-medium">← Back to Home</Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-playfair text-[#D2B877] mb-8 text-center">About Pocket Curator</h1>
        <div className="bg-[#0B0F19]/80 backdrop-blur-sm border border-[#D2B877]/10 rounded-lg p-6 md:p-8 mb-12 shadow-lg">
          <p className="text-gray-300 mb-6 leading-relaxed text-lg text-center">
            Pocket Curator is a simple way to document, organize, and share your art and exhibition experiences. Whether you're visiting a gallery, discovering street art, or creating your own, our platform helps you keep every moment and story in one place.
          </p>
          <div className="my-10 relative h-48 md:h-64 rounded-lg overflow-hidden">
            {/* Placeholder for the removed Image component */}
          </div>
          <ul className="text-gray-300 space-y-4 text-base mt-8">
            <li><span className="text-[#D2B877] font-medium">• Capture:</span> Save artworks and exhibitions you love, with photos and notes.</li>
            <li><span className="text-[#D2B877] font-medium">• Curate:</span> Organize your finds into collections that reflect your taste and journey.</li>
            <li><span className="text-[#D2B877] font-medium">• Share:</span> Let others explore your collections, or keep them private—your choice.</li>
          </ul>
          <p className="text-gray-400 mt-10 text-center text-sm">
            Art is for everyone. Pocket Curator makes it easy to keep your art story alive.
          </p>
        </div>
      </div>
    </div>
  )
}
