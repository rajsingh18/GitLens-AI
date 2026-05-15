// ATS (Applicant Tracking System) Score Calculator for GitHub Profiles

export interface ATSScore {
  overall: number
  breakdown: {
    profileCompleteness: number
    keywordOptimization: number
    projectQuality: number
    documentation: number
    activityConsistency: number
    communityEngagement: number
  }
  recommendations: string[]
  keywordsFound: string[]
  keywordsMissing: string[]
}

export function calculateATSScore(profile: any, repos: any[], events: any[]): ATSScore {
  const keywords = [
    'react', 'nextjs', 'typescript', 'javascript', 'python', 'nodejs',
    'fullstack', 'frontend', 'backend', 'api', 'database', 'cloud',
    'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum'
  ]
  
  const profileText = `${profile.bio || ''} ${profile.company || ''} ${profile.name || ''}`.toLowerCase()
  const reposText = repos.map(r => `${r.name} ${r.description || ''}`).join(' ').toLowerCase()
  const allText = profileText + reposText
  
  const keywordsFound = keywords.filter(kw => allText.includes(kw.toLowerCase()))
  const keywordsMissing = keywords.filter(kw => !allText.includes(kw.toLowerCase()))
  
  const keywordScore = Math.min(100, (keywordsFound.length / keywords.length) * 100)
  
  // Profile completeness score
  let profileScore = 0
  if (profile.name) profileScore += 15
  if (profile.bio && profile.bio.length > 50) profileScore += 20
  else if (profile.bio) profileScore += 10
  if (profile.company) profileScore += 10
  if (profile.location) profileScore += 10
  if (profile.blog) profileScore += 15
  if (profile.email) profileScore += 10
  if (profile.twitter_username) profileScore += 10
  
  // Project quality score
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
  const avgStars = repos.length > 0 ? totalStars / repos.length : 0
  let projectScore = 0
  if (repos.length >= 10) projectScore += 25
  else if (repos.length >= 5) projectScore += 15
  else projectScore += 5
  if (avgStars >= 10) projectScore += 25
  else if (avgStars >= 5) projectScore += 15
  else if (avgStars >= 1) projectScore += 10
  
  // Documentation score
  const reposWithReadme = repos.filter(r => r.description && r.description.length > 50).length
  const readmeRatio = repos.length > 0 ? (reposWithReadme / repos.length) * 100 : 0
  let docScore = 0
  if (readmeRatio >= 80) docScore += 25
  else if (readmeRatio >= 50) docScore += 15
  else if (readmeRatio >= 20) docScore += 5
  if (repos.some(r => r.homepage)) docScore += 10
  
  // Activity consistency score
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const recentActivity = events.filter((e: any) => new Date(e.created_at) > sixMonthsAgo).length
  let activityScore = 0
  if (recentActivity > 100) activityScore += 30
  else if (recentActivity > 50) activityScore += 20
  else if (recentActivity > 20) activityScore += 10
  
  // Community engagement score
  let communityScore = 0
  if (profile.followers > 100) communityScore += 20
  else if (profile.followers > 50) communityScore += 15
  else if (profile.followers > 10) communityScore += 10
  const ratio = profile.followers / (profile.following || 1)
  if (ratio > 2) communityScore += 10
  
  const overall = Math.round((profileScore + keywordScore + projectScore + docScore + activityScore + communityScore) / 6)
  
  const recommendations: string[] = []
  if (keywordsMissing.length > 0) {
    recommendations.push(`Add these keywords to your profile/README: ${keywordsMissing.slice(0, 5).join(', ')}`)
  }
  if (profileScore < 70) recommendations.push("Complete your profile with bio, company, location, and portfolio link")
  if (projectScore < 50) recommendations.push("Create more projects with detailed documentation to improve project quality")
  if (docScore < 60) recommendations.push("Add comprehensive README files to all repositories")
  if (activityScore < 50) recommendations.push("Increase your contribution frequency - aim for weekly commits")
  if (communityScore < 50) recommendations.push("Engage more with the community by starring and forking repositories")
  
  return {
    overall,
    breakdown: {
      profileCompleteness: Math.min(100, profileScore),
      keywordOptimization: Math.min(100, keywordScore),
      projectQuality: Math.min(100, projectScore),
      documentation: Math.min(100, docScore),
      activityConsistency: Math.min(100, activityScore),
      communityEngagement: Math.min(100, communityScore)
    },
    recommendations,
    keywordsFound,
    keywordsMissing: keywordsMissing.slice(0, 10)
  }
}

export function getPlacementReadiness(score: number): {
  level: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' | 'Poor'
  message: string
  companies: string[]
  recommendedActions: string[]
} {
  if (score >= 85) {
    return {
      level: 'Excellent',
      message: 'You are ready for top tech companies! Your profile stands out.',
      companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix'],
      recommendedActions: ['Keep contributing to open source', 'Network with recruiters on LinkedIn', 'Prepare for technical interviews']
    }
  } else if (score >= 70) {
    return {
      level: 'Good',
      message: 'Strong profile! You qualify for many mid-level positions.',
      companies: ['Accenture', 'Infosys', 'TCS', 'Wipro', 'Capgemini'],
      recommendedActions: ['Improve documentation quality', 'Add more projects', 'Contribute to popular open source']
    }
  } else if (score >= 50) {
    return {
      level: 'Average',
      message: 'Good foundation. Focus on improving your portfolio.',
      companies: ['Startups', 'Local companies', 'Remote-first companies'],
      recommendedActions: ['Complete your profile', 'Add README to all repos', 'Increase commit frequency']
    }
  } else if (score >= 30) {
    return {
      level: 'Needs Improvement',
      message: 'Your profile needs significant work before job applications.',
      companies: ['Internships', 'Freelance projects', 'Entry-level positions'],
      recommendedActions: ['Create 3-5 quality projects', 'Write detailed documentation', 'Build consistent activity streak']
    }
  } else {
    return {
      level: 'Poor',
      message: 'Start building your GitHub presence. Focus on learning and small projects.',
      companies: ['Open source contribution', 'Personal projects', 'Learning platforms'],
      recommendedActions: ['Create first repository', 'Learn Git basics', 'Follow GitHub tutorials']
    }
  }
}