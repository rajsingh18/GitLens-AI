import { FaCheckCircle, FaExclamationCircle, FaLightbulb, FaClipboardList } from 'react-icons/fa'

interface SuggestionsListProps {
  suggestions: string[]
}

export default function SuggestionsList({ suggestions }: SuggestionsListProps) {
  const getIcon = (suggestion: string) => {
    if (suggestion.includes('✅')) return <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
    if (suggestion.includes('⚠️')) return <FaExclamationCircle className="text-yellow-400 mt-1 flex-shrink-0" />
    return <FaLightbulb className="text-blue-400 mt-1 flex-shrink-0" />
  }

  const getBgColor = (suggestion: string) => {
    if (suggestion.includes('✅')) return 'backdrop-blur-sm bg-green-500/10 border-green-500/30'
    if (suggestion.includes('⚠️')) return 'backdrop-blur-sm bg-yellow-500/10 border-yellow-500/30'
    return 'backdrop-blur-sm bg-blue-500/10 border-blue-500/30'
  }

  return (
    <div>
      {suggestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 backdrop-blur-sm bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <FaCheckCircle className="text-green-400 text-2xl" />
          </div>
          <p className="text-white font-medium">No suggestions available</p>
          <p className="text-sm text-white/70 mt-1">Your profile is looking great!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className={`flex gap-3 p-4 rounded-xl border ${getBgColor(suggestion)} hover:shadow-lg transition-all group backdrop-blur-sm`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(suggestion)}
              </div>
              <div className="flex-1">
                <span className="text-white/90 leading-relaxed text-sm">{suggestion}</span>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                <span className="text-xs text-white/50">#{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}