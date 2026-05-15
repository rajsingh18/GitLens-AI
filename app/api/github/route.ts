import { NextResponse } from 'next/server'
import { fetchReadmeContent } from '@/app/lib/readmeFetcher'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }
  
  // Get GitHub token from environment variables
  const githubToken = process.env.GITHUB_TOKEN
  
  // Prepare headers with authentication
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Profile-Reviewer-App',
  }
  
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`
    console.log(`[GitHub API] Using authenticated requests for user: ${username}`)
  } else {
    console.warn(`[GitHub API] No GITHUB_TOKEN found. Requests will be rate-limited to 60/hour.`)
  }
  
  try {
    // Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers })
    
    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (userRes.status === 403) {
        const rateLimit = userRes.headers.get('x-ratelimit-remaining')
        if (rateLimit === '0') {
          return NextResponse.json({ 
            error: 'GitHub API rate limit exceeded. Please add a valid GITHUB_TOKEN to your .env.local file or try again later.' 
          }, { status: 403 })
        }
      }
      return NextResponse.json({ error: `GitHub API error: ${userRes.status}` }, { status: userRes.status })
    }
    
    const userData = await userRes.json()
    
    // Fetch user repos
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`, { headers })
    
    let reposData = []
    if (reposRes.ok) {
      reposData = await reposRes.json()
      console.log(`[GitHub API] Fetched ${reposData.length} repositories for ${username}`)
    } else {
      console.warn(`[GitHub API] Failed to fetch repos: ${reposRes.status}`)
    }
    
    // Fetch README for top 3 repositories (to avoid rate limits)
    const readmeAnalyses: Record<string, any> = {}
    const topRepos = reposData.slice(0, 3)
    
    for (const repo of topRepos) {
      console.log(`[GitHub API] Fetching README for ${username}/${repo.name}`)
      const readmeAnalysis = await fetchReadmeContent(username, repo.name)
      readmeAnalyses[repo.name] = readmeAnalysis
    }
    
    console.log(`[GitHub API] Successfully fetched ${Object.keys(readmeAnalyses).length} README files`)
    
    // Fetch user events (for activity)
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=30`, { headers })
    
    let eventsData = []
    if (eventsRes.ok) {
      eventsData = await eventsRes.json()
      console.log(`[GitHub API] Fetched ${eventsData.length} events for ${username}`)
    } else {
      console.warn(`[GitHub API] Failed to fetch events: ${eventsRes.status}`)
    }
    
    // Get rate limit info for debugging
    const rateLimit = {
      limit: userRes.headers.get('x-ratelimit-limit'),
      remaining: userRes.headers.get('x-ratelimit-remaining'),
      reset: userRes.headers.get('x-ratelimit-reset'),
    }
    
    if (githubToken) {
      console.log(`[GitHub API] Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`)
    }
    
    return NextResponse.json({
      profile: userData,
      repos: reposData,
      events: eventsData,
      readmes: readmeAnalyses,
      rateLimit: githubToken ? rateLimit : null
    })
    
  } catch (error) {
    console.error('[GitHub API] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch GitHub data. Please check your internet connection and try again.' 
    }, { status: 500 })
  }
}