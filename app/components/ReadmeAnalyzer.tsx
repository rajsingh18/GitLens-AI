'use client'
import { FaBook, FaCheck, FaTimes, FaStar, FaCodeBranch, FaExclamationTriangle, FaGithub, FaHeartbeat, FaFileAlt } from 'react-icons/fa'
import { useState, useEffect } from 'react'

interface ReadmeAnalyzerProps {
  repos: any[]
  showFull?: boolean
}

interface ReadmeStatus {
  [key: string]: {
    hasReadme: boolean
    quality: string
    suggestions: string[]
  }
}

export default function ReadmeAnalyzer({ repos, showFull = false }: ReadmeAnalyzerProps) {
  const [expandedRepo, setExpandedRepo] = useState<number | null>(null)
  const [readmeStatus, setReadmeStatus] = useState<ReadmeStatus>({})
  const [loading, setLoading] = useState(true)
  const displayRepos = showFull ? repos : repos.slice(0, 3)

  useEffect(() => {
    async function fetchReadmeStatus() {
      const status: ReadmeStatus = {}
      for (const repo of displayRepos) {
        try {
          const response = await fetch(`/api/github/readme?owner=${repo.owner?.login || repo.owner}&repo=${repo.name}`)
          const data = await response.json()
          status[repo.name] = {
            hasReadme: data.hasReadme,
            quality: data.quality,
            suggestions: data.suggestions || []
          }
        } catch (error) {
          status[repo.name] = {
            hasReadme: false,
            quality: 'Unknown',
            suggestions: ['Could not check README']
          }
        }
      }
      setReadmeStatus(status)
      setLoading(false)
    }
    
    if (displayRepos.length > 0) {
      fetchReadmeStatus()
    }
  }, [displayRepos])

  const getHealthColor = (hasReadme: boolean, quality: string) => {
    if (!hasReadme) return 'bg-red-100 text-red-700 border-red-200'
    if (quality === 'Excellent') return 'bg-green-100 text-green-700 border-green-200'
    if (quality === 'Good') return 'bg-blue-100 text-blue-700 border-blue-200'
    if (quality === 'Basic') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-orange-100 text-orange-700 border-orange-200'
  }

  const getReadmeIcon = (hasReadme: boolean, quality: string) => {
    if (!hasReadme) return '❌'
    if (quality === 'Excellent') return '📖✨'
    if (quality === 'Good') return '📖✅'
    if (quality === 'Basic') return '📖⚠️'
    return '📖❌'
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-100 text-yellow-700',
      'TypeScript': 'bg-blue-100 text-blue-700',
      'Python': 'bg-green-100 text-green-700',
      'Java': 'bg-red-100 text-red-700',
      'Go': 'bg-cyan-100 text-cyan-700',
      'Rust': 'bg-orange-100 text-orange-700',
      'Ruby': 'bg-pink-100 text-pink-700',
      'HTML': 'bg-orange-100 text-orange-700',
      'CSS': 'bg-purple-100 text-purple-700',
    }
    return colors[language] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="loader mx-auto mb-4 w-8 h-8"></div>
        <p className="text-sm text-gray-500">Loading repositories...</p>
      </div>
    )
  }

  if (displayRepos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaGithub className="text-gray-400 text-2xl" />
        </div>
        <p className="text-gray-600 font-medium">No repositories found</p>
        <p className="text-sm text-gray-500 mt-1">Create some repositories to showcase your work!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayRepos.map((repo) => {
        const readme = readmeStatus[repo.name] || { hasReadme: false, quality: 'None', suggestions: [] }
        return (
          <div 
            key={repo.id} 
            className="border border-gray-200 rounded-xl hover:border-purple-200 transition-all hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <a 
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:text-purple-600 hover:underline inline-flex items-center gap-2 text-sm"
                  >
                    <FaGithub className="text-gray-400 text-sm" />
                    {repo.name}
                  </a>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      <span>{repo.stargazers_count} stars</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCodeBranch className="text-blue-500" />
                      <span>{repo.forks_count} forks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaExclamationTriangle className="text-orange-500" />
                      <span>{repo.open_issues_count} issues</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${getHealthColor(readme.hasReadme, readme.quality)}`}>
                    <FaFileAlt className="text-xs" />
                    <span className="text-xs font-medium">
                      {readme.hasReadme ? `${readme.quality} README` : 'No README'}
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedRepo(expandedRepo === repo.id ? null : repo.id)}
                    className="text-gray-400 hover:text-purple-600 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedRepo === repo.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  </button>
                </div>
              </div>
              
              {repo.description && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{repo.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-3">
                {repo.language && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLanguageColor(repo.language)}`}>
                    {repo.language}
                  </span>
                )}
                {repo.homepage && (
                  <a 
                    href={repo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-1 rounded-full hover:from-green-200 hover:to-emerald-200 transition font-medium"
                  >
                    Live Demo →
                  </a>
                )}
              </div>
              
              {expandedRepo === repo.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-700 mb-2 text-xs flex items-center gap-2">
                      <FaFileAlt /> README Analysis
                    </h4>
                    
                    {readme.hasReadme ? (
                      <>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Documentation Quality:</span>
                            <span className={`font-semibold text-xs ${
                              readme.quality === 'Excellent' ? 'text-green-600' :
                              readme.quality === 'Good' ? 'text-blue-600' :
                              readme.quality === 'Basic' ? 'text-yellow-600' : 'text-orange-600'
                            }`}>
                              {readme.quality}
                            </span>
                          </div>
                        </div>
                        
                        {readme.suggestions && readme.suggestions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Suggestions:</p>
                            <ul className="text-xs space-y-1">
                              {readme.suggestions.slice(0, 2).map((suggestion, idx) => (
                                <li key={idx} className="text-gray-600 flex items-start gap-1">
                                  <span className="text-blue-500">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs text-red-600 mb-1">⚠️ No README file found</p>
                        <p className="text-xs text-gray-600">Add a README.md to explain your project</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
      
      {/* Summary Stats */}
      {displayRepos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {Object.values(readmeStatus).filter(r => r.hasReadme && r.quality === 'Excellent').length}
              </div>
              <div className="text-xs text-gray-600">Excellent READMEs</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {Object.values(readmeStatus).filter(r => !r.hasReadme).length}
              </div>
              <div className="text-xs text-gray-600">Missing READMEs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}