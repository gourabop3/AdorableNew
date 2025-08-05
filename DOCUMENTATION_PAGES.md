# Documentation and Pricing Pages

This document describes the new documentation and pricing pages that have been added to the Vibe project.

## Overview

Two new pages have been added to provide comprehensive documentation and transparent pricing for the Vibe AI-powered development platform:

1. **Documentation Page** (`/docs`) - Complete tech stack documentation with 22-day learning path
2. **Pricing Page** (`/pricing`) - Transparent pricing with feature comparison

## Documentation Page (`/docs`)

### Features
- **Comprehensive Tech Stack Overview**: Detailed breakdown of all technologies used in the project
- **22-Day Learning Path**: Structured learning curriculum from beginner to expert
- **Interactive Tabs**: Organized content with Overview, Tech Stack, Learning Path, and API Reference
- **Professional Design**: Modern UI with consistent branding

### Tech Stack Categories
1. **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Lucide React
2. **Backend**: Node.js, Drizzle ORM, PostgreSQL, Redis, Zod
3. **AI**: AI SDK, Mastra, Model Context Protocol, Google AI
4. **Deployment**: Vercel, Docker, Git
5. **Tools**: ESLint, Prettier, Drizzle Kit

### Learning Path Structure
- **Days 1-5**: Fundamentals (Next.js, React, Tailwind, Radix UI, State Management)
- **Days 6-10**: Backend & Database (Drizzle ORM, Authentication, API Routes, AI Integration)
- **Days 11-15**: Advanced Features (Real-time, Caching, Testing, Error Handling, Security)
- **Days 16-20**: Optimization & Deployment (CI/CD, Performance, Accessibility, Mobile, Advanced AI)
- **Days 21-22**: Final Steps (Scalability, Production Deployment)

## Pricing Page (`/pricing`)

### Features
- **Three Pricing Tiers**: Free, Pro ($29/month), Enterprise ($99/month)
- **Interactive Toggle**: Monthly/Yearly billing with savings display
- **Feature Comparison**: Detailed comparison table across all plans
- **FAQ Section**: Common questions and answers
- **Professional Design**: Consistent with documentation page

### Pricing Tiers

#### Free Plan
- 5 app generations per month
- Basic AI templates
- Community support
- 1 team member

#### Pro Plan ($29/month, $290/year)
- 100 app generations per month
- Advanced AI templates
- Priority support
- Custom domains
- Up to 5 team members
- Real-time collaboration
- API access

#### Enterprise Plan ($99/month, $990/year)
- Unlimited app generations
- Custom AI models
- Dedicated support
- Custom integrations
- Unlimited team members
- White-label options
- SLA guarantees

## Navigation Updates

### Header Navigation
All pages now include consistent header navigation with:
- Home link
- Documentation link
- Pricing link
- User authentication button

### Footer Updates
Updated footer across all pages to include:
- Quick links to Documentation and Pricing
- Social media links
- Legal links (Privacy Policy, Terms of Service)

## Technical Implementation

### New Components Created
1. **Switch Component** (`src/components/ui/switch.tsx`)
   - Radix UI-based toggle component
   - Used for monthly/yearly billing toggle

### New Pages Created
1. **Documentation Page** (`src/app/docs/page.tsx`)
   - Comprehensive documentation with tabs
   - Tech stack breakdown
   - 22-day learning path
   - API reference

2. **Pricing Page** (`src/app/pricing/page.tsx`)
   - Three-tier pricing structure
   - Interactive billing toggle
   - Feature comparison table
   - FAQ section

### Updated Files
1. **Main Page** (`src/app/page.tsx`)
   - Added Link import
   - Updated footer links to use Next.js Link component
   - Added consistent header navigation

## Design System

### Consistent Styling
- **Color Scheme**: Blue and purple gradient backgrounds
- **Typography**: Geist font family
- **Components**: Radix UI primitives with custom styling
- **Layout**: Responsive grid system with Tailwind CSS

### Interactive Elements
- **Hover Effects**: Smooth transitions on interactive elements
- **Loading States**: Proper loading indicators
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and semantic HTML

## File Structure

```
src/
├── app/
│   ├── docs/
│   │   └── page.tsx          # Documentation page
│   ├── pricing/
│   │   └── page.tsx          # Pricing page
│   └── page.tsx              # Updated main page
├── components/
│   └── ui/
│       └── switch.tsx        # New Switch component
└── ...
```

## Usage

### Accessing the Pages
- **Documentation**: Navigate to `/docs` or click "Documentation" in the header
- **Pricing**: Navigate to `/pricing` or click "Pricing" in the header

### Navigation
- All pages include consistent header navigation
- Footer links provide easy access to all sections
- Breadcrumb-style navigation through header links

## Future Enhancements

### Potential Improvements
1. **Interactive Learning**: Add interactive code examples in documentation
2. **Video Tutorials**: Embed video content in learning path
3. **User Progress Tracking**: Track learning progress for registered users
4. **Dynamic Pricing**: Real-time pricing updates based on usage
5. **Multi-language Support**: Internationalization for global users

### Technical Enhancements
1. **SEO Optimization**: Meta tags and structured data
2. **Performance**: Image optimization and lazy loading
3. **Analytics**: User behavior tracking
4. **A/B Testing**: Pricing page variations
5. **CMS Integration**: Content management for documentation

## Conclusion

The new documentation and pricing pages provide a professional, comprehensive experience for users exploring the Vibe platform. The consistent design system and navigation ensure a cohesive user experience across all pages, while the detailed content helps users understand the platform's capabilities and pricing structure.