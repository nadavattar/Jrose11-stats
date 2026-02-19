# Jrose11 Stats

A comprehensive Pokemon statistics and analysis dashboard.

## Features

- **Pokemon Detail View**: In-depth stats and information for individual Pokemon.
- **Statistics Dashboard**: Visualizations and data analysis.
- **Comparisons**: Compare different Pokemon side-by-side.
- **Tier Lists**: View and manage Pokemon tier lists.
- **Admin Panel**: Manage data and configurations.

## Tech Stack

- **Frontend**: React, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Routing**: React Router
- **State Management**: React Query (TanStack Query)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nadavattar/Jrose11-stats.git
   cd Jrose11-stats
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server (Client + Local API Server):
   ```bash
   npm run dev:local
   ```
   This will start both the frontend (`localhost:5173`) and the local JSON server (`localhost:3001`).

## Project Structure

- `src/api` - Local API client and mock server integration
- `src/components` - UI components (shadcn/ui) and feature-specific components
- `src/pages` - Application routes/pages
- `server` - Local backend server logic
- `server/data` - JSON data files for the local database

## License

MIT
