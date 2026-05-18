import { NextResponse } from 'next/server'
import ollama from 'ollama'

interface GitHubProfile {
  login: string
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
  email: string | null
  blog: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  avatar_url: string
  html_url: string
}

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  html_url: string
  created_at: string
  updated_at: string
  open_issues_count: number
}

interface GitHubEvent {
  id: string
  type: string
  created_at: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Match exactly what your frontend sends
    const profileData = body.profileData
    const reposData = body.reposData || []
    const score = body.score || 0
    const suggestions = body.suggestions || []
    
    console.log('📥 Received AI review request')
    console.log('Profile data:', profileData?.login)
    console.log('Repos count:', reposData.length)
    
    // Check if Ollama is running
    try {
      await ollama.list()
      console.log('✅ Ollama is running')
    } catch (error) {
      console.log('⚠️ Ollama is not running, using fallback')
      const fallbackResponse = generateFallbackAnalysis(profileData, reposData, score, suggestions)
      return NextResponse.json({ analysis: fallbackResponse })
    }

    // If no profile data, use fallback
    if (!profileData || !profileData.login) {
      console.log('⚠️ No profile data, using fallback')
      const fallbackResponse = generateFallbackAnalysis(profileData, reposData, score, suggestions)
      return NextResponse.json({ analysis: fallbackResponse })
    }

    console.log('🚀 Using local Ollama for AI analysis')
    const aiResponse = await getLocalOllamaAnalysis(profileData, reposData, score, suggestions)
    return NextResponse.json({ analysis: aiResponse })
    
  } catch (error) {
    console.error('AI review error:', error)
    const fallbackResponse = generateFallbackAnalysis(null, [], 0, [])
    return NextResponse.json({ analysis: fallbackResponse }, { status: 200 })
  }
}

async function getLocalOllamaAnalysis(
  profileData: GitHubProfile, 
  reposData: GitHubRepo[], 
  score: number, 
  suggestions: string[]
) {
  const name = profileData.name || profileData.login || 'Developer'
  const bio = profileData.bio || 'No bio provided'
  const company = profileData.company || 'Not specified'
  const location = profileData.location || 'Not specified'
  const publicRepos = profileData.public_repos || 0
  const followers = profileData.followers || 0
  const following = profileData.following || 0
  const createdAt = profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'Unknown'
  
  // Get top 5 repositories by stars
  const topRepos = (reposData || [])
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 5)
    .map(repo => `- ${repo.name}: ${repo.stargazers_count || 0} stars, ${repo.forks_count || 0} forks, ${repo.language || 'No language'}`)
    .join('\n')
  
  // Get languages used
  const languages = [...new Set((reposData || []).map(r => r.language).filter(Boolean))] as string[]
  
  const prompt = `You are an expert GitHub profile reviewer and technical recruiter. Analyze the following GitHub profile and provide insights.

PROFILE INFO:
- Name: ${name}
- Username: ${profileData.login}
- Bio: ${bio}
- Company: ${company}
- Location: ${location}
- Account created: ${createdAt}
- Public repositories: ${publicRepos}
- Followers: ${followers}
- Following: ${following}

TOP REPOSITORIES:
${topRepos || 'No repositories found'}

TECH STACK:
${languages.join(', ') || 'No languages detected'}

CURRENT SCORE: ${score}/10
SUGGESTIONS ALREADY GENERATED:
${(suggestions || []).slice(0, 5).map(s => `- ${s}`).join('\n')}

Please provide a JSON response with the following structure:
{
  "summary": "A 2-3 sentence overview of this developer's GitHub presence",
  "recruiterThoughts": "What would a technical recruiter think? Be honest and constructive (2-3 sentences)",
  "strengths": ["List 3-5 specific strengths of this profile"],
  "improvements": ["List 3-5 specific areas for improvement"],
  "actionItems": ["List 3 specific, actionable steps this developer should take next"],
  "hireability": "Rate as 'High', 'Medium', or 'Low' with brief explanation",
  "bestProject": "Which repository stands out most and why?"
}

Keep responses professional, constructive, and specific to this developer's actual data.`

  console.log('📤 Sending prompt to Ollama...')
  
  // Use Ollama for analysis
  const response = await ollama.chat({
    model: 'gemma3:1b',
    messages: [{ role: 'user', content: prompt }],
    options: {
      temperature: 0.7,
      num_predict: 1024,
    }
  })

  let analysisText = response.message.content
  console.log('📥 Received response from Ollama')
  
  let analysis
  
  try {
    // Clean up the response - remove markdown code blocks
    const cleanText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
    analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleanText)
  } catch (e) {
    console.error('Failed to parse Ollama response:', e)
    console.error('Raw response:', analysisText)
    throw new Error('Invalid JSON response from Ollama')
  }
  
  return {
    summary: analysis.summary || `${name} has ${publicRepos} repositories and ${followers} followers.`,
    recruiterThoughts: analysis.recruiterThoughts || "Profile shows potential for growth.",
    strengths: analysis.strengths || ["Active on GitHub"],
    improvements: analysis.improvements || ["Add more detailed project documentation"],
    actionItems: analysis.actionItems || ["Create a portfolio README"],
    hireability: analysis.hireability || (score >= 7 ? "High" : score >= 5 ? "Medium" : "Low"),
    bestProject: analysis.bestProject || (reposData[0]?.name || "No significant projects found"),
    aiModel: 'Local Ollama - Gemma 3:1b'
  }
}

function generateFallbackAnalysis(
  profileData: GitHubProfile | null, 
  reposData: GitHubRepo[], 
  score: number, 
  suggestions: string[]
) {
  const name = profileData?.name || profileData?.login || 'Developer'
  const publicRepos = profileData?.public_repos || reposData?.length || 0
  const followers = profileData?.followers || 0
  
  return {
    summary: `${name} has ${publicRepos} repositories and ${followers} followers on GitHub.`,
    recruiterThoughts: score >= 7 
      ? "Good profile! Keep improving." 
      : "Profile needs work. Follow the suggestions below to improve your GitHub presence.",
    strengths: ["Has GitHub presence", "Public repositories available"],
    improvements: (suggestions || []).filter(s => !s.includes('✅')).slice(0, 3),
    actionItems: (suggestions || []).slice(0, 3),
    hireability: score >= 7 ? "High - Good potential" : score >= 5 ? "Medium - Needs improvement" : "Low - Build profile first",
    bestProject: reposData?.[0]?.name || "No projects found",
    aiModel: 'Rule-based (Smart Analysis)'
  }
}