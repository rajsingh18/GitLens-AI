import { analyzeActivityPatterns, analyzeRepoHealth, calculateReadmeScore } from './repoAnalyzer'

interface ReadmeAnalysis {
  hasReadme: boolean
  quality: 'Excellent' | 'Good' | 'Basic' | 'Poor' | 'None'
  sections: {
    hasInstallation: boolean
    hasUsage: boolean
    hasApi: boolean
    hasContributing: boolean
    hasLicense: boolean
    hasTests: boolean
    hasExamples: boolean
  }
  suggestions: string[]
}

export function analyzeProfile(data: any) {
  const { profile, repos, events, readmes } = data
  const suggestions: string[] = []
  
  // ============ PROFILE COMPLETENESS ============
  
  // 1. Name check
  if (!profile.name || profile.name.length < 2) {
    suggestions.push("👤 Add your full name to appear more professional")
  } else {
    suggestions.push("✅ Professional name displayed on profile")
  }
  
  // 2. Bio check
  if (!profile.bio || profile.bio.length < 30) {
    suggestions.push("📝 Add a detailed bio (at least 30 characters) explaining your skills and interests")
  } else if (profile.bio.length > 100) {
    suggestions.push("✅ Great! Detailed bio that helps recruiters understand your expertise")
  } else if (profile.bio.length > 50) {
    suggestions.push("✓ Good bio, consider adding more specific tech stack details")
  }
  
  // 3. Email and company
  if (!profile.email && !profile.company) {
    suggestions.push("📧 Add your email or company - recruiters need a way to contact you")
  } else if (profile.email || profile.company) {
    suggestions.push("✅ Contact information provided")
  }
  
  // 4. Portfolio/Website
  if (!profile.blog) {
    suggestions.push("🔗 Add your portfolio website or blog link to showcase your work")
  } else {
    suggestions.push("✅ Portfolio/website linked on profile")
  }
  
  // 5. Location
  if (!profile.location) {
    suggestions.push("📍 Add your location for better job match opportunities")
  } else {
    suggestions.push("✓ Location specified")
  }
  
  // ============ REPOSITORY ANALYSIS ============
  
  const totalRepos = repos.length || 0
  
  // 6. Repository count
  if (totalRepos === 0) {
    suggestions.push("📦 No repositories found! Start creating projects to showcase your skills")
  } else if (totalRepos < 5) {
    suggestions.push(`📦 Only ${totalRepos} repositories - aim for at least 10 quality projects`)
  } else if (totalRepos > 20) {
    suggestions.push(`✅ Active contributor with ${totalRepos} repositories!`)
  } else {
    suggestions.push(`✓ Good number of repositories (${totalRepos})`)
  }
  
  // 7. Repository quality with stars
  const reposWithStars = repos.filter((r: any) => r.stargazers_count > 5)
  const totalStars = repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0)
  
  if (totalStars > 100) {
    suggestions.push(`⭐ Excellent! Your projects have ${totalStars} total stars - strong community engagement`)
  } else if (totalStars > 50) {
    suggestions.push(`⭐ Good engagement with ${totalStars} total stars across repositories`)
  } else if (totalStars > 0 && totalStars < 10) {
    suggestions.push("⭐ Your projects need more visibility - share them on social media")
  } else if (totalStars === 0 && totalRepos > 0) {
    suggestions.push("⭐ No stars on any repository - focus on solving real-world problems")
  }
  
  // ============ README ANALYSIS (NEW) ============
  
  if (readmes && Object.keys(readmes).length > 0) {
    const readmeList = Object.values(readmes) as ReadmeAnalysis[]
    const reposWithReadme = readmeList.filter(r => r.hasReadme).length
    const excellentReadmes = readmeList.filter(r => r.quality === 'Excellent').length
    const goodReadmes = readmeList.filter(r => r.quality === 'Good').length
    const basicReadmes = readmeList.filter(r => r.quality === 'Basic').length
    
    // 8. README existence
    if (reposWithReadme === 0 && totalRepos > 0) {
      suggestions.push("📚 CRITICAL: No README files found! Add README.md to every repository explaining what it does")
    } else if (reposWithReadme < totalRepos * 0.5) {
      suggestions.push(`📝 Only ${reposWithReadme}/${totalRepos} repositories have README files - add documentation to the rest`)
    } else if (excellentReadmes > 0) {
      suggestions.push(`✅ ${excellentReadmes} excellent README files with comprehensive documentation!`)
    } else {
      suggestions.push("✓ Most repositories have README files")
    }
    
    // 9. README quality
    if (excellentReadmes > 2) {
      suggestions.push("📖 Outstanding documentation! Your README files are comprehensive and professional")
    } else if (goodReadmes > 2) {
      suggestions.push("📖 Good documentation quality - consider adding more examples and API details")
    } else if (basicReadmes > 0 && excellentReadmes === 0) {
      suggestions.push("📖 Improve README quality - add installation steps, usage examples, and contribution guidelines")
    }
    
    // 10. Missing README sections (aggregated)
    const missingInstallation = readmeList.some(r => r.sections && !r.sections.hasInstallation)
    const missingUsage = readmeList.some(r => r.sections && !r.sections.hasUsage)
    const missingLicense = readmeList.some(r => r.sections && !r.sections.hasLicense)
    const missingContributing = readmeList.some(r => r.sections && !r.sections.hasContributing)
    
    if (missingInstallation) {
      suggestions.push("🔧 Add installation instructions to your README files")
    }
    if (missingUsage) {
      suggestions.push("💡 Include usage examples and code snippets in your documentation")
    }
    if (missingLicense) {
      suggestions.push("📄 Add license files to your repositories (MIT, Apache, GPL)")
    }
    if (missingContributing) {
      suggestions.push("🤝 Add contributing guidelines to encourage open source collaboration")
    }
    
    // Collect all README suggestions
    const allReadmeSuggestions = readmeList.flatMap(r => r.suggestions || [])
    const uniqueSuggestions = [...new Set(allReadmeSuggestions)]
    if (uniqueSuggestions.length > 0 && reposWithReadme > 0) {
      suggestions.push(`📋 README improvements: ${uniqueSuggestions.slice(0, 2).join(', ')}`)
    }
  }
  
  // ============ LANGUAGE & TECH STACK ============
  
  const languages = new Set(repos.map((r: any) => r.language).filter(Boolean))
  const languageCount = languages.size
  
  // 11. Language diversity
  if (languageCount === 0 && totalRepos > 0) {
    suggestions.push("💻 No languages detected - make sure your repositories contain code files")
  } else if (languageCount === 1) {
    const mainLang = Array.from(languages)[0]
    suggestions.push(`💻 Currently using only ${mainLang} - learn complementary technologies like TypeScript or Python`)
  } else if (languageCount >= 3) {
    suggestions.push(`✅ Good tech stack variety with ${languageCount} different languages!`)
  } else if (languageCount === 2) {
    suggestions.push(`✓ Working with ${languageCount} languages - consider adding one more for versatility`)
  }
  
  // 12. Most used language recommendation
  if (languageCount > 0 && !Array.from(languages).some(l => l === 'TypeScript')) {
    suggestions.push("🎯 Consider adding TypeScript to your stack for better type safety")
  }
  
  // ============ ACTIVITY & CONSISTENCY ============
  
  if (events && events.length > 0) {
    const activity = analyzeActivityPatterns(events)
    
    // 13. Activity level
    if (activity.isActive) {
      suggestions.push(`✅ Active contributor with ${activity.totalCommitsLastYear} commits in the last year!`)
    } else if (activity.needsImprovement) {
      suggestions.push(`📅 Low activity (${activity.totalCommitsLastYear || 0} commits last year) - aim for regular contributions`)
    }
    
    // 14. Consistency
    if (activity.consistency > 70) {
      suggestions.push(`✅ Consistent contributor! ${activity.consistency}% weekly activity - great for building habits`)
    } else if (activity.consistency > 40) {
      suggestions.push(`✓ Moderate consistency (${activity.consistency}%) - try to maintain a regular schedule`)
    } else if (activity.consistency < 30 && activity.totalCommitsLastYear > 0) {
      suggestions.push("📅 Improve contribution consistency - spread commits throughout the year")
    }
    
    // 15. Streaks
    if (activity.currentStreak > 8) {
      suggestions.push(`🔥 On fire! ${activity.currentStreak} week current streak - keep it going!`)
    } else if (activity.longestStreak > 12) {
      suggestions.push(`✓ Had a ${activity.longestStreak} week streak - try to build another long streak`)
    } else if (activity.currentStreak === 0 && activity.totalCommitsLastYear > 0) {
      suggestions.push("🔄 Recent inactivity detected - make your first commit in a while to restart your streak")
    }
  } else {
    suggestions.push("📅 No recent activity detected - start contributing to build your GitHub presence")
  }
  
  // ============ REPOSITORY HEALTH ============
  
  if (repos && repos.length > 0) {
    const repoHealthScores = repos.map((r: any) => analyzeRepoHealth(r))
    const healthyRepos = repoHealthScores.filter(h => h.healthScore >= 70).length
    const avgHealthScore = repoHealthScores.reduce((sum, h) => sum + h.healthScore, 0) / repoHealthScores.length
    
    // 16. Overall repository health
    if (avgHealthScore > 70) {
      suggestions.push(`💪 Excellent repository health! Average score ${Math.round(avgHealthScore)}%`)
    } else if (avgHealthScore < 40) {
      suggestions.push(`⚠️ Repository health needs improvement (${Math.round(avgHealthScore)}% average)`)
    }
    
    // 17. Specific health issues
    const allRecommendations = repoHealthScores.flatMap(h => h.recommendations)
    const uniqueRecommendations = [...new Set(allRecommendations)]
    if (uniqueRecommendations.length > 0) {
      const topRecommendations = uniqueRecommendations.slice(0, 2)
      if (topRecommendations.length > 0) {
        suggestions.push(`🔧 ${topRecommendations.join(', ')}`)
      }
    }
    
    // 18. Inactive repositories
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const inactiveRepos = repos.filter((r: any) => new Date(r.updated_at) < sixMonthsAgo)
    
    if (inactiveRepos.length > 2) {
      suggestions.push(`⚠️ ${inactiveRepos.length} repositories inactive for 6+ months - consider updating or archiving`)
    } else if (inactiveRepos.length > 0) {
      suggestions.push(`🔄 ${inactiveRepos.length} stale repository(ies) - push updates or archive them`)
    }
  }
  
  // ============ FOLLOWERS & COMMUNITY ============
  
  const followers = profile.followers || 0
  const following = profile.following || 0
  
  // 19. Followers count
  if (followers > 100) {
    suggestions.push(`👥 Strong community presence with ${followers} followers - great for networking!`)
  } else if (followers > 30) {
    suggestions.push(`👥 Growing community with ${followers} followers`)
  } else if (followers < 10 && profile.created_at) {
    const accountAgeMonths = (new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 3600 * 24 * 30)
    if (accountAgeMonths > 6) {
      suggestions.push(`👥 Only ${followers} followers after ${Math.round(accountAgeMonths)} months - engage more with the community`)
    }
  }
  
  // 20. Following ratio
  const ratio = followers / (following || 1)
  if (ratio > 5) {
    suggestions.push("🎯 Excellent follower-to-following ratio - you're an influencer!")
  } else if (ratio < 0.5 && following > 20) {
    suggestions.push("🤝 You follow many but few follow back - focus on creating value through quality content")
  }
  
  // ============ ACCOUNT MATURITY ============
  
  if (profile.created_at) {
    const accountAgeMonths = (new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 3600 * 24 * 30)
    
    if (accountAgeMonths > 12 && totalRepos < 10) {
      suggestions.push(`⏰ Account is ${Math.round(accountAgeMonths)} months old but only ${totalRepos} repos - increase your activity`)
    } else if (accountAgeMonths < 6 && totalRepos > 5) {
      suggestions.push(`🚀 Great start! ${Math.round(accountAgeMonths)} month old account with ${totalRepos} repositories`)
    }
  }
  
  return { suggestions, score: null }
}

