# Forge — Workout Tracker

A personal workout tracker with free-form exercise logging, progression charts, and staleness alerts.

## Features

- Add exercises free-form with custom weight units (lbs, kg, %BW, none)
- Log multiple sets (weight × reps) per session with optional notes
- Staleness alerts when an exercise hasn't been trained in 5+ days
- Weight progression chart per exercise (last 24 sessions)
- PR detection with celebration modal
- All data persisted in browser localStorage

## Tech Stack

- React 18
- Vite
- Chart.js
- No backend — 100% client-side

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Vercel

### Option A — CLI

```bash
npm i -g vercel
vercel
```

### Option B — GitHub (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo — Vercel auto-detects Vite and deploys

Every push to `main` will trigger an automatic redeploy.

## Project Structure

```
forge/
├── index.html              # HTML entry point
├── vite.config.js          # Vite config
├── vercel.json             # Vercel deployment config
├── package.json
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Root component + state
    ├── index.css           # Global styles
    ├── utils.js            # localStorage, date helpers
    ├── components/
    │   ├── Icon.jsx        # SVG icon set
    │   ├── ExerciseRow.jsx # Exercise list item
    │   ├── ProgressChart.jsx # Chart.js progression chart
    │   └── StatCard.jsx    # Metric display card
    └── views/
        ├── Dashboard.jsx   # Home view
        ├── Exercises.jsx   # Exercise library
        └── Log.jsx         # Log session + history
```
