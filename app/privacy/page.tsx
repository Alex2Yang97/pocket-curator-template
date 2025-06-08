import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-16 px-4 md:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-[#D2B877] hover:underline font-medium">← Back to Home</Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-playfair text-[#D2B877] mb-8 text-center">Privacy Policy</h1>
        <div className="bg-[#0B0F19]/80 backdrop-blur-sm border border-[#D2B877]/10 rounded-lg p-6 md:p-8 mb-12 shadow-lg">
          <p className="text-gray-400 mb-8 text-sm">Last Updated: April 28, 2025</p>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-6 leading-relaxed">
              We respect your privacy. This policy explains what information we collect and how we use it.
            </p>
            <h2 className="text-2xl font-playfair text-[#D2B877] mt-8 mb-4">What We Collect</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
              <li>Account info (like your email and name, if you sign up)</li>
              <li>Content you upload (artworks, collections, notes)</li>
              <li>Basic usage data (how you use the app, device/browser info)</li>
            </ul>
            <h2 className="text-2xl font-playfair text-[#D2B877] mt-8 mb-4">How We Use It</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
              <li>To provide and improve the app</li>
              <li>To keep your account secure</li>
              <li>To contact you about important updates</li>
            </ul>
            <h2 className="text-2xl font-playfair text-[#D2B877] mt-8 mb-4">Your Rights</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
              <li>You can view, edit, or delete your account and content at any time</li>
              <li>Contact us if you have questions about your data: alexyzr2494@gmail.com</li>
            </ul>
            <h2 className="text-2xl font-playfair text-[#D2B877] mt-8 mb-4">Sharing</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              We do not sell your data. We only share it if required by law or to provide our service (for example, with our hosting provider).
            </p>
            <h2 className="text-2xl font-playfair text-[#D2B877] mt-8 mb-4">Changes</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              We may update this policy. We'll let you know if we make any major changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