export function calculateScore(analysis: { suggestions: string[] }) {
  const totalChecks = 20 // Increased from 12 to 20 for more granular scoring
  
  const positiveSuggestions = analysis.suggestions.filter(
    s => s.includes('✅') || s.includes('✓') || s.includes('🎯') || s.includes('🔥') || s.includes('💪') || s.includes('📖')
  ).length
  
  const negativeSuggestions = analysis.suggestions.filter(
    s => !s.includes('✅') && !s.includes('✓') && !s.includes('🎯') && !s.includes('🔥') && !s.includes('💪') && 
         !s.includes('⚠️') && !s.includes('📚') && !s.includes('📝') && !s.includes('🔧')
  ).length
  
  // Calculate base score from positive vs negative
  let score = Math.floor((positiveSuggestions / totalChecks) * 10)
  
  // Adjust based on suggestion types
  const hasCriticalIssues = analysis.suggestions.some(s => 
    s.includes('CRITICAL') || s.includes('No repositories') || s.includes('No README')
  )
  
  if (hasCriticalIssues) {
    score = Math.min(score, 4) // Cap score at 4 if critical issues exist
  }
  
  const hasExcellentQuality = analysis.suggestions.some(s => 
    s.includes('Excellent') || s.includes('Outstanding')
  )
  
  if (hasExcellentQuality) {
    score = Math.max(score, 7) // Ensure at least 7 if quality is excellent
  }
  
  // Ensure score is between 0 and 10
  score = Math.max(0, Math.min(10, score))
  
  return score
}

// Helper function to get score color and label
export function getScoreDetails(score: number) {
  if (score >= 9) {
    return { label: 'Outstanding', color: 'from-purple-500 to-pink-600', message: '🏆 Exceptional profile! Ready for top tech companies' }
  } else if (score >= 8) {
    return { label: 'Excellent', color: 'from-green-500 to-emerald-600', message: '🎉 Excellent profile! Strong candidate for most roles' }
  } else if (score >= 7) {
    return { label: 'Very Good', color: 'from-blue-500 to-indigo-600', message: '👍 Very good profile! Minor improvements only' }
  } else if (score >= 6) {
    return { label: 'Good', color: 'from-cyan-500 to-blue-600', message: '📈 Good foundation - follow suggestions to improve' }
  } else if (score >= 5) {
    return { label: 'Average', color: 'from-yellow-500 to-orange-600', message: '📊 Average profile - needs moderate improvements' }
  } else if (score >= 3) {
    return { label: 'Needs Work', color: 'from-orange-500 to-red-600', message: '⚠️ Significant improvements needed' }
  } else {
    return { label: 'Beginner', color: 'from-red-500 to-pink-600', message: '🌱 Just starting - focus on building your profile' }
  }
}