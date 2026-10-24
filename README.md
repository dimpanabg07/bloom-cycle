# Bloom Cycle 🌸

A calm, private menstrual cycle tracker built with plain HTML, CSS and JavaScript — no build
step, no dependencies, no account.

Bloom Cycle helps you log your cycle, understand your phases, spot symptom patterns and find
gentle relief for PMS.

## Run it locally

**Option 1 — double click**

Open `index.html` in your browser. Everything works from the file system.

**Option 2 — tiny local server (recommended)**

```bash
# Python 3
python -m http.server 5173

# or Node
npx serve .
```

Then visit <http://localhost:5173>.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Home | `index.html` | Greeting, cycle day ring, next period, mini calendar, daily tip, quick links |
| Cycle Tracker | `tracker.html` | Cycle settings, daily check-in (flow, symptoms, mood, energy, notes), edit/delete, phase calendar |
| Analysis | `analysis.html` | Averages, next-period estimate, cycle-length chart, symptom and mood frequencies, insights, cycle history |
| PMS Relief | `pms-relief.html` | Seven home remedies with how-to steps, benefits and precautions |
| Exercises | `exercises.html` | Beginner exercise library, routine generator, "done today" tracking |
| About | `about.html` | The idea behind the app, how the calculations work, FAQ |

## Project structure

```
Tyro2/
├── index.html
├── tracker.html
├── analysis.html
├── pms-relief.html
├── exercises.html
├── about.html
├── css/
│   ├── styles.css       design tokens, nav, cards, buttons, forms
│   └── pages.css        dashboard, calendar, charts, page-specific pieces
└── js/
    ├── data.js          symptoms, moods, phases, remedies, exercises, tips
    ├── cycle.js         date maths, period detection, averages, phases
    ├── store.js         localStorage read/write, sample data
    ├── ui.js            navigation, footer, toast, phase calendar, ring
    ├── home.js          dashboard rendering
    ├── tracker.js       check-in form and entries
    ├── analysis.js      charts and generated insights
    ├── relief.js        remedy cards
    └── exercises.js     routine generator and exercise library
```

## Where the numbers come from

- **Cycle starts** are detected from days where you logged flow, plus the "first day of your
  last period" you enter in the tracker. Two starts closer than 10 days are treated as one period.
- **Average cycle length** is the mean of the gaps between consecutive cycle starts. Until you
  have logged cycles, the app falls back to the length you entered in your settings.
- **Phases**: menstrual = your period days, ovulation is estimated ~14 days before the next
  period, follicular and luteal fill the rest. Every date on the calendar is labelled an estimate.
- **Insights** count symptoms and moods per cycle, e.g. "Cramps were reported in 3 of your last
  4 tracked cycles."

## Saving data

Everything lives in `localStorage` under the key `bloomcycle.v1`:

```js
{
  profile: { name, lastPeriodStart, cycleLength, periodDuration },
  logs: [{ date, flow, symptoms, mood, energy, notes }],
  exerciseDone: { "2026-10-24": ["cat-cow"] },
  periodStarts: []
}
```

No data ever leaves the browser. Use **Clear all data** in the tracker to remove everything, or
**Load sample data** to explore the app with a few cycles of demo entries.

## Customising

- Colours, radii and shadows live in the `:root` block of `css/styles.css`.
- Copy for remedies, exercises, moods and tips lives in `js/data.js` — edit it there and every
  page updates.

## A note on scope

Bloom Cycle is an educational project. Predictions are estimates, not contraception and not a
diagnosis. Anyone with severe, persistent or disruptive symptoms should speak with a qualified
healthcare professional.
