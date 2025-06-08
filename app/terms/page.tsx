import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-16 px-4 md:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-[#D2B877] hover:underline font-medium">← Back to Home</Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-playfair text-[#D2B877] mb-8 text-center">Terms of Service</h1>
        <div className="bg-[#0B0F19]/80 backdrop-blur-sm border border-[#D2B877]/10 rounded-lg p-6 md:p-8 mb-12 shadow-lg">
          <p className="text-gray-400 mb-8 text-sm">Last Updated: April 28, 2025</p>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-6 leading-relaxed">
              By using Pocket Curator, you agree to these terms. Please read them carefully.
            </p>
            <h2 className="text-2xl font-playfair text-[#D2B877] mt-8 mb-4">Your Account</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
              <li>Keep your login info safe. You're responsible for your account.</li>
              <li>Don't use Pocket Curator for anything illegal or harmful.</li>
              <li>You can delete your account at any time.</li>
            </ul>
            <h2 className="text-2xl font-playfair text-[#D2B877] mt-8 mb-4">Content</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
              <li>You own the content you upload. Don't upload anything you don't have rights to.</li>
              <li>We may remove content that violates these terms or the law.</li>
            </ul>
            <h2 className="text-2xl font-playfair text-[#D2B877] mt-8 mb-4">Liability</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
              <li>Pocket Curator is provided as-is. We're not liable for any damages or data loss.</li>
              <li>We may update these terms. We'll notify you of major changes.</li>
            </ul>
            <h2 className="text-2xl font-playfair text-[#D2B877] mt-8 mb-4">Contact</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Questions? Email alexyzr2494@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
