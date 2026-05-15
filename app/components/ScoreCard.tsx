// app/components/ScoreCard.tsx
import { FaGithub, FaUsers, FaCodeBranch, FaStar, FaBuilding, FaMapMarkerAlt, FaLink as FaLinkIcon } from 'react-icons/fa'

interface ScoreCardProps {
  profile: any
  score: number
  analysis: any
}

export default function ScoreCard({ profile, score, analysis }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-green-500 to-emerald-600'
    if (score >= 6) return 'from-blue-500 to-indigo-600'
    if (score >= 4) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  const getScoreText = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Average'
    return 'Needs Work'
  }

  return (
    <div className="backdrop-blur-md bg-white/20 rounded-xl overflow-hidden border border-white/30 shadow-xl">
      {/* Profile Header with Gradient Background */}
      <div className={`bg-gradient-to-r ${getScoreColor(score)} p-6 text-white text-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative">
          <img 
            src={profile.avatar_url} 
            alt={profile.login}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-3"
          />
          <h2 className="text-xl font-bold text-white drop-shadow-md">{profile.name || profile.login}</h2>
          {profile.bio && (
            <p className="text-sm text-white/90 mt-1 line-clamp-2">{profile.bio}</p>
          )}
          <a 
            href={profile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm bg-white/20 rounded-full px-3 py-1 mt-2 hover:bg-white/30 transition"
          >
            <FaGithub className="text-sm" /> @{profile.login}
          </a>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 backdrop-blur-sm bg-white/10 rounded-xl border border-white/20">
            <FaCodeBranch className="text-blue-300 text-xl mx-auto mb-1" />
            <div className="font-bold text-white">{profile.public_repos}</div>
            <p className="text-xs text-white/70">Repositories</p>
          </div>
          <div className="text-center p-3 backdrop-blur-sm bg-white/10 rounded-xl border border-white/20">
            <FaUsers className="text-green-300 text-xl mx-auto mb-1" />
            <div className="font-bold text-white">{profile.followers}</div>
            <p className="text-xs text-white/70">Followers</p>
          </div>
          <div className="text-center p-3 backdrop-blur-sm bg-white/10 rounded-xl border border-white/20">
            <FaStar className="text-yellow-300 text-xl mx-auto mb-1" />
            <div className="font-bold text-white">{profile.public_gists || 0}</div>
            <p className="text-xs text-white/70">Gists</p>
          </div>
          <div className="text-center p-3 backdrop-blur-sm bg-white/10 rounded-xl border border-white/20">
            <FaUsers className="text-purple-300 text-xl mx-auto mb-1" />
            <div className="font-bold text-white">{profile.following}</div>
            <p className="text-xs text-white/70">Following</p>
          </div>
        </div>
        
        {/* Score Circle */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getScoreColor(score)} flex items-center justify-center shadow-lg`}>
              <div className="w-28 h-28 rounded-full backdrop-blur-md bg-white/20 flex items-center justify-center border border-white/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white drop-shadow-md">{score}</div>
                  <div className="text-xs text-white/80">/10</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              score >= 8 ? 'bg-green-500/30 text-green-100 border border-green-500/50' :
              score >= 6 ? 'bg-blue-500/30 text-blue-100 border border-blue-500/50' :
              score >= 4 ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-500/50' :
              'bg-red-500/30 text-red-100 border border-red-500/50'
            }`}>
              {getScoreText(score)}
            </span>
          </div>
        </div>
        
        {/* Resume Readiness */}
        <div className="p-4 backdrop-blur-sm bg-white/10 rounded-xl border border-white/20">
          <p className="text-sm font-semibold text-white mb-2 drop-shadow-sm">Resume Readiness</p>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className={`bg-gradient-to-r ${getScoreColor(score)} h-2 rounded-full transition-all duration-1000`}
              style={{ width: `${score * 10}%` }}
            ></div>
          </div>
          <p className="text-xs text-white/80 mt-2">
            {score >= 8 ? "🎉 Excellent! Ready for top companies" :
             score >= 6 ? "👍 Good! Minor improvements needed" :
             score >= 4 ? "📈 Average! Follow suggestions to improve" :
             "💪 Needs work! Focus on building your profile"}
          </p>
        </div>

        {/* Additional Info */}
        {(profile.company || profile.location || profile.blog) && (
          <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
            {profile.company && (
              <div className="flex items-center gap-2 text-sm text-white/80">
                <FaBuilding className="text-white/60" />
                <span>{profile.company}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-white/80">
                <FaMapMarkerAlt className="text-white/60" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.blog && (
              <div className="flex items-center gap-2 text-sm">
                <FaLinkIcon className="text-white/60" />
                <a href={profile.blog} target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition">
                  Portfolio
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}