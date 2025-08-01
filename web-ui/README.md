# Claude Code Subagents & Commands Collection - Web UI

A modern web interface for browsing and installing Claude Code subagents and slash commands.

## Features

- 🤖 Browse 43+ specialized AI subagents
- 🔧 Explore 39+ slash commands for automation
- 🏷️ Filter by category (Development, Infrastructure, Security, Git, Testing, etc.)
- 🔎 Real-time search functionality
- 📋 One-click copy to clipboard
- 💾 Direct download of markdown files
- 📱 Fully responsive design
- 🌙 Dark mode support
- ⚡ Built with Next.js 15 and shadcn/ui

## Local Development

1. Navigate to the web-ui directory:
   ```bash
   cd web-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push the repository to GitHub
2. Import the project to Vercel
3. Set the root directory to `web-ui`
4. Deploy!

The site is optimized for Vercel with:
- Automatic deployments on push
- Static generation for all subagent and command pages
- Optimized build settings in `vercel.json`
- Automatic syncing with latest subagents and commands from main branch

### Other Platforms

The site can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Self-hosted with Node.js

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React + Radix Icons

## Project Structure

```
web-ui/
├── app/                  # Next.js app directory
│   ├── browse/          # Browse subagents page
│   ├── commands/        # Browse commands page
│   ├── subagent/[slug]/ # Dynamic subagent pages
│   ├── command/[slug]/  # Dynamic command pages
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── subagent-card.tsx
│   ├── command-card.tsx
│   └── ...
├── lib/                 # Utility functions
│   ├── subagents-server.ts
│   ├── commands-server.ts
│   └── ...
└── public/             # Static assets
```

## Contributing

See the main repository's [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.