import { NextResponse } from 'next/server'
import { fetchReadmeContent } from '@/app/lib/readmeFetcher'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  
  if (!owner || !repo) {
    return NextResponse.json({ error: 'Owner and repo required' }, { status: 400 })
  }
  
  try {
    const readmeAnalysis = await fetchReadmeContent(owner, repo)
    return NextResponse.json(readmeAnalysis)
  } catch (error) {
    console.error('README fetch error:', error)
    return NextResponse.json({ 
      hasReadme: false, 
      quality: 'None', 
      suggestions: ['Could not fetch README - check repository permissions']
    }, { status: 500 })
  }
}