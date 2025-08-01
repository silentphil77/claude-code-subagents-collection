# Claude Code Subagents Collection - Web UI

A modern web interface for browsing and installing Claude Code subagents.

## Features

- 🔍 Browse 40+ specialized AI subagents
- 🏷️ Filter by category (Development, Infrastructure, Security, etc.)
- 🔎 Real-time search functionality
- 📋 One-click copy to clipboard for any subagent
- 💾 Direct download of individual subagent markdown files
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
- Static generation for all subagent pages
- Optimized build settings in `vercel.json`

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
│   ├── browse/          # Browse page
│   ├── subagent/[slug]/ # Dynamic subagent pages
│   └── page.tsx         # Home page
├── components/          # React components
├── lib/                 # Utility functions
└── public/             # Static assets
```

## Contributing

See the main repository's [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.