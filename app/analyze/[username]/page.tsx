'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ScoreCard from '@/app/components/ScoreCard'
import ReadmeAnalyzer from '@/app/components/ReadmeAnalyzer'
import SuggestionsList from '@/app/components/SuggestionsList'
import ATSScoreCard from '@/app/components/ATSScoreCard'
import PlacementReadiness from '@/app/components/PlacementReadiness'
import CompareProfiles from '@/app/components/CompareProfiles'
import AIChatBot from '@/app/components/AIChatBot'
import { analyzeProfile, calculateScore } from '@/app/lib/scoring'
import { fetchGitHubData } from '@/app/lib/github'
import { extractGitHubUsername } from '@/app/lib/urlUtils'
import { calculateATSScore, getPlacementReadiness } from '@/app/lib/atsScoring'
import { 
  FaLightbulb, 
  FaBook, 
  FaRobot, 
  FaChartLine, 
  FaBriefcase, 
  FaUsers,
  FaChevronDown,
  FaChevronUp,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaInstagram
} from 'react-icons/fa'

interface ProfileData {
  profile: any
  repos: any[]
  events: any[]
  readmes?: any
}

interface AIAnalysis {
  summary: string
  recruiterThoughts: string
  strengths: string[]
  improvements: string[]
  actionItems: string[]
  hireability?: string
  bestProject?: string
  aiModel?: string
}

