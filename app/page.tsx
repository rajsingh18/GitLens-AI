'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaGithub, FaStar, FaChartLine, FaRocket, FaArrowRight, FaLinkedin, FaEnvelope, FaInstagram } from 'react-icons/fa'

// Footer Component with Glassmorphism & Responsive
function Footer() {
  const currentYear = new Date().getFullYear()
  const email = "rajbrijeshsingh1804@gmail.com"
  
  const handleEmailClick = (e: React.MouseEvent, subject?: string, body?: string) => {
    e.preventDefault()
    let mailtoLink = `mailto:${email}`
    if (subject) mailtoLink += `?subject=${encodeURIComponent(subject)}`
    if (body) mailtoLink += `${subject ? '&' : '?'}body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
  }
  
  return (
    <footer className="relative z-10 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/30 backdrop-blur-md bg-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          
          {/* Brand Column */}
          <div className="col-span-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <FaGithub className="text-white text-sm" />
              </div>
              <span className="font-bold text-white drop-shadow-md">GitLens AI</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed drop-shadow-sm max-w-xs mx-auto sm:mx-0">
              AI-powered GitHub profile analysis tool that helps developers improve their profiles and stand out to recruiters.
            </p>
          </div>
          
          {/* Features Column */}
          <div className="col-span-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-white drop-shadow-md mb-3">Features</h3>
            <ul className="space-y-2">
              <li className="text-xs text-white/80">✓ AI-Powered Analysis</li>
              <li className="text-xs text-white/80">✓ ATS Portfolio Score</li>
              <li className="text-xs text-white/80">✓ README Quality Check</li>
              <li className="text-xs text-white/80">✓ Activity Tracking</li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div className="col-span-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-white drop-shadow-md mb-3">Resources</h3>
            <ul className="space-y-2">
              <li className="text-xs text-white/80">✓ GitHub Profile Tips</li>
              <li className="text-xs text-white/80">✓ README Best Practices</li>
              <li className="text-xs text-white/80">✓ Open Source Guide</li>
              <li className="text-xs text-white/80">✓ Portfolio Examples</li>
            </ul>
          </div>
          
          {/* Connect Column */}
          <div className="col-span-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-white drop-shadow-md mb-3">Connect</h3>
            <div className="flex justify-center sm:justify-start gap-3 mb-3">
              <a 
                href="https://github.com/rajsingh18" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition"
              >
                <FaGithub className="text-white text-sm" />
              </a>
              <a 
                href="https://www.instagram.com/_rajsingh18_/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition"
              >
                <FaInstagram className="text-white text-sm" />
              </a>
              <a 
                href="https://www.linkedin.com/in/raj-singh-603449223/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition"
              >
                <FaLinkedin className="text-white text-sm" />
              </a>
              <a 
                href={`mailto:${email}`}
                onClick={(e) => handleEmailClick(e)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition"
              >
                <FaEnvelope className="text-white text-sm" />
              </a>
            </div>
            <p className="text-xs text-white/80">
              Questions or feedback?<br />
              <a 
                href={`mailto:${email}`}
                onClick={(e) => handleEmailClick(e, 'GitLens AI Feedback', 'Hi Raj,\n\nI have some feedback about GitLens AI...')}
                className="text-blue-200 hover:text-white underline font-medium break-all"
              >
                {email}
              </a>
            </p>
          </div>
        </div>
        
        {/* Bottom Bar - Responsive */}
        <div className="pt-4 border-t border-white/30 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/90 font-medium drop-shadow-sm text-center sm:text-left">
            © {currentYear} GitLens AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-white/80 hover:text-white transition font-medium">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-white/80 hover:text-white transition font-medium">
              Terms of Service
            </a>
            <a 
              href={`mailto:${email}`}
              onClick={(e) => handleEmailClick(e, 'Contact from GitLens AI', 'Hello Raj,\n\nI would like to get in touch...')}
              className="text-xs text-white/80 hover:text-white transition font-medium"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const extractUsername = (input: string): string | null => {
    input = input.trim()
    
    if (input.startsWith('@')) {
      input = input.substring(1)
    }
    
    const usernamePattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/
    if (usernamePattern.test(input)) {
      return input
    }
    
    const urlPatterns = [
      /github\.com\/([^\/\?\s]+)/,
      /github\.com\/([^\/\?\s]+)\/?/,
      /github\.com\/([^\/\?\s]+)\/[\w-]+/,
      /https?:\/\/github\.com\/([^\/\?\s]+)/,
      /https?:\/\/www\.github\.com\/([^\/\?\s]+)/,
    ]
    
    for (const pattern of urlPatterns) {
      const match = input.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setLoading(true)
    
    const username = extractUsername(input)
    if (!username) {
      alert('Please enter a valid GitHub username or URL (e.g., octocat or https://github.com/octocat)')
      setLoading(false)
      return
    }
    
    router.push(`/analyze/${encodeURIComponent(username)}`)
  }

  return (
    <main className="min-h-screen relative flex flex-col">
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3)' }}
        >
          <source src="/216761_medium.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Hero Section - Fully Responsive */}
      <div className="relative flex-1">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
          
          {/* Header - Responsive Text Sizes */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 backdrop-blur-md bg-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6 shadow-lg border border-white/30">
              <FaGithub className="text-white text-sm sm:text-base" />
              <span className="text-xs sm:text-sm font-medium text-white">GitLens AI Analyzer</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">
              <span className="text-white drop-shadow-lg">GitLens AI</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md px-4">
              AI-powered GitHub profile analysis to help you stand out to recruiters
            </p>
          </div>

          {/* Features Grid - Responsive Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 sm:p-6 text-center group border border-white/30 shadow-xl hover:bg-white/20 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition shadow-lg">
                <FaStar className="text-white text-lg sm:text-xl" />
              </div>
              <h3 className="font-semibold text-white mb-1 sm:mb-2 drop-shadow-sm text-sm sm:text-base">AI Analysis</h3>
              <p className="text-xs sm:text-sm text-white/80">Intelligent insights to improve your profile</p>
            </div>
            
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 sm:p-6 text-center group border border-white/30 shadow-xl hover:bg-white/20 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition shadow-lg">
                <FaChartLine className="text-white text-lg sm:text-xl" />
              </div>
              <h3 className="font-semibold text-white mb-1 sm:mb-2 drop-shadow-sm text-sm sm:text-base">Score Out of 10</h3>
              <p className="text-xs sm:text-sm text-white/80">Clear metrics on profile strength</p>
            </div>
            
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 sm:p-6 text-center group border border-white/30 shadow-xl hover:bg-white/20 transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition shadow-lg">
                <FaRocket className="text-white text-lg sm:text-xl" />
              </div>
              <h3 className="font-semibold text-white mb-1 sm:mb-2 drop-shadow-sm text-sm sm:text-base">Actionable Tips</h3>
              <p className="text-xs sm:text-sm text-white/80">Step-by-step improvement guide</p>
            </div>
          </div>

          {/* Input Form - Responsive Width */}
          <div className="max-w-full sm:max-w-lg md:max-w-2xl mx-auto px-4 sm:px-0">
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-5 sm:p-6 md:p-8 border border-white/30 shadow-xl">
              <form onSubmit={handleSubmit}>
                <div className="mb-5 sm:mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaGithub className="text-white/60 text-sm sm:text-base" />
                    </div>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="octocat or https://github.com/octocat"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:border-blue-400 text-white placeholder:text-white/50 transition"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-white/70 mt-2 text-center sm:text-left">
                    Enter a GitHub username or full profile URL
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-full py-2.5 sm:py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="loader w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Review Profile
                      <FaArrowRight className="text-xs sm:text-sm" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Example Buttons - Responsive Wrap */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-white/80 mb-2 sm:mb-3 drop-shadow-sm">Try these examples:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['octocat', 'gaearon', 'vercel'].map((example) => (
                  <button
                    key={example}
                    onClick={() => setInput(example)}
                    className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-md bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all cursor-pointer"
                  >
                    @{example}
                  </button>
                ))}
              </div>
              <p className="text-[11px] sm:text-xs text-white/60 mt-2 sm:mt-3">
                Or paste full URLs like: github.com/octocat, https://github.com/octocat
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}