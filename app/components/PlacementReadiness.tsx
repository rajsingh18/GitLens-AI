import { FaBriefcase, FaRocket, FaLightbulb } from 'react-icons/fa'

interface PlacementReadinessProps {
  readiness: {
    level: string
    message: string
    companies: string[]
    recommendedActions: string[]
  }
}

export default function PlacementReadiness({ readiness }: PlacementReadinessProps) {
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Excellent': return 'from-green-500 to-emerald-600'
      case 'Good': return 'from-blue-500 to-indigo-600'
      case 'Average': return 'from-yellow-500 to-orange-600'
      case 'Needs Improvement': return 'from-orange-500 to-red-600'
      default: return 'from-red-500 to-pink-600'
    }
  }

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'Excellent': return '🏆'
      case 'Good': return '👍'
      case 'Average': return '📊'
      case 'Needs Improvement': return '⚠️'
      default: return '🌱'
    }
  }

  const getLevelBg = (level: string) => {
    switch(level) {
      case 'Excellent': return 'bg-green-500/20 border-green-500/30'
      case 'Good': return 'bg-blue-500/20 border-blue-500/30'
      case 'Average': return 'bg-yellow-500/20 border-yellow-500/30'
      case 'Needs Improvement': return 'bg-orange-500/20 border-orange-500/30'
      default: return 'bg-red-500/20 border-red-500/30'
    }
  }

  return (
    <div className="space-y-4">
      {/* Level and Message */}
      <div className="text-center mb-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getLevelBg(readiness.level)} border-2 backdrop-blur-sm mb-2`}>
          <span className="text-2xl">{getLevelIcon(readiness.level)}</span>
        </div>
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-gradient-to-r ${getLevelColor(readiness.level)} text-white shadow-lg`}>
          {readiness.level}
        </div>
        <p className="text-sm text-white/90 mt-3 font-medium">{readiness.message}</p>
      </div>
      
      {/* Companies */}
      {readiness.companies && readiness.companies.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-white/80 mb-2 flex items-center gap-1">
            <FaRocket className="text-purple-400" /> Target Companies
          </h3>
          <div className="flex flex-wrap gap-2">
            {readiness.companies.map((company, i) => (
              <span key={i} className="text-xs backdrop-blur-sm bg-white/10 text-white/80 px-2 py-1 rounded-full border border-white/20">
                {company}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommended Actions */}
      {readiness.recommendedActions && readiness.recommendedActions.length > 0 && (
        <div className="p-3 backdrop-blur-sm bg-blue-500/10 rounded-lg border border-blue-500/30">
          <h3 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1">
            <FaLightbulb /> Recommended Actions
          </h3>
          <ul className="space-y-1.5">
            {readiness.recommendedActions.map((action, i) => (
              <li key={i} className="text-xs text-white/80 flex items-start gap-1">
                <span className="text-blue-400">→</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}