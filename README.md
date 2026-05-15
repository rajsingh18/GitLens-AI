# 🚀 GitLens AI - GitHub Profile Reviewer

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-00A67E)](https://ollama.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📝 Overview

**GitLens AI** is an intelligent, AI-powered GitHub profile analysis tool that helps developers optimize their GitHub presence to stand out to recruiters and hiring managers.

### ✨ Key Features

- 🤖 **AI-Powered Analysis** - Local LLM (Gemma 3:1b) for privacy-focused insights
- 📊 **ATS Portfolio Score** - 0-100 recruiter compatibility score
- 📈 **Profile Scoring** - 0-10 overall profile quality rating
- 📚 **README Quality Check** - Analyzes documentation completeness
- 🔄 **Activity Tracking** - Commit frequency and consistency analysis
- 🎯 **Placement Readiness** - Job market readiness assessment
- 👥 **Compare with Top Developers** - Benchmark against industry leaders
- 💬 **AI Chatbot** - Interactive assistant for personalized advice

### 🎨 UI/UX Features

- **Glassmorphism Design** - Modern transparent interface
- **Video Background** - Engaging animated backdrop
- **Fully Responsive** - Works on all devices
- **Collapsible Sections** - Clean, organized layout

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **React Icons** - Icon library

### Backend & APIs
- **Next.js API Routes** - Server-side endpoints
- **GitHub REST API** - Profile data fetching
- **Ollama** - Local LLM server
- **Gemma 3:1b** - Google's lightweight AI model

## 📊 Analysis Metrics

| Category | Metrics |
|----------|---------|
| **Profile** | Bio, company, location, followers/following ratio |
| **Repositories** | Count, stars, forks, languages, health score |
| **README** | Existence, quality, sections (install, usage, API, license) |
| **Activity** | Commit frequency, consistency, streaks |
| **Documentation** | README completeness, license presence |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Ollama (for AI features)
- GitHub Token (optional, for higher rate limits)

### Installation

```bash
# Clone the repository
git clone https://github.com/rajsingh18/github-profile-reviewer.git
cd github-profile-reviewer

# Install dependencies
npm install

# Install Ollama (visit https://ollama.com)
ollama pull gemma3:1b

# Create .env.local file
echo "GITHUB_TOKEN=your_token_here" > .env.local

# Run development server
npm run dev

Environment Variables
Create .env.local file:

env
GITHUB_TOKEN=your_github_personal_access_token

Project Structure
text
gitlens-ai/
├── app/
│   ├── analyze/[username]/page.tsx
│   ├── api/
│   │   ├── github/route.ts
│   │   ├── ai-review/route.ts
│   │   └── ai-chat/route.ts
│   ├── components/
│   │   ├── ScoreCard.tsx
│   │   ├── ReadmeAnalyzer.tsx
│   │   ├── SuggestionsList.tsx
│   │   ├── ATSScoreCard.tsx
│   │   ├── PlacementReadiness.tsx
│   │   ├── CompareProfiles.tsx
│   │   └── AIChatBot.tsx
│   └── lib/
│       ├── scoring.ts
│       ├── atsScoring.ts
│       ├── github.ts
│       └── urlUtils.ts
├── public/
│   ├── earth.mp4
│   └── 216761_medium.mp4
└── package.json
🌟 Key Achievements
✅ 100% Local AI - No API costs, complete privacy

✅ Real-time Analysis - Live GitHub API integration

✅ Modern UI - Glassmorphism with video background

✅ Responsive - Works on all screen sizes

✅ Type Safe - Full TypeScript implementation

🤝 Connect With Me
GitHub: @rajsingh18

LinkedIn: https://www.linkedin.com/in/raj-singh-603449223/

Instagram: _rajsingh18_

Email: rajbrijeshsingh1804@gmail.com

📄 License
© 2026 GitLens AI. All rights reserved.
