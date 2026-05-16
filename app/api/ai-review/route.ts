import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client with Ollama Cloud endpoint
const ollamaClient = new OpenAI({
  baseURL: 'https://ollama.com/v1',  // Ollama Cloud endpoint
  apiKey: process.env.OLLAMA_CLOUD_API_KEY || process.env.OPENAI_API_KEY, // Fallback to OpenAI if needed
})

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
    const { profileData, reposData, eventsData, score, suggestions } = await request.json()
    
    // Check if Ollama Cloud API key is available
    const hasOllamaCloud = process.env.OLLAMA_CLOUD_API_KEY && process.env.OLLAMA_CLOUD_API_KEY.length > 0
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')
    
    if (hasOllamaCloud) {
      console.log('🚀 Using Ollama Cloud API for analysis')
      const aiResponse = await getOllamaCloudAnalysis(profileData, reposData, eventsData, score, suggestions)
      if (aiResponse) {
        return NextResponse.json({ analysis: aiResponse })
      }
    }
    
    if (hasOpenAI) {
      console.log('🤖 Using OpenAI API as fallback')
      const aiResponse = await getOpenAIAnalysis(profileData, reposData, eventsData, score, suggestions)
      if (aiResponse) {
        return NextResponse.json({ analysis: aiResponse })
      }
    }
    
    // Final fallback to rule-based analysis
    console.log('📊 Using rule-based analysis (no API keys available)')
    const fallbackResponse = generateFallbackAnalysis(profileData, reposData, eventsData, score, suggestions)
    return NextResponse.json({ analysis: fallbackResponse })
    
  } catch (error) {
    console.error('AI review error:', error)
    const fallbackResponse = generateFallbackAnalysis(
      {} as GitHubProfile,
      [],
      [],
      0,
      []
    )
    return NextResponse.json({ analysis: fallbackResponse }, { status: 200 })
  }
}