// Collapsible Section Component with transparent design
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  badge
}: { 
  title: string
  icon: any
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="backdrop-blur-md bg-white/20 rounded-xl overflow-hidden mb-4 border border-white/30 shadow-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/10 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Icon className="text-white text-base" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white drop-shadow-md">{title}</h2>
            {badge && (
              <p className="text-xs text-white/80 drop-shadow-sm mt-0.5">{badge}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {isOpen ? (
            <FaChevronUp className="text-white/80 text-sm" />
          ) : (
            <FaChevronDown className="text-white/80 text-sm" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-5 pb-5 pt-3 border-t border-white/20">
          {children}
        </div>
      )}
    </div>
  )
}

// Footer Component with transparent design
function Footer() {
  const currentYear = new Date().getFullYear()
  const email = "rajbrijeshsingh1804@gmail.com"
  
  // Function to handle email click - opens default email client
  const handleEmailClick = (e: React.MouseEvent, subject?: string, body?: string) => {
    e.preventDefault()
    let mailtoLink = `mailto:${email}`
    if (subject) mailtoLink += `?subject=${encodeURIComponent(subject)}`
    if (body) mailtoLink += `${subject ? '&' : '?'}body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
  }
  
  return (
    <footer className="relative z-10 mt-12 pt-8 border-t border-white/30 backdrop-blur-md bg-white/10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <FaGithub className="text-white text-sm" />
              </div>
              <span className="font-bold text-white drop-shadow-md">GitHub Profile Reviewer</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed drop-shadow-sm">
              AI-powered GitHub profile analysis tool that helps developers improve their profiles and stand out to recruiters.
            </p>
          </div>
          
          {/* Features Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white drop-shadow-md mb-3">Features</h3>
            <ul className="space-y-2">
              <li className="text-xs text-white/80">✓ AI-Powered Analysis</li>
              <li className="text-xs text-white/80">✓ ATS Portfolio Score</li>
              <li className="text-xs text-white/80">✓ README Quality Check</li>
              <li className="text-xs text-white/80">✓ Activity Tracking</li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white drop-shadow-md mb-3">Resources</h3>
            <ul className="space-y-2">
              <li className="text-xs text-white/80">✓ GitHub Profile Tips</li>
              <li className="text-xs text-white/80">✓ README Best Practices</li>
              <li className="text-xs text-white/80">✓ Open Source Guide</li>
              <li className="text-xs text-white/80">✓ Portfolio Examples</li>
            </ul>
          </div>
          
          {/* Connect Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white drop-shadow-md mb-3">Connect</h3>
            <div className="flex gap-3 mb-3">
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
                onClick={(e) => handleEmailClick(e, 'GitHub Profile Reviewer Feedback', 'Hi Raj,\n\nI have some feedback about the GitHub Profile Reviewer...')}
                className="text-blue-200 hover:text-white underline font-medium"
              >
                {email}
              </a>
            </p>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-4 border-t border-white/30 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/90 font-medium drop-shadow-sm">
            © {currentYear} GitHub Profile Reviewer. All rights reserved.
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
              onClick={(e) => handleEmailClick(e, 'Contact from GitHub Profile Reviewer', 'Hello Raj,\n\nI would like to get in touch...')}
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

export default function AnalyzePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ProfileData | null>(null)
  const [score, setScore] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [atsScore, setAtsScore] = useState<any>(null)
  const [placementReadiness, setPlacementReadiness] = useState<any>(null)

  // States for show more/less
  const [showFullSuggestions, setShowFullSuggestions] = useState(false)
  const [showFullReadme, setShowFullReadme] = useState(false)
  const [showFullAI, setShowFullAI] = useState(false)

  // Extract username if URL was passed
  useEffect(() => {
    if (username && (username.includes('github.com') || username.includes('/') || username.includes('http'))) {
      const extracted = extractGitHubUsername(username)
      if (extracted && extracted !== username) {
        router.replace(`/analyze/${encodeURIComponent(extracted)}`)
        return
      }
    }
  }, [username, router])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        const usernamePattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/
        if (!usernamePattern.test(username)) {
          throw new Error('Invalid GitHub username format')
        }
        
        const githubData = await fetchGitHubData(username)
        
        if (!githubData.profile || !githubData.profile.login) {
          throw new Error('User not found')
        }
        
        setData(githubData)
        
        const analysis = analyzeProfile(githubData)
        const calculatedScore = calculateScore(analysis)
        setScore(calculatedScore)
        setSuggestions(analysis.suggestions)
        
        // Calculate ATS Score and Placement Readiness
        const ats = calculateATSScore(githubData.profile, githubData.repos, githubData.events)
        setAtsScore(ats)
        setPlacementReadiness(getPlacementReadiness(ats.overall))
        
        // Get AI analysis from Ollama
        try {
          const aiRes = await fetch('/api/ai-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profileData: githubData.profile,
              reposData: githubData.repos,
              score: calculatedScore,
              suggestions: analysis.suggestions
            })
          })
          
          const aiData = await aiRes.json()
          
          if (aiData.analysis) {
            setAiAnalysis(aiData.analysis)
          } else if (aiData.error) {
            setUsingFallback(true)
            setAiAnalysis({
              summary: `Analysis complete for ${githubData.profile.login}`,
              recruiterThoughts: "Ollama is not running. Start it with 'ollama serve' to get AI-powered insights.",
              strengths: analysis.suggestions.filter(s => s.includes('✅')).slice(0, 3),
              improvements: analysis.suggestions.filter(s => !s.includes('✅')).slice(0, 3),
              actionItems: analysis.suggestions.slice(0, 3),
              hireability: calculatedScore >= 7 ? "High" : calculatedScore >= 5 ? "Medium" : "Low",
              bestProject: githubData.repos[0]?.name || "No significant projects found",
              aiModel: 'Rule-based (Ollama not available)'
            })
          }
        } catch (aiError) {
          console.error('AI analysis error:', aiError)
          setUsingFallback(true)
          setAiAnalysis({
            summary: `Profile analysis completed for ${githubData.profile.login}`,
            recruiterThoughts: "Start Ollama with 'ollama serve' to enable AI-powered insights for better recommendations.",
            strengths: analysis.suggestions.filter(s => s.includes('✅')).slice(0, 3),
            improvements: analysis.suggestions.filter(s => !s.includes('✅')).slice(0, 3),
            actionItems: analysis.suggestions.slice(0, 3),
            hireability: calculatedScore >= 7 ? "High" : calculatedScore >= 5 ? "Medium" : "Low",
            bestProject: githubData.repos[0]?.name || "No significant projects found",
            aiModel: 'Rule-based (Fallback)'
          })
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    
    if (username && !username.includes('github.com') && !username.includes('/')) {
      loadData()
    }
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.3)' }}
          >
            <source src="/earth.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative z-10 text-center backdrop-blur-md bg-white/20 p-8 rounded-2xl border border-white/30 shadow-xl">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-white font-medium">Analyzing GitHub profile...</p>
          <p className="text-sm text-white/80 mt-2">Fetching repositories and activity data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.3)' }}
          >
            <source src="/earth.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative z-10 text-center max-w-md backdrop-blur-md bg-white/20 p-8 rounded-2xl border border-white/30 shadow-xl">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-white text-xl font-semibold mb-2">Failed to load profile</p>
          <p className="text-white/80 mb-4">{error}</p>
          <a href="/" className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition">
            Back to Search
          </a>
        </div>
      </div>
    )
  }

  if (!data || !data.profile) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.3)' }}
          >
            <source src="/earth.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative z-10 text-center backdrop-blur-md bg-white/20 p-8 rounded-2xl border border-white/30 shadow-xl">
          <p className="text-white">No profile data available</p>
          <a href="/" className="text-blue-200 hover:text-white mt-4 inline-block">Go back</a>
        </div>
      </div>
    )
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
          style={{ filter: 'brightness(0.4)' }}
        >
          <source src="/earth.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative z-10 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <a 
              href="/" 
              className="text-white hover:text-white/80 inline-flex items-center gap-2 transition text-sm backdrop-blur-md bg-white/20 px-3 py-1 rounded-lg border border-white/30"
            >
              ← Back to search
            </a>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column - Profile Photo & Basic Info */}
            <div className="lg:col-span-4">
              <ScoreCard 
                profile={data.profile} 
                score={score} 
                analysis={aiAnalysis}
              />
            </div>

            {/* Right Column - Collapsible Sections */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Suggestions & Improvements Section */}
              <CollapsibleSection 
                title="Suggestions & Improvements" 
                icon={FaLightbulb}
                defaultOpen={false}
                badge={`${suggestions.filter(s => s.includes('✅')).length}/${suggestions.length} completed`}
              >
                <SuggestionsList suggestions={suggestions} />
                
                {/* Progress indicator */}
                <div className="mt-4 pt-3 border-t border-white/20">
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>Overall Progress</span>
                    <span>{suggestions.filter(s => s.includes('✅')).length}/{suggestions.length} completed</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(suggestions.filter(s => s.includes('✅')).length / suggestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Repository & README Analysis Section */}
              <CollapsibleSection 
                title="Repository & README Analysis" 
                icon={FaBook}
                defaultOpen={false}
                badge={`${data.repos.length} total repositories`}
              >
                <ReadmeAnalyzer repos={data.repos} showFull={true} />
              </CollapsibleSection>

              {/* AI Analysis Section */}
              <CollapsibleSection 
                title="AI Analysis" 
                icon={FaRobot}
                defaultOpen={false}
                badge={aiAnalysis?.aiModel || "AI Powered"}
              >
                {aiAnalysis ? (
                  <div className="space-y-3">
                    <div className="backdrop-blur-sm bg-white/10 p-3 rounded-lg border border-white/20">
                      <h3 className="font-semibold text-white mb-1 flex items-center gap-1 text-xs">
                        <span>📊</span> Summary
                      </h3>
                      <p className="text-xs text-white/90 leading-relaxed">{aiAnalysis.summary}</p>
                    </div>
                    
                    <div className="backdrop-blur-sm bg-white/10 p-3 rounded-lg border border-white/20">
                      <h3 className="font-semibold text-white mb-1 flex items-center gap-1 text-xs">
                        <span>👔</span> Recruiter's Perspective
                      </h3>
                      <p className="text-xs text-white/90 italic leading-relaxed">"{aiAnalysis.recruiterThoughts}"</p>
                    </div>
                    
                    {aiAnalysis.hireability && (
                      <div className={`p-3 rounded-lg border border-white/20 backdrop-blur-sm ${
                        aiAnalysis.hireability.includes('High') ? 'bg-green-500/20' : 
                        aiAnalysis.hireability.includes('Medium') ? 'bg-yellow-500/20' : 'bg-red-500/20'
                      }`}>
                        <h3 className={`font-semibold mb-0.5 flex items-center gap-1 text-xs text-white`}>
                          <span>🎯</span> Hireability Rating
                        </h3>
                        <p className="text-xs text-white/90">{aiAnalysis.hireability}</p>
                      </div>
                    )}
                    
                    {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-green-300 mb-2 flex items-center gap-1 text-xs">
                          <span>✅</span> Key Strengths
                        </h3>
                        <div className="space-y-1.5">
                          {(showFullAI ? aiAnalysis.strengths : aiAnalysis.strengths.slice(0, 4)).map((strength: string, i: number) => (
                            <div key={i} className="flex items-start gap-1.5 p-1.5 bg-green-500/20 rounded-md border border-green-500/30">
                              <span className="text-green-300 text-xs">✓</span>
                              <span className="text-xs text-white/90">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {aiAnalysis.improvements && aiAnalysis.improvements.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-orange-300 mb-2 flex items-center gap-1 text-xs">
                          <span>⚠️</span> Areas to Improve
                        </h3>
                        <div className="space-y-1.5">
                          {(showFullAI ? aiAnalysis.improvements : aiAnalysis.improvements.slice(0, 4)).map((improvement: string, i: number) => (
                            <div key={i} className="flex items-start gap-1.5 p-1.5 bg-orange-500/20 rounded-md border border-orange-500/30">
                              <span className="text-orange-300 text-xs">!</span>
                              <span className="text-xs text-white/90">{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {aiAnalysis.actionItems && aiAnalysis.actionItems.length > 0 && (
                      <div className="backdrop-blur-sm bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                        <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-1 text-xs">
                          <span>🎯</span> Action Items
                        </h3>
                        <div className="space-y-1.5">
                          {(showFullAI ? aiAnalysis.actionItems : aiAnalysis.actionItems.slice(0, 3)).map((item: string, i: number) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-blue-300 font-bold text-xs">{i + 1}.</span>
                              <span className="text-xs text-white/90">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {aiAnalysis.actionItems && aiAnalysis.actionItems.length > 3 && (
                      <button
                        onClick={() => setShowFullAI(!showFullAI)}
                        className="mt-2 w-full text-center text-xs text-white/80 hover:text-white font-medium py-1.5 border-t border-white/20 hover:bg-white/10 transition rounded-md"
                      >
                        {showFullAI ? 'Show less ▲' : `Show more (${aiAnalysis.actionItems.length - 3} more) ▼`}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">🤖</span>
                    </div>
                    <p className="text-white/80 text-sm">Loading AI analysis...</p>
                  </div>
                )}
              </CollapsibleSection>

              {/* ATS Portfolio Score Section */}
              <CollapsibleSection 
                title="ATS Portfolio Score" 
                icon={FaChartLine}
                defaultOpen={false}
                badge={atsScore ? `Score: ${atsScore.overall}/100` : "Calculating..."}
              >
                {atsScore && <ATSScoreCard atsScore={atsScore} />}
              </CollapsibleSection>

              {/* Placement Readiness Section */}
              <CollapsibleSection 
                title="Placement Readiness" 
                icon={FaBriefcase}
                defaultOpen={false}
                badge={placementReadiness?.level || "Analyzing..."}
              >
                {placementReadiness && <PlacementReadiness readiness={placementReadiness} />}
              </CollapsibleSection>

              {/* Compare with Top Developers Section */}
              <CollapsibleSection 
                title="Compare with Top Developers" 
                icon={FaUsers}
                defaultOpen={false}
                badge="Benchmark your profile"
              >
                <CompareProfiles 
                  currentProfile={data.profile}
                  currentScore={score}
                />
              </CollapsibleSection>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating AI Chatbot - Transparent Design */}
      <AIChatBot 
        profileData={data.profile}
        suggestions={suggestions}
        score={score}
      />
    </main>
  )
}