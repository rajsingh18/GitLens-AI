import { NextResponse } from 'next/server'
import ollama from 'ollama'

interface GitHubProfile {
  login: string
  name: string | null
  bio: string | null
  company: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

interface GitHubRepo {
  name: string
  stargazers_count: number
  forks_count: number
  language: string | null
  open_issues_count: number
  updated_at: string
}

interface AnalysisResult {
  summary: string
  recruiterThoughts: string
  strengths: string[]
  improvements: string[]
  actionItems: string[]
  hireability: string
  bestProject: string
  aiModel: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const profileData: GitHubProfile = body.profileData
    const reposData: GitHubRepo[] = body.reposData || []
    const score: number = body.score || 0
    const suggestions: string[] = body.suggestions || []
    
    // Check if Ollama is running
    try {
      await ollama.list()
    } catch (error) {
      console.log('Ollama not running, using fallback')
      const fallbackResponse = generateFallbackAnalysis(profileData, reposData, score, suggestions)
      return NextResponse.json({ analysis: fallbackResponse })
    }
    
    const name = profileData.name || profileData.login
    const publicRepos = profileData.public_repos || 0
    const followers = profileData.followers || 0
    const following = profileData.following || 0
    const bio = profileData.bio || 'No bio provided'
    const company = profileData.company || 'Not specified'
    const accountAge = Math.floor((new Date().getTime() - new Date(profileData.created_at).getTime()) / (1000 * 3600 * 24 * 30))
    
    // Get top 5 repositories
    const topRepos = reposData
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((repo) => `- ${repo.name}: ${repo.stargazers_count} stars, ${repo.forks_count} forks, ${repo.language || 'No language'}, ${repo.open_issues_count} issues, last updated ${new Date(repo.updated_at).toLocaleDateString()}`)
      .join('\n')
    
    // Get unique languages
    const languageSet = new Set<string>()
    for (const repo of reposData) {
      if (repo.language && typeof repo.language === 'string') {
        languageSet.add(repo.language)
      }
    }
    const languages = Array.from(languageSet)
    
    // Find inactive repos
    const inactiveRepos = reposData.filter(repo => {
      const lastUpdate = new Date(repo.updated_at)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return lastUpdate < sixMonthsAgo
    }).map(r => r.name)
    
    const prompt = `You are an expert GitHub profile reviewer and technical recruiter. Analyze this developer's GitHub profile and return ONLY valid JSON.

Return EXACTLY this JSON structure (no markdown, no extra text):
{
  "summary": "2-3 sentence overview of this developer's GitHub presence",
  "recruiterThoughts": "What a technical recruiter would honestly think - 2-3 sentences, be constructive and specific",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4", "improvement 5"],
  "actionItems": ["action item 1", "action item 2", "action item 3"],
  "hireability": "High/Medium/Low with brief 5-10 word explanation",
  "bestProject": "Which repository stands out most and why in 1 sentence"
}

Profile Data:
- Name: ${name}
- Username: ${profileData.login}
- Bio: ${bio || 'Not provided'}
- Company: ${company || 'Not specified'}
- Account Age: ${accountAge} months
- Public Repositories: ${publicRepos}
- Followers: ${followers}
- Following: ${following}
- Tech Stack: ${languages.join(', ') || 'None detected'}
- Current Score: ${score}/10

Top Repositories:
${topRepos || 'No repositories found'}

${inactiveRepos.length > 0 ? `Inactive Repositories (6+ months no updates): ${inactiveRepos.join(', ')}` : 'All repositories are actively maintained'}

Existing Improvement Suggestions:
${suggestions.slice(0, 3).join(', ') || 'None'}

Be specific, actionable, and professional. Focus on code quality, documentation standards, activity consistency, and community engagement.`

    const response = await ollama.chat({
      model: 'gemma3:1b',
      messages: [{ role: 'user', content: prompt }],
      options: {
        temperature: 0.6,
        num_predict: 1024,
      }
    })

    let analysisText = response.message.content
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    let analysis: any = {}
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0])
    }
    
    const result: AnalysisResult = {
      summary: analysis.summary || `${name} has ${publicRepos} repositories and ${followers} followers.`,
      recruiterThoughts: analysis.recruiterThoughts || "Profile shows potential for growth. Focus on increasing activity and improving documentation.",
      strengths: analysis.strengths || ["Has GitHub presence", "Public repositories available"],
      improvements: analysis.improvements || ["Add more detailed documentation", "Increase regular contributions", "Add project descriptions"],
      actionItems: analysis.actionItems || ["Create README files for each repository", "Set weekly contribution goals", "Add portfolio links"],
      hireability: analysis.hireability || (score >= 7 ? "High - Good candidate for junior roles" : score >= 5 ? "Medium - Needs portfolio improvement" : "Low - Build more projects first"),
      bestProject: analysis.bestProject || (reposData[0]?.name || "No significant projects found"),
      aiModel: 'Gemma 3:1b (Ollama)'
    }
    
    return NextResponse.json({ analysis: result })
    
  } catch (error) {
    console.error('Ollama error:', error)
    const fallbackResponse = generateFallbackAnalysis(
      { login: 'user', name: null, bio: null, company: null, public_repos: 0, followers: 0, following: 0, created_at: '' },
      [],
      0,
      []
    )
    return NextResponse.json({ analysis: fallbackResponse })
  }
}

function generateFallbackAnalysis(
  profileData: GitHubProfile, 
  reposData: GitHubRepo[], 
  score: number, 
  suggestions: string[]
): AnalysisResult {
  const name = profileData.name || profileData.login
  const publicRepos = profileData.public_repos || 0
  const followers = profileData.followers || 0
  
  return {
    summary: `${name} has ${publicRepos} repositories and ${followers} followers. ${score >= 7 ? 'This is a solid profile!' : 'There are opportunities for improvement.'}`,
    recruiterThoughts: score >= 7 ? "This profile shows promise. With consistent contributions, could be a good candidate for entry-level positions." : "Profile needs more activity and better documentation to attract recruiters.",
    strengths: ["Has GitHub presence", "Public repositories available"],
    improvements: suggestions.filter(s => !s.includes('✅')).slice(0, 3),
    actionItems: suggestions.slice(0, 3),
    hireability: score >= 7 ? "Medium-High - Good potential" : score >= 5 ? "Medium - Needs work" : "Low - Build profile first",
    bestProject: reposData[0]?.name || "No projects found",
    aiModel: 'Rule-based (Fallback)'
  }
}