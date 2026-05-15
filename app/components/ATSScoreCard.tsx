import { FaChartLine, FaInfoCircle } from 'react-icons/fa'

interface ATSScoreCardProps {
  atsScore: any
}

export default function ATSScoreCard({ atsScore }: ATSScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-blue-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30'
    if (score >= 60) return 'bg-blue-500/20 border-blue-500/30'
    if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="text-center mb-4">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBg(atsScore.overall)} border-2 backdrop-blur-sm`}>
          <span className={`text-3xl font-bold ${getScoreColor(atsScore.overall)}`}>{atsScore.overall}</span>
        </div>
        <p className="text-xs text-white/70 mt-2">out of 100</p>
      </div>
      
      {/* Breakdown bars */}
      <div className="space-y-3 mb-4">
        {Object.entries(atsScore.breakdown).map(([key, value]: [string, any]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/80">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className={`font-semibold ${getScoreColor(value)}`}>{Math.round(value)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`rounded-full h-1.5 transition-all duration-500 ${
                  value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-blue-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Keywords Found */}
      {atsScore.keywordsFound && atsScore.keywordsFound.length > 0 && (
        <div className="mb-3 p-3 backdrop-blur-sm bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-xs font-semibold text-green-400 mb-1">✓ Keywords Found ({atsScore.keywordsFound.length})</p>
          <div className="flex flex-wrap gap-1">
            {atsScore.keywordsFound.slice(0, 8).map((kw: string, i: number) => (
              <span key={i} className="text-xs backdrop-blur-sm bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full border border-green-500/30">#{kw}</span>
            ))}
          </div>
        </div>
      )}
      
      {/* Keywords Missing */}
      {atsScore.keywordsMissing && atsScore.keywordsMissing.length > 0 && (
        <div className="mb-3 p-3 backdrop-blur-sm bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <p className="text-xs font-semibold text-yellow-400 mb-1">⚠️ Missing Keywords ({atsScore.keywordsMissing.length})</p>
          <div className="flex flex-wrap gap-1">
            {atsScore.keywordsMissing.slice(0, 8).map((kw: string, i: number) => (
              <span key={i} className="text-xs backdrop-blur-sm bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full border border-yellow-500/30">#{kw}</span>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommendations */}
      {atsScore.recommendations && atsScore.recommendations.length > 0 && (
        <div className="mt-3 p-3 backdrop-blur-sm bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-xs font-semibold text-blue-400 mb-1">📋 Recommendations</p>
          <ul className="space-y-1">
            {atsScore.recommendations.slice(0, 3).map((rec: string, i: number) => (
              <li key={i} className="text-xs text-white/80 flex items-start gap-1">
                <FaInfoCircle className="text-blue-400 text-xs mt-0.5 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}