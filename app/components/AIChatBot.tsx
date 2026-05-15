'use client'
import { useState, useRef, useEffect } from 'react'
import { FaRobot, FaPaperPlane, FaTimes, FaSpinner, FaTrash } from 'react-icons/fa'

interface AIChatBotProps {
  profileData: any
  suggestions: string[]
  score: number
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIChatBot({ profileData, suggestions, score }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your GitHub profile assistant powered by Gemma 3:1b. I can help you improve your profile based on our analysis. Your current score is ${score}/10. Ask me anything about improving your GitHub presence!`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    async function checkOllama() {
      try {
        const response = await fetch('/api/ai-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        })
        if (!response.ok) {
          setIsOllamaAvailable(false)
          setMessages(prev => [{
            role: 'assistant',
            content: `⚠️ Ollama is not running. Please start it with 'ollama serve' in your terminal to use the AI assistant. For now, I'll provide basic responses based on your profile data.`,
            timestamp: new Date()
          }, ...prev])
        }
      } catch (error) {
        setIsOllamaAvailable(false)
      }
    }
    checkOllama()
  }, [])

  const sendMessageToOllama = async (userMessage: string) => {
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            profileData,
            suggestions,
            score
          }
        })
      })
      
      const data = await response.json()
      return data.response || "I'm having trouble processing that. Could you rephrase your question?"
    } catch (error) {
      console.error('Ollama chat error:', error)
      return getFallbackResponse(userMessage)
    }
  }

  const getFallbackResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('score') || lowerMessage.includes('rating')) {
      return `Your current profile score is ${score}/10. ${score >= 8 ? 'Excellent! You\'re in the top tier!' : score >= 6 ? 'Good! You\'re on the right track.' : score >= 4 ? 'Average - there\'s room for improvement.' : 'Needs work - let me help you improve!'}`
    }
    
    if (lowerMessage.includes('improve') || lowerMessage.includes('suggestion')) {
      const topSuggestions = suggestions.slice(0, 3).join(', ')
      return `Based on my analysis, here are your top 3 improvement areas: ${topSuggestions || 'Add more projects and documentation'}. Would you like specific advice on any of these?`
    }
    
    if (lowerMessage.includes('readme')) {
      const readmeSuggestions = suggestions.filter(s => s.toLowerCase().includes('readme'))
      if (readmeSuggestions.length > 0) {
        return `📚 README improvements needed: ${readmeSuggestions[0]} I recommend adding detailed installation steps, usage examples, and a license section.`
      }
      return `📖 Your README files look decent! To make them excellent, add: installation instructions, code examples, API documentation, and contribution guidelines.`
    }
    
    if (lowerMessage.includes('project') || lowerMessage.includes('repo')) {
      return `📦 You have ${profileData.public_repos} public repositories. ${profileData.public_repos < 5 ? 'Consider creating 3-5 quality projects showcasing different skills.' : 'Great quantity! Focus on documentation and star growth for existing projects.'}`
    }
    
    if (lowerMessage.includes('activity') || lowerMessage.includes('commit')) {
      return `📅 Consistency is key! ${suggestions.some(s => s.includes('activity')) ? 'Try to commit at least 4-5 times per week to build a green contribution graph.' : 'Your activity looks consistent! Keep up the great work!'}`
    }
    
    if (lowerMessage.includes('bio')) {
      if (!profileData.bio) {
        return `✏️ Your bio is missing! Add a bio explaining: who you are, your tech stack, and what you're passionate about. Aim for 50-100 characters.`
      }
      return `✏️ Your bio: "${profileData.bio.substring(0, 100)}..." ${profileData.bio.length < 50 ? 'Consider expanding it to better showcase your skills.' : 'Looks good! Keep it updated.'}`
    }
    
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('website')) {
      return profileData.blog 
        ? `🔗 Your portfolio is at: ${profileData.blog}. Make sure it's up to date with your latest projects and skills.`
        : `🔗 No portfolio link found! Add your portfolio website or LinkedIn to help recruiters find you.`
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! 👋 I'm your GitHub assistant. Ask me about your profile score, improvements needed, README quality, project portfolio, activity consistency, or bio optimization. How can I help today?`
    }
    
    return `I can help you with:
• 📊 Profile score and rating
• ✅ Specific improvement suggestions
• 📚 README documentation quality
• 📦 Project portfolio analysis
• 📅 Activity and commit consistency
• ✏️ Bio and profile completeness
• 🔗 Portfolio and social links

What would you like to know more about?`
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }])
    setIsLoading(true)
    
    let response: string
    if (isOllamaAvailable) {
      response = await sendMessageToOllama(userMessage)
    } else {
      await new Promise(resolve => setTimeout(resolve, 500))
      response = getFallbackResponse(userMessage)
    }
    
    setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat cleared! 👋 I'm still here to help with your GitHub profile. Your current score is ${score}/10. What would you like to know?`,
        timestamp: new Date()
      }
    ])
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group z-50"
        >
          <FaRobot className="text-white text-2xl group-hover:scale-110 transition" />
        </button>
      )}
      
      {/* Chat Window - Glassmorphism */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] backdrop-blur-xl bg-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 border border-white/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaRobot className="text-white" />
              <div>
                <h3 className="text-white font-semibold text-sm">GitHub Profile Assistant</h3>
                <p className="text-white text-xs opacity-90">Powered by Gemma 3:1b</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="text-white hover:text-gray-200 transition text-sm"
                title="Clear chat"
              >
                <FaTrash />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          
          {/* Messages - Glassmorphism */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/5">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                      : 'backdrop-blur-sm bg-white/20 border border-white/30 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-200' : 'text-white/60'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="backdrop-blur-sm bg-white/20 border border-white/30 p-3 rounded-lg flex items-center gap-2">
                  <FaSpinner className="animate-spin text-purple-300" />
                  <span className="text-xs text-white/80">Gemma 3:1b is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input - Glassmorphism */}
          <div className="p-4 border-t border-white/20 backdrop-blur-sm bg-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your profile..."
                className="flex-1 px-3 py-2 text-sm backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 text-white placeholder:text-white/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                <FaPaperPlane />
              </button>
            </div>
            <p className="text-xs text-white/50 mt-2 text-center">
              Ask about: score, improvements, README, projects, activity, bio
            </p>
          </div>
        </div>
      )}
    </>
  )
}