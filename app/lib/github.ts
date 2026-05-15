export async function fetchGitHubData(username: string) {
  try {
    const response = await fetch(`/api/github?username=${username}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch GitHub data (${response.status})`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    return data
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

export async function fetchReadmeContent(owner: string, repo: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Profile-Reviewer'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      // Decode base64 content
      const content = Buffer.from(data.content, 'base64').toString()
      return {
        hasReadme: true,
        length: content.length,
        sections: {
          hasInstallation: /install|Installation|setup|Setup/i.test(content),
          hasUsage: /usage|Usage|example|Example/i.test(content),
          hasApi: /api|API|endpoint|Endpoint/i.test(content),
          hasContributing: /contributing|Contributing|contribute|Contribute/i.test(content),
          hasLicense: /license|License|MIT|Apache|GPL/i.test(content),
          hasTests: /test|Test|testing|Testing/i.test(content)
        },
        quality: content.length > 1000 ? 'Excellent' : content.length > 500 ? 'Good' : content.length > 100 ? 'Basic' : 'Poor'
      }
    }
    return { hasReadme: false, length: 0, sections: {}, quality: 'None' }
  } catch (error) {
    console.error('README fetch error:', error)
    return { hasReadme: false, length: 0, sections: {}, quality: 'None' }
  }
}

export async function fetchMultipleReadmes(repos: any[]) {
  const readmeData = {}
  for (const repo of repos.slice(0, 5)) { // Limit to top 5 repos
    const data = await fetchReadmeContent(repo.owner?.login || repo.owner, repo.name)
    readmeData[repo.name] = data
  }
  return readmeData
}