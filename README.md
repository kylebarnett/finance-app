# Money Made Simple

A friendly, approachable finance education app that explains stocks, markets, and investing in terms anyone can understand - even a 10-year-old!

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?style=flat-square&logo=framer)

## Overview

**Money Made Simple** is designed to make finance accessible and non-intimidating. The app features a warm, playful design aesthetic ("Friendly Finance Treehouse") that invites curiosity while delivering real educational value.

### Key Features

- **Live Market Dashboard** - Real-time updates for DOW, NASDAQ, and S&P 500 with mood indicators and child-friendly explanations
- **Company Explorer** - Search for popular companies and see their financials explained in simple terms with fun analogies
- **Money Words Glossary** - Essential financial terms defined so clearly that anyone can understand them
- **Beautiful Animations** - Smooth, delightful interactions powered by Framer Motion

## Design Philosophy

The app is built around making finance feel welcoming rather than intimidating:

- **Warm Color Palette**: Cream backgrounds, coral accents, soft teals, and sunny yellows
- **Friendly Typography**: Fredoka (playful display font) + DM Sans (readable body text)
- **Visual Metaphors**: Complex concepts explained through relatable comparisons (e.g., "That's enough to buy 50 million ice cream cones!")
- **Mood Indicators**: Market performance shown with emojis that convey sentiment at a glance
- **Rounded Shapes**: Soft, approachable UI elements that feel safe and inviting

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom design tokens
- **Animations**: Framer Motion
- **Fonts**: Google Fonts (Fredoka, DM Sans)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/kylebarnett/finance-app.git
cd finance-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Design system, custom properties, animations
│   ├── layout.tsx       # Root layout with metadata and fonts
│   └── page.tsx         # Main page composition
│
└── components/
    ├── Header.tsx       # Navigation header with logo
    ├── Hero.tsx         # Landing section with animated elements
    ├── MarketDashboard.tsx  # Live market indices display
    ├── CompanySearch.tsx    # Company lookup with financial summaries
    ├── Glossary.tsx     # Interactive financial terms dictionary
    └── Footer.tsx       # Footer with disclaimer and links
```

## Features in Detail

### Market Dashboard

The dashboard displays three major market indices with:
- Live-updating values (simulated for demo purposes)
- Daily change amount and percentage
- "Mood" emoji that reflects market sentiment
- Click-to-expand explanations of what each index tracks
- Pause/resume functionality for updates
- Fun fact ticker with educational tidbits

### Company Search

Search for companies and see:
- Company overview and what they do
- Current stock price with daily change
- Market capitalization with relatable comparisons
- Annual revenue explained simply
- Employee count with scale comparisons
- Founding year with historical context
- CEO information
- Fun facts about each company

**Supported Companies**: Apple, Google, Microsoft, Amazon, Tesla, Disney, Nike, McDonald's, Netflix, Starbucks

### Glossary

Interactive cards explaining:
- Stock, Market, Dividend, Portfolio
- Bull Market, Bear Market
- Interest, Investment

Each term includes a simple definition and a real-world example.

## Customization

### Design Tokens

The design system uses CSS custom properties defined in `globals.css`:

```css
:root {
  --cream: #FFF8F0;
  --coral: #FF7F6B;
  --teal: #4ECDC4;
  --sunny: #FFD166;
  --lavender: #9D8FE5;
  /* ... and more */
}
```

### Adding Companies

To add more companies, edit the `companyDatabase` object in `src/components/CompanySearch.tsx`:

```typescript
const companyDatabase: Record<string, CompanyData> = {
  SYMBOL: {
    symbol: "SYMBOL",
    name: "Company Name",
    logo: "emoji",
    price: 100.00,
    // ... other fields
    description: "Child-friendly description",
    funFact: "Interesting fact about the company",
  },
};
```

## Roadmap

Future enhancements could include:

- [ ] Real API integration (Alpha Vantage, Yahoo Finance)
- [ ] User accounts and watchlists
- [ ] Interactive quizzes and learning paths
- [ ] More companies in the database
- [ ] Historical price charts with simple explanations
- [ ] Mobile app version

## Disclaimer

This application is for **educational purposes only**. The stock prices and market data shown are simulated for demonstration. This is not financial advice. Always consult with a qualified financial advisor before making investment decisions.

## License

MIT License - feel free to use this project for learning or as a starting point for your own finance education tools.

---

Made with care for curious minds everywhere.