async function getOllamaCloudAnalysis(
  profileData: GitHubProfile, 
  reposData: GitHubRepo[], 
  eventsData: GitHubEvent[], 
  score: number, 
  suggestions: string[]
) {
  const name = profileData.name || profileData.login
  const bio = profileData.bio || 'No bio provided'
  const company = profileData.company || 'Not specified'
  const location = profileData.location || 'Not specified'
  const publicRepos = profileData.public_repos
  const followers = profileData.followers
  const following = profileData.following
  const createdAt = new Date(profileData.created_at).toLocaleDateString()
  
  // Get top 5 repositories by stars
  const topRepos = reposData
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map(repo => `- ${repo.name}: ${repo.stargazers_count} stars, ${repo.forks_count} forks, ${repo.language || 'No language'}`)
    .join('\n')
  
  // Get languages used
  const languages = [...new Set(reposData.map(r => r.language).filter(Boolean))] as string[]
  
  // Calculate recent activity
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const recentActivity = eventsData.filter((e: GitHubEvent) => new Date(e.created_at) > threeMonthsAgo).length
  
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
- Recent activity (3 months): ${recentActivity} events

TOP REPOSITORIES:
${topRepos}

TECH STACK:
${languages.join(', ') || 'No languages detected'}

CURRENT SCORE: ${score}/10
SUGGESTIONS ALREADY GENERATED:
${suggestions.slice(0, 5).map(s => `- ${s}`).join('\n')}

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

  try {
    const response = await ollamaClient.chat.completions.create({
      model: 'gemma3:1b',
      messages: [
        {
          role: 'system',
          content: 'You are an expert GitHub profile reviewer and technical recruiter. Provide detailed, actionable feedback in JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    })

    const analysisText = response.choices[0]?.message?.content || '{}'
    let analysis
    
    try {
      analysis = JSON.parse(analysisText)
    } catch (e) {
      console.error('Failed to parse Ollama Cloud response:', e)
      throw new Error('Invalid JSON response from Ollama Cloud')
    }
    
    return {
      summary: analysis.summary || `${name} has ${publicRepos} repositories and ${followers} followers.`,
      recruiterThoughts: analysis.recruiterThoughts || "Profile shows potential for growth.",
      strengths: analysis.strengths || ["Active on GitHub"],
      improvements: analysis.improvements || ["Add more detailed project documentation"],
      actionItems: analysis.actionItems || ["Create a portfolio README"],
      hireability: analysis.hireability || (score >= 7 ? "High" : score >= 5 ? "Medium" : "Low"),
      bestProject: analysis.bestProject || (reposData[0]?.name || "No significant projects found"),
      aiModel: 'Ollama Cloud - Gemma 3:1b'
    }
    
  } catch (error) {
    console.error('Ollama Cloud API error:', error)
    throw error
  }
}

async function getOpenAIAnalysis(
  profileData: GitHubProfile, 
  reposData: GitHubRepo[], 
  eventsData: GitHubEvent[], 
  score: number, 
  suggestions: string[]
) {
  const name = profileData.name || profileData.login
  const bio = profileData.bio || 'No bio provided'
  const company = profileData.company || 'Not specified'
  const location = profileData.location || 'Not specified'
  const publicRepos = profileData.public_repos
  const followers = profileData.followers
  const following = profileData.following
  const createdAt = new Date(profileData.created_at).toLocaleDateString()
  
  const topRepos = reposData
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map(repo => `- ${repo.name}: ${repo.stargazers_count} stars, ${repo.language || 'No language'}`)
    .join('\n')
  
  const languages = [...new Set(reposData.map(r => r.language).filter(Boolean))] as string[]
  
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const recentActivity = eventsData.filter((e: GitHubEvent) => new Date(e.created_at) > threeMonthsAgo).length
  
  const openAIClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  
  const prompt = `You are an expert GitHub profile reviewer and technical recruiter. Analyze the following GitHub profile and return ONLY valid JSON.

Profile:
- Name: ${name}
- Username: ${profileData.login}
- Bio: ${bio}
- Repos: ${publicRepos}
- Followers: ${followers}
- Following: ${following}
- Tech Stack: ${languages.join(', ') || 'None'}
- Score: ${score}/10

Top Repos: ${topRepos}

Return JSON:
{
  "summary": "2-3 sentence overview",
  "recruiterThoughts": "What a recruiter would think",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "actionItems": ["action1", "action2", "action3"],
  "hireability": "High/Medium/Low with reason",
  "bestProject": "Best repo and why"
}`

  try {
    const response = await openAIClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    const analysisText = response.choices[0]?.message?.content || '{}'
    const cleanText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    
    return {
      summary: analysis.summary || `${name} has ${publicRepos} repositories and ${followers} followers.`,
      recruiterThoughts: analysis.recruiterThoughts || "Profile shows potential.",
      strengths: analysis.strengths || ["Has GitHub presence"],
      improvements: analysis.improvements || ["Add more documentation"],
      actionItems: analysis.actionItems || ["Create README files"],
      hireability: analysis.hireability || (score >= 7 ? "High" : score >= 5 ? "Medium" : "Low"),
      bestProject: analysis.bestProject || (reposData[0]?.name || "No projects found"),
      aiModel: 'OpenAI GPT-3.5 Turbo'
    }
    
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

function generateFallbackAnalysis(
  profileData: GitHubProfile, 
  reposData: GitHubRepo[], 
  eventsData: GitHubEvent[], 
  score: number, 
  suggestions: string[]
) {
  const name = profileData.name || profileData.login || 'Developer'
  const publicRepos = profileData.public_repos || reposData.length || 0
  const followers = profileData.followers || 0
  
  return {
    summary: `${name} has ${publicRepos} repositories and ${followers} followers on GitHub.`,
    recruiterThoughts: score >= 7 
      ? "Good profile! Keep improving." 
      : "Profile needs work. Follow the suggestions below to improve your GitHub presence.",
    strengths: ["Has GitHub presence", "Public repositories available"],
    improvements: suggestions.filter(s => !s.includes('✅')).slice(0, 3),
    actionItems: suggestions.slice(0, 3),
    hireability: score >= 7 ? "High - Good potential" : score >= 5 ? "Medium - Needs improvement" : "Low - Build profile first",
    bestProject: reposData[0]?.name || "No projects found",
    aiModel: 'Rule-based (Smart Analysis)'
  }
}