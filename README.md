# Miami Art Basel 2025

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

Your complete guide to art shows, parties, and wellness events during Miami Art Basel Week 2025 (November 30 - December 9).

## Features

- **Event Listings** - Browse 100+ events with search and filters by type, neighborhood, and date
- **Calendar View** - Interactive calendar showing events for each day of Art Basel week
- **Map View** - Explore event locations across Miami neighborhoods with Leaflet maps
- **AI Assistant** - Gemini-powered chatbot to help plan your Art Basel experience
- **Dark Mode** - Sleek dark theme with vibrant gradient accents
- **Fully Responsive** - Optimized for mobile, tablet, and desktop

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini 2.0 Flash
- **Maps:** Leaflet
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/miami-art-basel-2025.git
   cd miami-art-basel-2025
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run update-data` | Regenerate event data from CSV |

## Updating Event Data

Event data is stored in `art-basel-2025.csv`. To update:

1. Edit the CSV file with new/updated events
2. Run `npm run update-data`
3. Restart the dev server or rebuild

### CSV Format

```
ID,Event,Event Type,Start Date,End Date,Schedule,Neighborhood,Address,Notes,Tickets Link,Link
```

**Event Types:** `Art Show`, `Party`, `Wellness`

## Project Structure

```
src/
├── app/
│   ├── api/chat/       # Gemini AI chat endpoint
│   ├── calendar/       # Calendar view page
│   ├── map/            # Map view page
│   ├── page.tsx        # Home page (event listings)
│   └── layout.tsx      # Root layout
├── components/
│   ├── CalendarView.tsx
│   ├── ChatBot.tsx
│   ├── EventCard.tsx
│   ├── EventFilters.tsx
│   ├── Header.tsx
│   ├── MapContainer.tsx
│   └── MapView.tsx
├── data/
│   └── events.json     # Generated event data
├── lib/
│   └── events.ts       # Event utilities
└── types/
    └── event.ts        # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add the `GEMINI_API_KEY` environment variable
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted with `npm run build && npm run start`

## License

MIT License - feel free to use this project for your own events!

---

Built with ❤️ for Miami Art Basel 2025 by Juan Zamudio
