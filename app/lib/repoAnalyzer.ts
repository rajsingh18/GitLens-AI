export interface RepoHealth {
  healthScore: number
  status: 'Healthy' | 'Needs Attention' | 'Inactive' | 'Critical'
  recommendations: string[]
  metrics: {
    stars: number
    forks: number
    issues: number
    hasReadme: boolean
    recentUpdate: boolean
    hasLicense: boolean
  }
}

export function analyzeRepoHealth(repo: any): RepoHealth {
  const issues = repo.open_issues_count || 0
  const stars = repo.stargazers_count || 0
  const forks = repo.forks_count || 0
  const hasReadme = repo.description && repo.description.length > 50
  const hasRecentUpdate = new Date(repo.updated_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const hasLicense = repo.license !== null
  
  let healthScore = 0
  const recommendations: string[] = []
  
  // Stars score (30 points)
  if (stars > 50) healthScore += 30
  else if (stars > 20) healthScore += 25
  else if (stars > 10) healthScore += 20
  else if (stars > 5) healthScore += 15
  else if (stars > 0) healthScore += 10
  else recommendations.push(`⭐ Promote ${repo.name} to attract more users`)
  
  // README score (25 points)
  if (hasReadme) healthScore += 25
  else recommendations.push(`📝 Add a detailed README to ${repo.name}`)
  
  // Recent update score (25 points)
  if (hasRecentUpdate) healthScore += 25
  else recommendations.push(`🔄 Update ${repo.name} with recent changes`)
  
  // Issues management (20 points)
  if (issues === 0) healthScore += 20
  else if (issues < 3) healthScore += 15
  else if (issues < 10) healthScore += 10
  else if (issues < 20) healthScore += 5
  else recommendations.push(`🐛 Address open issues in ${repo.name} (${issues} issues)`)
  
  // License bonus (bonus points)
  if (hasLicense) healthScore += 5
  else recommendations.push(`📄 Add a license to ${repo.name}`)
  
  // Forks bonus (points)
  if (forks > 10) healthScore += 5
  else if (forks > 5) healthScore += 3
  
  let status: RepoHealth['status'] = 'Healthy'
  if (healthScore >= 70) status = 'Healthy'
  else if (healthScore >= 50) status = 'Needs Attention'
  else if (healthScore >= 30) status = 'Inactive'
  else status = 'Critical'
  
  return {
    healthScore: Math.min(100, healthScore),
    status,
    recommendations,
    metrics: {
      stars,
      forks,
      issues,
      hasReadme,
      recentUpdate: hasRecentUpdate,
      hasLicense
    }
  }
}

export function analyzeActivityPatterns(events: any[]) {
  const lastYear = new Date()
  lastYear.setFullYear(lastYear.getFullYear() - 1)
  
  const recentEvents = events.filter((e: any) => new Date(e.created_at) > lastYear)
  
  // Calculate streaks
  const commits = recentEvents.filter((e: any) => e.type === 'PushEvent')
  const weeklyActivity = new Array(52).fill(0)
  
  commits.forEach((commit: any) => {
    const weeksAgo = Math.floor((new Date().getTime() - new Date(commit.created_at).getTime()) / (1000 * 3600 * 24 * 7))
    if (weeksAgo < 52 && weeksAgo >= 0) {
      weeklyActivity[weeksAgo]++
    }
  })
  
  const activeWeeks = weeklyActivity.filter(w => w > 0).length
  const consistency = (activeWeeks / 52) * 100
  
  // Calculate current streak
  let currentStreak = 0
  for (let i = 0; i < weeklyActivity.length; i++) {
    if (weeklyActivity[i] > 0) currentStreak++
    else break
  }
  
  // Find longest streak
  let longestStreak = 0
  let current = 0
  for (let i = 0; i < weeklyActivity.length; i++) {
    if (weeklyActivity[i] > 0) {
      current++
      longestStreak = Math.max(longestStreak, current)
    } else {
      current = 0
    }
  }
  
  return {
    totalCommitsLastYear: commits.length,
    activeWeeks,
    consistency: Math.round(consistency),
    currentStreak,
    longestStreak,
    isActive: commits.length > 20,
    needsImprovement: commits.length < 10,
    weeklyPattern: weeklyActivity.slice(0, 12) // Last 12 weeks
  }
}

export function calculateReadmeScore(readmeData: any): number {
  if (!readmeData.hasReadme) return 0
  
  let score = 0
  if (readmeData.length > 1000) score += 30
  else if (readmeData.length > 500) score += 20
  else if (readmeData.length > 100) score += 10
  
  const sections = readmeData.sections || {}
  if (sections.hasInstallation) score += 15
  if (sections.hasUsage) score += 15
  if (sections.hasApi) score += 10
  if (sections.hasContributing) score += 10
  if (sections.hasLicense) score += 10
  if (sections.hasTests) score += 10
  
  return Math.min(100, score)
}