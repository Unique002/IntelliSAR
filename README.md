# Barclays Sentinel - AML Investigation Platform

AI-powered Suspicious Activity Report (SAR) generation platform with sentence-level evidence attribution.

## Features

- **Sentence-Level Evidence Attribution**: Click any sentence to see supporting transactions and regulatory citations
- **Typology Detection**: ML-powered pattern detection for structuring, funnel accounts, and geo-risk
- **Regulatory Tone Calibration**: AI-detected assertion strength adjustment to reduce legal exposure
- **Knowledge Graph Visualization**: Visual representation of fund flow patterns
- **Role-Based Workflow**: Analyst → Reviewer → Auditor access controls
- **Compliance Defensibility Score**: Quantified audit-readiness metric

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deploy to Vercel via GitHub

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Barclays SAR platform"

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/barclays-sar-platform.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `barclays-sar-platform` repository
4. Vercel will auto-detect Vite configuration
5. Click "Deploy"

**Build Settings (Auto-detected):**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Your app will be live at: `https://barclays-sar-platform.vercel.app`

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Demo Notes

This is a frontend prototype demonstrating UX concepts for SAR investigation workflows. Backend integration and actual ML models are not implemented.

**Mock Data:**
- All transactions, typology scores, and evidence mappings are hardcoded
- Defensibility scores use static formulas
- No actual database or API calls

**What Works:**
- Interactive sentence → evidence mapping
- Role-based view switching
- Workflow state management
- Knowledge graph visualization

**What Doesn't Work:**
- Similar case detection (shows badge but link is non-functional)
- PDF export (shows alert only)
- Actual pattern detection on new data
- Backend persistence

## License

Demo project for hackathon purposes.
