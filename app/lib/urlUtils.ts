/**
 * Extract GitHub username from various input formats
 * Supports:
 * - Username only: "octocat"
 * - Full URL: "https://github.com/octocat"
 * - URL with repo: "https://github.com/octocat/Hello-World"
 * - URL with trailing slash: "https://github.com/octocat/"
 * - URL without https: "github.com/octocat"
 */
export function extractGitHubUsername(input: string): string | null {
  // Trim whitespace
  input = input.trim()
  
  // If empty
  if (!input) return null
  
  // Remove @ prefix if present (like @username)
  if (input.startsWith('@')) {
    input = input.substring(1)
  }
  
  // Check if it's just a username (no slashes, dots, or common URL patterns)
  const usernamePattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/
  if (usernamePattern.test(input) && !input.includes('github.com')) {
    return input
  }
  
  // Extract from GitHub URLs
  const urlPatterns = [
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\?\s#]+)/,     // github.com/username
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\?\s#]+)\/?/,    // github.com/username/
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\?\s#]+)\/[\w-]+/, // github.com/username/repo
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\?\s#]+)\/[\w-]+\/?/, // github.com/username/repo/
  ]
  
  for (const pattern of urlPatterns) {
    const match = input.match(pattern)
    if (match && match[1]) {
      // Validate username format
      if (usernamePattern.test(match[1])) {
        return match[1]
      }
    }
  }
  
  return null
}

/**
 * Validate if the input is a valid GitHub URL format
 */
export function isGitHubUrl(input: string): boolean {
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\/\?\s]+/
  return urlPattern.test(input)
}

/**
 * Get display text for the input (shows what will be used)
 */
export function getDisplayText(input: string, type: 'username' | 'url'): string {
  if (type === 'username') {
    return input
  }
  
  const username = extractGitHubUsername(input)
  return username ? `@${username}` : input
}