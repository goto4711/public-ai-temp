# Implementation Plan: The Difference Suite

## Goal
Integrate 11 existing "Little Tools of Difference" into a single, unified web application called the **Difference Suite**. This platform will allow users to upload a dataset once and analyze it through multiple critical lenses (time, ambiguity, latent space, etc.), culminating in a comprehensive "Difference Report."

## Architecture

### 1. Project Structure
We will create a new React application `difference-suite` alongside the existing apps.
```
public-ai-app/
├── difference-suite/       # NEW: The unified platform
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/     # UI components (Layout, Header, Button)
│   │   │   ├── dashboard/  # Main overview view
│   │   │   └── tools/      # Integrated apps go here
│   │   │       ├── AmbiguityAmplifier/
│   │   │       ├── ContextWeaver/
│   │   │       └── ...
│   │   ├── stores/         # Zustand state management
│   │   ├── types/          # Shared TypeScript interfaces
│   │   └── utils/          # Shared helpers (embeddings, file parsing)
│   └── ...
└── ... (existing apps)
```

### 2. Tech Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS (using the Deep Culture design system)
- **State Management**: Zustand (for global dataset state)
- **Routing**: React Router (v6)
- **Visualization**: D3.js / Recharts
- **ML**: TensorFlow.js / Transformers.js

### 3. Unified Data Model
The core innovation is the shared state. Tools will no longer manage their own file uploads but will consume from a central store.

```typescript
// src/types/index.ts
export interface DataItem {
  id: string;
  content: string | File; // URL or raw text
  type: 'image' | 'text';
  metadata?: any;
  embedding?: number[]; // Computed once, shared across tools
}

export interface SuiteState {
  dataset: DataItem[];
  projectName: string;
  activeTools: string[];
  results: Record<string, any>; // Store analysis results by tool ID
  addItems: (items: DataItem[]) => void;
  updateResult: (toolId: string, result: any) => void;
}
```

## Phased Implementation Steps

### Phase 1: Foundation & Scaffolding
**Objective**: Set up the shell application and shared infrastructure.
1.  **Initialize App**: Create `difference-suite` using Vite (React + TS).
2.  **Design System**: Port the `index.css` and Tailwind config from `deep-vector-mirror` (the most recent aesthetic reference).
3.  **Layout**: Create the `MainLayout` with a sidebar navigation and a dynamic content area.
4.  **State Store**: Implement the Zustand store for holding the dataset.
5.  **Data Uploader**: Create a robust `DataUploader` component that handles:
    *   Image files (drag & drop)
    *   Text files (.txt, .csv)
    *   Basic validation

### Phase 2: Core Tool Integration (The "Easy" Ones)
**Objective**: Port standalone tools that operate on single items or simple lists.
*Strategy*: Refactor each app into a component that accepts `data` as a prop or selects it from the store.
1.  **Deep Vector Mirror**: Port as the default "Inspector" view.
2.  **Ambiguity Amplifier**: Refactor to accept an image from the store instead of a webcam/upload.
3.  **Glitch Detector**: Port the anomaly detection logic.
4.  **Latent Space Navigator**: Port the interpolation logic.

### Phase 3: Text & Network Tools
**Objective**: Integrate text-heavy tools.
1.  **Detail Extractor**: Connect to the text data in the store.
2.  **Context Weaver**: Allow selecting a "Context" corpus to compare against the uploaded dataset.
3.  **Networked Narratives**: Port the entity extraction and graph visualization.

### Phase 4: Advanced & Temporal Tools
**Objective**: Integrate complex logic.
1.  **Discontinuity Detector**: Handle time-series data (requires parsing timestamps from uploads).
2.  **Noise Predictor**: Port the autoencoder logic.
3.  **Threshold Adjuster**: Implement the interactive decision boundary visualization.
4.  **Imagination Inspector**: (Note: This requires backend generation, might be mocked or connected to an API if available).

### Phase 5: The "Difference Report"
**Objective**: Aggregate findings.
1.  **Results Collection**: Ensure each tool writes its key findings (outliers, ambiguity scores) back to the global `results` store.
2.  **Report View**: Create a summary page that visualizes these aggregated metrics.
3.  **Export**: Implement PDF/JSON export.

## Detailed Task List

### 1. Setup
- [ ] Initialize `difference-suite` project
- [ ] Install dependencies (`zustand`, `react-router-dom`, `lucide-react`, `clsx`, `tailwind-merge`, `@tensorflow/tfjs`, `d3`, `framer-motion`)
- [ ] Configure Tailwind with Deep Culture colors/fonts

### 2. Shared Components
- [ ] `Sidebar`: Navigation menu
- [ ] `Header`: Project info
- [ ] `Panel`: Standard container for tools
- [ ] `Button`, `Input`, `Slider`: Reusable UI elements

### 3. Data Layer
- [ ] Define TypeScript interfaces
- [ ] Create `useSuiteStore`
- [ ] Build `DataUploader` page

### 4. Tool Migration (Iterative)
For each tool:
- [ ] Copy source files to `src/components/tools/<ToolName>`
- [ ] Remove local `App.jsx` and `index.css`
- [ ] Refactor main component to accept `data` prop
- [ ] Hook up inputs/outputs to global store
- [ ] Add route to `App.tsx`

### 5. Final Polish
- [ ] Dashboard Overview page
- [ ] Global error handling
- [ ] Performance testing (lazy loading tools)

## Migration Strategy: "Copy & Adapt"
We will not delete the old apps yet. We will copy their logic into the new suite. This ensures we have a reference implementation if things break.

**Key Challenge**: Dependency Management.
*   Some apps use `compromise`, others `natural`, others `tensorflow`.
*   We need to install ALL these dependencies in the `difference-suite` `package.json`.

## Next Step
Start Phase 1: Initialize the project and set up the shared layout.
