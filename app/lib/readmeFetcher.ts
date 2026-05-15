export interface ReadmeAnalysis {
  hasReadme: boolean
  content: string | null
  length: number
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

export async function fetchReadmeContent(owner: string, repo: string): Promise<ReadmeAnalysis> {
  // Get GitHub token from environment variables
  const githubToken = process.env.GITHUB_TOKEN
  
  // Prepare headers with authentication
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Profile-Reviewer-App',
  }
  
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`
  }
  
  // Try multiple possible README filenames
  const readmeNames = ['README.md', 'readme.md', 'README.MD', 'Readme.md', 'readme.MD']
  
  for (const readmeName of readmeNames) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${readmeName}`, {
        headers: headers,
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Handle content that might be base64 encoded
        let content = ''
        if (data.content) {
          content = Buffer.from(data.content, 'base64').toString('utf-8')
        } else if (typeof data === 'string') {
          content = data
        } else {
          content = JSON.stringify(data)
        }
        
        const contentLower = content.toLowerCase()
        
        // Analyze sections
        const sections = {
          hasInstallation: /install|installation|setup|getting started|dependencies|prerequisites/i.test(contentLower),
          hasUsage: /usage|how to use|example|demo|run|start|quick start/i.test(contentLower),
          hasApi: /api|endpoint|methods|functions|interface|configuration/i.test(contentLower),
          hasContributing: /contributing|contribute|development|local setup|build|testing/i.test(contentLower),
          hasLicense: /license|mit|apache|gpl|bsd|isc|unlicense/i.test(contentLower),
          hasTests: /test|testing|run test|test suite|unit test|integration test/i.test(contentLower),
          hasExamples: /example|sample|demonstration|demo|usage example/i.test(contentLower)
        }
        
        // Determine quality based on length and sections
        let quality: ReadmeAnalysis['quality'] = 'Poor'
        const totalSections = Object.values(sections).filter(Boolean).length
        
        if (content.length > 3000 && totalSections >= 5) {
          quality = 'Excellent'
        } else if (content.length > 1500 && totalSections >= 3) {
          quality = 'Good'
        } else if (content.length > 300 && totalSections >= 1) {
          quality = 'Basic'
        } else {
          quality = 'Poor'
        }
        
        // Generate suggestions for improvement
        const suggestions: string[] = []
        
        if (!sections.hasInstallation && content.length > 100) {
          suggestions.push('Add installation instructions')
        }
        if (!sections.hasUsage && content.length > 100) {
          suggestions.push('Include usage examples or code snippets')
        }
        if (!sections.hasApi && content.length > 500) {
          suggestions.push('Document the API or configuration options')
        }
        if (!sections.hasContributing && content.length > 200) {
          suggestions.push('Add contributing guidelines for open source collaboration')
        }
        if (!sections.hasLicense && content.length > 100) {
          suggestions.push('Add a license section or separate LICENSE file')
        }
        if (!sections.hasTests && content.length > 200) {
          suggestions.push('Include testing instructions')
        }
        if (content.length < 200 && content.length > 0) {
          suggestions.push('Expand README with more details about the project')
        }
        if (content.length === 0) {
          suggestions.push('README file is empty - add content describing your project')
        }
        
        // Special check for table of contents in long READMEs
        if (content.length > 1000 && !contentLower.includes('table of contents') && !contentLower.includes('toc')) {
          suggestions.push('Consider adding a table of contents for better navigation')
        }
        
        return {
          hasReadme: true,
          content: content.substring(0, 2000), // Store preview
          length: content.length,
          quality,
          sections,
          suggestions
        }
      }
    } catch (error) {
      // Continue to next README name
      console.warn(`Failed to fetch ${readmeName} for ${owner}/${repo}:`, error)
    }
  }
  
  // No README found with any name
  console.log(`No README found for ${owner}/${repo}`)
  
  return {
    hasReadme: false,
    content: null,
    length: 0,
    quality: 'None',
    sections: {
      hasInstallation: false,
      hasUsage: false,
      hasApi: false,
      hasContributing: false,
      hasLicense: false,
      hasTests: false,
      hasExamples: false
    },
    suggestions: [
      'Create a README.md file to explain your project',
      'Include installation instructions and usage examples',
      'Add a license to clarify how others can use your code'
    ]
  }
}

export async function fetchMultipleReadmes(owner: string, repos: any[], limit: number = 5) {
  const readmeData: Record<string, ReadmeAnalysis> = {}
  
  console.log(`Fetching READMEs for ${owner} - ${Math.min(limit, repos.length)} repositories`)
  
  for (const repo of repos.slice(0, limit)) {
    const analysis = await fetchReadmeContent(owner, repo.name)
    readmeData[repo.name] = analysis
    // Small delay to avoid hitting rate limits too aggressively
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  const foundCount = Object.values(readmeData).filter(r => r.hasReadme).length
  console.log(`Successfully fetched ${foundCount}/${Object.keys(readmeData).length} README files`)
  
  return readmeData
}