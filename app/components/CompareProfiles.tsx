import { useState } from 'react'
import { FaGithub, FaStar, FaCodeBranch, FaUsers, FaChartLine } from 'react-icons/fa'

interface CompareProfilesProps {
  currentProfile: any
  currentScore: number
  onCompare?: (username: string) => void
}

export default function CompareProfiles({ currentProfile, currentScore, onCompare }: CompareProfilesProps) {
  const [compareUsername, setCompareUsername] = useState('')
  const [comparing, setComparing] = useState(false)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [error, setError] = useState('')

  const topDevelopers = [
    { username: 'octocat', name: 'Octocat', score: 9.5, reason: 'GitHub mascot with perfect profile' },
    { username: 'gaearon', name: 'Dan Abramov', score: 9.8, reason: 'React core team member' },
    { username: 'tj', name: 'TJ Holowaychuk', score: 9.9, reason: 'Legendary open source contributor' },
    { username: 'sindresorhus', name: 'Sindre Sorhus', score: 9.7, reason: 'Most starred GitHub user' },
  ]

  const handleCompare = async () => {
    if (!compareUsername.trim()) return
    
    setComparing(true)
    setError('')
    
    try {
      const response = await fetch(`/api/github?username=${compareUsername}`)
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setComparisonData(data)
        if (onCompare) onCompare(compareUsername)
      }
    } catch (err) {
      setError('Failed to fetch comparison data')
    } finally {
      setComparing(false)
    }
  }

  const getComparisonAdvice = () => {
    if (!comparisonData) return null
    
    const compareScore = comparisonData.profile.public_repos + (comparisonData.profile.followers / 10)
    const currentComparison = currentProfile.public_repos + (currentProfile.followers / 10)
    const difference = compareScore - currentComparison
    
    if (difference > 20) {
      return "This profile has significantly more activity. Focus on creating more quality repositories and engaging with the community."
    } else if (difference > 10) {
      return "This profile is ahead. Improve by adding more projects and increasing your contribution frequency."
    } else if (difference > 0) {
      return "You're close! Focus on documentation quality and consistency to catch up."
    } else {
      return "You're doing great! Keep maintaining your momentum and add more diverse projects."
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Developers Section */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-white/80 mb-2 flex items-center gap-1">🏆 Top Developer Benchmarks</h3>
        <div className="space-y-2">
          {topDevelopers.map((dev, i) => (
            <div key={i} className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/10 rounded-lg border border-white/20">
              <div className="flex items-center gap-2">
                <FaGithub className="text-white/60 text-sm" />
                <div>
                  <p className="text-xs font-medium text-white">{dev.name}</p>
                  <p className="text-xs text-white/60">@{dev.username}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-xs font-semibold text-white">{dev.score}</span>
                </div>
                <p className="text-xs text-white/50">{dev.reason}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/50 mt-2 italic">Based on followers, stars, and contributions</p>
      </div>
      
      {/* Compare Input */}
      <div className="border-t border-white/20 pt-4">
        <h3 className="text-xs font-semibold text-white/80 mb-2">Compare with another GitHub user</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={compareUsername}
            onChange={(e) => setCompareUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="flex-1 px-3 py-1.5 text-sm backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 text-white placeholder:text-white/50"
          />
          <button
            onClick={handleCompare}
            disabled={comparing || !compareUsername.trim()}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition shadow-lg"
          >
            {comparing ? '...' : 'Compare'}
          </button>
        </div>
        
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        
        {/* Comparison Results */}
        {comparisonData && (
          <div className="mt-3 p-3 backdrop-blur-sm bg-white/10 rounded-lg border border-white/20">
            <h4 className="text-xs font-semibold text-white/80 mb-2">
              vs @{comparisonData.profile.login}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-white/60">Repos:</p>
                <p className="font-semibold text-white">{currentProfile.public_repos} vs {comparisonData.profile.public_repos}</p>
              </div>
              <div>
                <p className="text-white/60">Followers:</p>
                <p className="font-semibold text-white">{currentProfile.followers} vs {comparisonData.profile.followers}</p>
              </div>
              <div>
                <p className="text-white/60">Following:</p>
                <p className="font-semibold text-white">{currentProfile.following} vs {comparisonData.profile.following}</p>
              </div>
              <div>
                <p className="text-white/60">Repos with README:</p>
                <p className="font-semibold text-white">-</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/20">
              <p className="text-xs text-blue-300">{getComparisonAdvice()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}