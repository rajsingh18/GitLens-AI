import { NextResponse } from 'next/server'
import ollama from 'ollama'

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()
    const { profileData, suggestions, score } = context
    
    // Prepare context about the user's profile
    const profileContext = `
User's GitHub Profile Information:
- Name: ${profileData.name || profileData.login}
- Bio: ${profileData.bio || 'Not provided'}
- Public Repositories: ${profileData.public_repos}
- Followers: ${profileData.followers}
- Following: ${profileData.following}
- Profile Score: ${score}/10
- Key Suggestions: ${suggestions.slice(0, 5).join(', ')}

User Question: ${message}

Please provide a helpful, specific, and actionable response to help this developer improve their GitHub profile. Be concise but informative. Use emojis occasionally to make the response engaging. Focus on practical advice based on their actual profile data.`

    // Check if Ollama is running
    try {
      await ollama.list()
    } catch (error) {
      return NextResponse.json({ 
        response: "⚠️ Ollama is not running. Please start it with 'ollama serve' in your terminal to use the AI assistant.",
        error: true
      })
    }

    const response = await ollama.chat({
      model: 'gemma3:1b',
      messages: [{ role: 'user', content: profileContext }],
      options: {
        temperature: 0.7,
        num_predict: 500,
      }
    })

    return NextResponse.json({ 
      response: response.message.content,
      model: 'gemma3:1b'
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      response: "I'm having trouble connecting to the AI model. Please make sure Ollama is running with 'ollama serve'.",
      error: true
    }, { status: 500 })
  }
}