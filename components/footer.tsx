import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t bg-background/90 dark:bg-background/80 border-border py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-start">
          {/* logo and app name */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                fill="none"
                stroke="var(--logo-color)"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="48"
                height="48"
                className="mr-3"
              >
                <g strokeWidth="4">
                  <rect x="5" y="5" width="90" height="90" rx="10" ry="10" />
                  <path d="M20 55 L45 30 L58 50 L68 40 L80 55 Z" />
                  <path d="M20 55 A30 30 0 0 0 80 55 Q80 85 50 85 Q20 85 20 55 Z" fill="none" />
                  <circle cx="75" cy="25" r="5" />
                </g>
              </svg>
              <span className="logo-text">Pocket Curator</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Curate, understand, and share your art journey—anytime, anywhere.
            </p>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="font-semibold font-sans text-foreground mb-2 text-base">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-[#D2B877] transition-colors text-sm">About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-[#D2B877] transition-colors text-sm">Contact Us</Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-[#D2B877] transition-colors text-sm">FAQ</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-sans text-foreground mb-2 text-base">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-[#D2B877] transition-colors text-sm">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-[#D2B877] transition-colors text-sm">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* social media */}
          <div className="flex flex-col items-start md:items-end gap-4 w-full">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <h3 className="font-semibold font-sans text-foreground mb-2 text-base">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="https://x.com/WAZXDE123" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#D2B877] transition-colors" aria-label="X (Twitter)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                  </svg>
                </a>
                <a href="https://github.com/Alex2Yang97/pocket-curator-template" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#D2B877] transition-colors" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                </a>
                <a href="mailto:alexyzr2494@gmail.com" className="text-muted-foreground hover:text-[#D2B877] transition-colors" aria-label="Email">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </a>
                <a href="https://www.xiaohongshu.com/user/profile/63823557000000001f019f3f" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#D2B877] transition-colors" aria-label="Xiaohongshu">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-6 md:mt-auto text-left md:text-right w-full md:w-auto">
              © {new Date().getFullYear()} Pocket Curator. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
