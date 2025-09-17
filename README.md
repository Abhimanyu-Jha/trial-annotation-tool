# Next.js + shadcn/ui Template

A modern Next.js template with shadcn/ui design system and built-in dark/light mode theming.

## Features

- ⚡ **Next.js 15** with App Router
- 🎨 **shadcn/ui** design system
- 🌙 **Dark/Light mode** with system preference support
- 📱 **Responsive design**
- 🔧 **TypeScript** support
- 💅 **Tailwind CSS**
- 📏 **ESLint** configuration

## Quick Start

### Using as GitHub Template

1. Click "Use this template" button on GitHub
2. Clone your new repository
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`

### Manual Setup

```bash
npx degit your-username/nextjs-shadcn-template my-new-project
cd my-new-project
npm install
npm run dev
```

## What's Included

### Components
- `ThemeProvider` - Handles theme switching
- `ThemeToggle` - Sun/moon toggle button with dropdown
- shadcn/ui components: Button, Card, Dropdown Menu

### Theme System
- Automatic dark/light mode detection
- Manual theme switching
- Consistent color variables
- Smooth transitions

## Customization

### Adding New shadcn/ui Components
```bash
npx shadcn@latest add [component-name]
```

### Theme Colors
Edit `src/app/globals.css` to customize the color palette.

### Layout
Modify `src/app/layout.tsx` for global layout changes.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles and theme variables
├── components/
│   ├── theme-provider.tsx  # Theme context provider
│   ├── theme-toggle.tsx    # Theme switching component
│   └── ui/                 # shadcn/ui components
└── lib/
    └── utils.ts            # Utility functions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT