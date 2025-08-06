# Vibe

An open source AI app builder that creates full-stack applications with real-time streaming and intelligent code generation.

## Features

- **AI-Powered Development**: Uses Gemini 2.5 Pro for intelligent code generation
- **Real-time Streaming**: Live updates as the AI builds your application
- **Full-stack Applications**: Creates complete web applications with frontend and backend
- **Website Cloning**: Clone any website with Google Custom Search integration
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **Auto-deploy**: Automatic deployment to Vercel with every commit

# Trigger Vercel auto-deploy

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI Integration**: Vercel AI SDK, Gemini AI
- **Backend**: Next.js API Routes, Redis
- **Streaming**: Server-Sent Events (SSE) with resumable streams
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gourabop3/Vibe.git
   cd Vibe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   REDIS_URL=your_redis_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Quick Start

1. **Create a new project** by clicking "New Project"
2. **Describe your idea** in natural language (e.g., "Build a todo app with dark mode")
3. **Watch AI generate** your complete application
4. **Chat with AI** to modify and improve your code
5. **Save and manage** your projects

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Gemini AI API key | Yes |
| `REDIS_URL` | Redis connection URL | Yes |

### Streaming Configuration

The platform uses configurable streaming settings for optimal performance:

- **Chunk Delay**: Controls the speed of text streaming
- **Polling Intervals**: Manages real-time updates
- **Debouncing**: Prevents UI flickering
- **Request Deduplication**: Avoids duplicate requests

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 Usage Examples

### Basic Project Generation

```
"Create a simple calculator app with a modern UI"
```

### Framework-Specific Requests

```
"Build a React todo app with TypeScript and Tailwind CSS"
"Generate a Next.js blog with MDX support"
"Create a Vue.js e-commerce template"
```

### Feature Requests

```
"Add dark mode to my existing app"
"Implement user authentication with JWT"
"Add a search feature with filters"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆕 Latest Update

**Auto-deploy trigger** - Updated README to ensure Vercel deployment is working correctly.

**AI Improvements** - Fixed file editing issues, added HTTP testing capabilities, and improved error handling to prevent AI from asking users to verify things it can check itself.

---

**Built with ❤️ using Next.js and AI** - Updated deployment
