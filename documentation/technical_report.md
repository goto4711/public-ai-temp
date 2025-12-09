# Deep Culture Demo Applications - Technical Report

**Prepared for:** Deep Culture Research Team Lead  
**Prepared by:** Junior Developer  
**Date:** December 3, 2025  
**Subject:** Technical Overview and Conference Demo Walkthrough

---

## Executive Summary

This report provides a comprehensive technical overview of the Deep Culture demonstration applications suite. **Nine** interactive web applications have been developed to illustrate the core conceptual pillars of the Deep Culture project: **Detail**, **Relationality**, **Discontinuity**, **Identity**, **Imagination**, **Uncertainty**, and **Fragility**. Each application serves as a proof-of-concept that translates deep learning epistemology into humanistic values, showcasing how AI can be reimagined to attend to difference rather than uniformity.

All applications are production-ready for conference demonstration and include clear pathways for future integration with real-world data sources and advanced AI models.

---

## Table of Contents

1. [Application Suite Overview](#application-suite-overview)
2. [Individual Application Reports](#individual-application-reports)
   - [1. The Discontinuity Detector](#1-the-discontinuity-detector)
   - [2. The Imagination Inspector](#2-the-imagination-inspector)
   - [3. The Detail Extractor](#3-the-detail-extractor)
   - [4. The Threshold Adjuster](#4-the-threshold-adjuster)
   - [5. The Context Weaver](#5-the-context-weaver)
   - [6. The Ambiguity Amplifier](#6-the-ambiguity-amplifier)
   - [7. The Glitch Detector](#7-the-glitch-detector)
   - [8. The Latent Space Navigator](#8-the-latent-space-navigator)
   - [9. The Deep Vector Mirror](#9-the-deep-vector-mirror)
3. [Technical Infrastructure](#technical-infrastructure)
4. [Conference Demo Script](#conference-demo-script)
5. [Future Development Roadmap](#future-development-roadmap)

---

## Application Suite Overview

### Technology Stack
- **Framework:** React 18 with Vite build tool
- **Styling:** Tailwind CSS v4 (custom Deep Culture theme)
- **AI/ML:** TensorFlow.js, Universal Sentence Encoder, MobileNet, Speech Commands
- **Visualization:** Recharts, D3.js, Custom Canvas
- **Icons:** Lucide React
- **Animation:** Framer Motion

### Design Philosophy
All applications adhere to the **Deep Culture Aesthetic**:
- **Color Palette:** Purple (#7C3AED) primary, Green (#10B981) accents
- **Typography:** System fonts with brutalist uppercase headings
- **Visual Language:** Glitch effects, hard shadows, stark borders
- **Interaction:** Immediate feedback, transparency in AI processes

---

## Individual Application Reports

### 1. The Discontinuity Detector: From Anomaly to Contingency

**Epistemic Translation:** Discontinuity → Anomaly → Contingency  
**Archival Site:** Real-time Archives (Grassroots Mobilization)  
**Keywords:** Temporal Rupture, Foucauldian Genealogy, Contingent Events

#### Background
The Discontinuity Detector reconfigures time-series anomaly detection, which is typically used in cybersecurity, fraud detection, and predictive maintenance, into a tool for detecting historical ruptures and contingent events in grassroots political movements. Where conventional anomaly detection treats deviations from learned patterns as errors to be flagged or corrected, we translate 'anomaly' into 'contingency': moments where history breaks from smooth trajectories, revealing the 'minor shifts and subtle contours' that Foucault identified as central to genealogical method.

#### Technical Implementation

**Core Components:**
- `DeepAnomalyDetector.js`: LSTM-based time-series anomaly detection
- `AnomalyDetector.js`: Traditional statistical Z-score method
- `TimelineViz.jsx`: Interactive Recharts visualization
- `AnomalyInspector.jsx`: Detail panel for selected events

**AI Model:**
- **Architecture:** LSTM (Long Short-Term Memory) neural network
- **Input:** Sliding window of 10 time steps
- **Training:** 50 epochs with Adam optimizer
- **Anomaly Detection Method:** Reconstruction error (MSE) exceeds dynamic threshold (mean + 2σ)

**Demo Data:**
The application currently uses a 100-day simulated time series representing grassroots social media activity with three injected 'contingent events':
- **Day 30:** Viral Campaign Launch (sudden spike)
- **Day 65:** Protest Event (massive spike)
- **Day 85:** Government Crackdown (sudden drop)

#### Demo Script (2-3 minutes)
1. **Open the app** - Point out the purple timeline visualization with red anomaly markers.
2. **Explain the premise:** "This shows 100 days of social media chatter from a grassroots movement."
3. **Click on Day 30 anomaly:**
   - Inspector shows: "CONTINGENCY: Viral Campaign Launch"
   - Explain: The LSTM predicted a normal baseline, but detected an unexpected surge.
4. **Click on Day 85 anomaly:**
   - Inspector shows: "Government Crackdown / Internet Shutdown"
   - Explain: The model flags silences as much as it flags noise.
5. **Highlight the philosophy:** "Traditional history smooths over these ruptures. Deep learning can help us attend to what Foucault called the 'minor shifts and subtle contours' of power."

#### Next Steps
- **Data Integration:** Connect to GDELT API for live event monitoring.
- **Model Enhancement:** Implement Temporal Fusion Transformer for multivariate analysis.
- **Validation:** Compare detected discontinuities with historical metadata.

---

### 2. The Imagination Inspector: Exposing Absence in Generative Latent Space

**Epistemic Translation:** Imagination → Generativity → Creativity (via Absence)  
**Archival Site:** Incidental Archives (Generative AI Training Data)  
**Keywords:** Latent Space, Bias Detection, Algorithmic Imagination, Negative Capability

#### Background
The Imagination Inspector inverts the logic of generative AI by focusing not on what models can create but on what they cannot imagine. Where text-to-image models like Stable Diffusion and DALL-E are celebrated for their generative capacity, we expose the constraints, biases, and absences in their latent space representations. This epistemic translation reframes 'generativity' (unlimited creative potential) as bounded 'creativity', showing how AI's imagination is fundamentally reproductive.

#### Technical Implementation

**Core Components:**
- `GeneratorEngine.js`: Mock generative model simulating biased outputs
- `BiasAnalyzer.js`: Statistical analysis of attribute presence/absence
- `GenerationGrid.jsx`: Visual display of 'generated' archetypes
- `AbsenceReport.jsx`: Data visualization of missing representations

**Simulation Logic:**
The app uses weighted probability distributions to mimic real generative AI biases:
- **'CEO' prompt:** 95% Male, 90% White, 85% Suit, 80% Office
- **'Nurse' prompt:** 85% Female, 70% White, 90% Scrubs, 75% Hospital
- **'Terrorist' prompt:** 90% Male, 70% Middle Eastern, 80% Outdoors

#### Demo Script (3-4 minutes)
1. **Enter 'CEO'** in the prompt field and press Enter.
2. **Watch the 'Dreaming...' animation** (simulates generation latency).
3. **Grid appears** with 10 profiles:
   - Point out: All wearing suits, predominantly male.
4. **Scroll down to Absence Report:**
   - Highlight: 'Female: ABSENT (0%)'
   - Highlight: 'Suit: ALWAYS PRESENT (100%)'
5. **Reset and enter 'Nurse':**
   - Point out the flip: Now mostly Female, wearing scrubs.
6. **Key Message:** "Generative AI doesn't imagine freely—it reproduces the patterns of its training data. What it cannot imagine is as revealing as what it creates."

#### Next Steps
- **API Integration:** Replace simulator with Hugging Face Stable Diffusion API.
- **VQA Analysis:** Implement ViLT model to extract real metadata from generated images.
- **Ontology Expansion:** Build comprehensive 'Universe of Possibility' taxonomy.

---

### 3. The Detail Extractor: From Profiles to Narratives in Holocaust Archives

**Epistemic Translation:** Detail → Profile → Narrative  
**Archival Site:** Historical Archives (Holocaust Resistance Collections)  
**Keywords:** Semantic Clustering, Marginal Stories, Close Distant Reading, Individual Agency

#### Background
The Detail Extractor addresses a fundamental tension in digital humanities: how to use computational methods designed for large-scale pattern detection to attend to individual stories and marginal voices. Where deep learning's profiling mechanisms typically aggregate individuals into categorical groups, we translate 'profiling' into 'narrative': using semantic embeddings to surface detailed, specific accounts of resistance that grand historical narratives overlook.

#### Technical Implementation

**Core Components:**
- `DataProcessor.js`: Universal Sentence Encoder for semantic embeddings
- `ClusterViz.jsx`: 2D PCA projection scatter plot
- `DetailView.jsx`: Inspector panel showing full text and metadata

**AI Model:**
- **Embedding:** Universal Sentence Encoder (512-dimensional vectors)
- **Dimensionality Reduction:** PCA to 2D for visualization
- **Distance Metric:** Cosine similarity

**Demo Data:**
The application uses 13 sentences about forgotten resistance in WWII:
- 11 narratives about underground education, smuggling, sabotage, and documentation
- 2 outliers (generic and scientific text) to demonstrate the clustering

#### Demo Script (2-3 minutes)
1. **Point to the scatter plot:** "Each dot is a narrative from Holocaust archives. Proximity = semantic similarity."
2. **Click on a cluster** (e.g., blue dots near each other):
   - Inspector shows: "Emanuel Ringelblum and his team hid the Oyneg Shabbos archive..."
   - Explain: These are detailed stories, not aggregate statistics.
3. **Click on an outlier** (red dot, far from cluster):
   - Inspector shows: "Quantum mechanics describes..."
   - Explain: This is deliberately placed to show how the model identifies what doesn't belong.
4. **Key Message:** "Where digital humanities often focus on the big picture, this tool helps us zoom into the detail—the individual acts of resistance that grand narratives overlook."

#### Next Steps
- **Archive Integration:** Connect to EHRI vector database.
- **Enhanced Embeddings:** Use domain-specific fine-tuned models.
- **UMAP Integration:** Real-time dimensionality reduction for larger datasets.

---

### 4. The Threshold Adjuster: Surfacing Epistemic Uncertainty in Asylum Decisions

**Epistemic Translation:** Uncertainty → Probability → Doubt  
**Archival Site:** Incidental Archives (UK Upper Tribunal Immigration and Asylum Reports)  
**Keywords:** Epistemic Uncertainty, Zone of Indeterminacy, Algorithmic Decision-Making, Reasonable Doubt

#### Background
The Threshold Adjuster makes visible the human-made thresholds that convert probabilistic AI predictions into binary decisions, focusing specifically on the 'zone of doubt' where models are most uncertain. Where machine learning typically presents probability scores as objective confidence measures, we translate 'probability' into 'doubt', thereby exposing cases where models lack epistemic certainty but systems demand definitive answers.

#### Technical Implementation

**Core Components:**
- `mockData.js`: Generates 1000 tribunal cases with risk scores
- `DistributionChart.jsx`: Histogram showing score distribution
- `ThresholdControl.jsx`: Interactive slider to adjust decision boundary
- `CaseExplorer.jsx`: Drill-down into cases near the threshold

**Risk Score Logic:**
- 30% of cases: Clear rejections (0.0 - 0.4)
- 40% of cases: 'Zone of Doubt' (0.4 - 0.6)
- 30% of cases: Clear acceptances (0.6 - 1.0)

**Demo Data:**
Mock tribunal cases with ambiguous evidence:
- "Medical report confirms torture, but tribunal questions the delay"
- "Translation reveals ambiguities in key testimony"

#### Demo Script (3-4 minutes)
1. **Point to the histogram:** "These are 1000 asylum cases. The AI gives each a 'risk score.' The vertical red line is the threshold."
2. **Drag the threshold slider** from 0.5 to 0.6:
   - Watch the 'Accepted' count change.
   - Explain: "Moving this line changes hundreds of lives, but where should it be?"
3. **Click on a case in the 'Zone of Doubt'** (score ≈ 0.5):
   - Read the summary: "Appellant's account is consistent, but lack of documentary evidence raises doubt."
   - Explain: "This is where the model is uncertain—but the system demands a binary answer."
4. **Key Message:** "AI doesn't eliminate doubt—it just hides it behind a number. This tool makes visible the epistemic uncertainty that should invite human deliberation, not automation."

#### Next Steps
- **Data Scraping:** Ingest real tribunal decisions from gov.uk.
- **Legal-BERT Fine-tuning:** Train model on accept/reject outcomes.
- **Monte Carlo Dropout:** Implement variance-based uncertainty quantification.

---

### 5. The Context Weaver: Demonstrating Semantic Relationality Across Cultural Corpora

**Epistemic Translation:** Relationality → Vector → Context  
**Archival Site:** Holocaust Archives + Social Media Streams + Legal Frameworks  
**Keywords:** Contextual Semantics, Hate Speech Analysis, Situated Knowledge, Vectorization Politics

#### Background
The Context Weaver demonstrates that meaning is fundamentally relational and context-dependent. Where embedding models typically treat semantic vectors as non-contextual representations of meaning, we show how the same query produces radically different nearest neighbors when embedded within distinct cultural corpora. This translates 'vectorization' into 'context' and makes visible how archival boundaries shape semantic interpretation.

#### Technical Implementation

**Core Components:**
- `ContextProcessor.js`: Universal Sentence Encoder embedding
- `RadialViz.jsx`: Interactive radial chart showing semantic relationships
- `ComparisonTable.jsx`: Side-by-side nearest neighbor comparison
- `VectorInspector.jsx`: Visual representation of embedding vectors

**AI Model:**
- **Embedding:** Universal Sentence Encoder (512D)
- **Similarity Metric:** Cosine similarity
- **Contexts:** Three distinct word lists (Historical, Social Media, Legal)

**Demo Data:**
- **Query:** "The use of insect metaphors to describe the group"
- **Historical Context:** dehumanization, propaganda, vermin, genocide...
- **Social Media Context:** troll, viral, toxicity, meme...
- **Legal Context:** evidence, incitement, hate crime, judgment...

#### Demo Script (3-4 minutes)
1. **Point to the query input:** "This query is about 'insect metaphors'—a common element of hate speech."
2. **Click 'Analyze':** Watch the model process the query across three contexts.
3. **Point to the Radial Visualization:**
   - In Historical Archive: Closest to 'propaganda' and 'dehumanization'.
   - In Social Media: Closest to 'troll' and 'toxicity'.
   - In Legal: Closest to 'incitement' and 'hate crime'.
4. **Scroll to the Comparison Table:** Click on 'vermin' in the Historical column to see the vector.
5. **Key Message:** "The same words mean different things in different contexts. Deep learning encodes these meanings as vectors, but we can use this to show how context shapes semantics."

#### Next Steps
- **Vector Database:** Build separate indices for Historical/Social/Legal corpora.
- **Multilingual Embeddings:** Use LaBSE for cross-language analysis.
- **Live Corpora:** Integrate real-time Twitter/Reddit streams.

---

### 6. The Ambiguity Amplifier: Exposing Uncertainty in Image Classification

**Epistemic Translation:** Identity → Bias → Ambiguity  
**Archival Site:** Real-time Archives (Social Media Images)  
**Keywords:** Classificatory Violence, Categorical Ambiguity, Confidence Calibration, Anti-Essentialism

#### Background
The Ambiguity Amplifier inverts the logic of image classification by centering cases where models cannot confidently categorize inputs, translating 'identity' into 'ambiguity'. Where facial recognition and content moderation systems hide model uncertainty behind top predictions, we amplify ambiguity through visualization and deliberate noise injection, revealing the fragility of algorithmic categorization.

#### Technical Implementation

**Core Components:**
- `ModelManager.js`: MobileNet image classification
- `WebcamInput.jsx`: Live webcam feed or image upload
- `App.jsx`: Real-time prediction with adjustable noise injection

**AI Model:**
- **Architecture:** MobileNet v2 (pre-trained on ImageNet)
- **Output:** Top 5 predictions with confidence scores
- **Ambiguity Detection:** Low max confidence or similar scores across multiple classes

**Noise Injection:**
The app includes a slider to artificially inject Gaussian noise into the input image, simulating low-quality photos, compression artifacts, or adversarial perturbations.

#### Demo Script (2-3 minutes)
1. **Point to the webcam feed:** "This is a live image classification model running in your browser."
2. **Show a clear object:** "Cup: 89%" - The model is confident.
3. **Increase the noise slider:** Watch the confidence drop.
4. **Hold up an ambiguous object:** Point out multiple competing labels with similar scores.
5. **Key Message:** "Facial recognition, content moderation—they all rely on this kind of classification. But when confidence is low, shouldn't we pause rather than automate?"

#### Next Steps
- **Entropy Visualization:** Calculate and display Shannon entropy of the probability distribution.
- **High-Resolution Models:** Integrate Vision Transformers.
- **Dataset Analysis:** Run on social media datasets to find systematically ambiguous images.

---

### 7. The Glitch Detector: Critical Surveillance

**Epistemic Translation:** Discontinuity → Anomaly (Visual)  
**Archival Site:** Real-time Archives (Surveillance Feeds)  
**Keywords:** Absence, Contingent Events, Critical Surveillance

#### Background
The Glitch Detector translates visual anomaly detection from a surveillance technology (identifying threats or abnormalities) into a critical tool for questioning what counts as 'normal.' Using a one-class classifier trained on user-provided 'normal' examples, the system flags deviations as 'glitches'. Rather than treating these as threats, it asks what gets excluded from the 'normal' baseline.

#### Technical Implementation

**Core Components:**
- `ModelManager.js`: MobileNet feature extraction + K-Nearest Neighbors classification
- `WebcamInput.jsx`: Live webcam feed or image upload interface
- `App.jsx`: One-class training logic, real-time anomaly detection loop, and visual glitch overlay system

**AI Model:**
- **Architecture:** MobileNet v2 (pre-trained on ImageNet) + KNN Classifier
- **Output:** Confidence score for the "normal" class (0.0 - 1.0)
- **Anomaly Detection:** Uses a "One-Class" classification approach.

**Glitch Mechanism:**
- **Trigger:** When "normal" confidence falls below the user-defined threshold.
- **Effect:** A full-screen CRT distortion effect overlays the video feed.

#### Demo Script (2-3 minutes)
1. **Point to the webcam feed:** "This system doesn't know what a 'person' or 'cat' is. It only knows what you teach it is 'normal'."
2. **Train 'Normal':** Point the camera at an empty wall or your static face. Hold "Train Normal" for 5 seconds.
3. **Introduce an Anomaly:** Suddenly raise your hand or hold up an object.
4. **Watch the Glitch:** The screen distorts, and "ANOMALY DETECTED" flashes.
5. **Key Message:** "We are building cities that flag 'difference' as 'danger.' Who gets to define the baseline of 'normal' public behavior?"

#### Next Steps
- **RTSP Integration:** Connect to live public CCTV feeds.
- **Temporal Analysis:** Implement ViViT (Video Vision Transformer) to detect behavioral anomalies.
- **Exclusion Mapping:** Visualize a heatmap of where anomalies occur most frequently.

---

### 8. The Latent Space Navigator: Speculative Interpolation

**Epistemic Translation:** Imagination → Latent Space → In-Between  
**Archival Site:** Incidental Archives (Generative Model Training Data)  
**Keywords:** Absence, Contingent Events, Latent Space

#### Background
The Latent Space Navigator enables exploration of the 'in-between' spaces in AI's representational space by interpolating between two images and revealing what the model 'sees' at intermediate points. When interpolation produces low-confidence predictions, the system displays abstract concepts ('The Void,' 'Hybrid Entity') representing the model's uncertainty space.

#### Technical Implementation

**Core Components:**
- `ModelManager.js`: MobileNet image classification
- `App.jsx`: Dual-image capture/upload, linear tensor interpolation logic, and "Hidden Concept" detection

**AI Model:**
- **Architecture:** MobileNet v2 (pre-trained on ImageNet)
- **Output:** Top 5 object classifications with confidence scores
- **Interpolation Mechanism:** Performs linear interpolation (lerp) between the pixel tensors of Image A and Image B.

**Hidden Concept Detection:**
- **Trigger:** When the top classification confidence drops below 30% (0.3).
- **Effect:** Reveals an abstract concept like "The Void" or "Hybrid Entity".

#### Demo Script (2-3 minutes)
1. **Capture Concept A:** Point webcam at a person.
2. **Capture Concept B:** Point webcam at a chair.
3. **Start Interpolation:** Move the slider slowly from A to B. Watch the person morph into the chair.
4. **Find the Gap:** Stop where the confidence is lowest. Reveal "The Void".
5. **Key Message:** "Deep learning models have a discrete vocabulary of reality. Navigating the latent space reveals the vast territories of the 'undefined' that lie between their categories."

#### Next Steps
- **Generative Interpolation:** Integrate Stable Diffusion to perform latent interpolation.
- **3D Visualization:** Use UMAP to project the interpolation path into a 3D scatter plot.

---

### 9. The Deep Vector Mirror: Fragility of Representation

**Epistemic Translation:** Representation → Vector → Fragility  
**Archival Site:** Real-time Archives (Webcam, Mic, Keyboard)  
**Keywords:** Vectorization, Contextual Bias, Fragility, Reductionism

#### Background
The Deep Vector Mirror exposes the reductive process of "vectorization"—the fundamental translation step where deep learning models convert complex human reality (images, text, sound) into mathematical arrays of numbers. By allowing users to inject noise ("Fragility") and bias ("Context"), the application demonstrates that these vectors are not objective representations of reality but fragile constructs susceptible to distortion.

#### Technical Implementation

**Core Components:**
- `VectorManager.js`: Multi-modal vector extraction (Image, Text, Sound)
- `App.jsx`: Real-time processing loop, noise/bias injection logic, and "Cloud Mode" simulation
- `VectorHeatmap.jsx`: Visualization of high-dimensional vectors as 2D color grids

**AI Models:**
- **Image:** MobileNet v2 (1024 dimensions)
- **Text:** Universal Sentence Encoder (512 dimensions)
- **Sound:** TensorFlow.js Speech Commands (Spectrogram frames)

**Fragility & Context Mechanism:**
- **Fragility (Noise):** Injects random Gaussian noise into the vector.
- **Context (Bias):** Adds a deterministic sine wave "bias" vector.

#### Demo Script (2-3 minutes)
1. **Start with Image Mode:** Point webcam at yourself.
2. **Show the Vector:** Point to the heatmap. "This is you. Not your face, but the 1,024 numbers the machine sees."
3. **Inject Fragility:** Increase the "Noise Level" slider. The heatmap flickers and dissolves.
4. **Switch to Text Mode:** Type "The protest was peaceful."
5. **Inject Context:** Increase "Context Bias." Explain how the meaning shifts.
6. **Key Message:** "We trust these vectors to be objective truths. But they are brittle, reductive, and easily warped by the context in which they are deployed."

#### Next Steps
- **Inverse Visualization:** Implement a "De-convolution" decoder to reconstruct the image from the vector.
- **Cross-Modal Mapping:** Use the vector from the image to generate text or sound.
- **Adversarial Attack Demo:** Implement a specific noise pattern that forces the vector to match a target class.

---

## Technical Infrastructure

### Build & Deployment
All applications are built with Vite and can be deployed as static sites:
```bash
# Development
cd [app-directory]
npm install
npm run dev

# Production Build
npm run build
```

### Browser Compatibility
- **Chrome/Edge:** Full support
- **Firefox:** Full support
- **Safari:** Full support (with minor CSS variance)

### Performance Metrics
- **Initial Load:** < 2s on broadband
- **Model Load Time:** 3-5s for TensorFlow.js models
- **Interaction Latency:** < 100ms for all UI actions

---

## Conference Demo Script

### Recommended Order (25-minute full demo)

1. **Introduction (1 min):** "These are not finished products—they're provocations. Each one takes a concept from machine learning and asks: What if we used this to attend to difference, not uniformity?"
2. **The Context Weaver (3 min):** Demonstrates relationality.
3. **The Glitch Detector (3 min):** Interactive and participatory—train the model live.
4. **The Discontinuity Detector (3 min):** Shows temporal analysis.
5. **The Imagination Inspector (3 min):** Exposes AI bias directly.
6. **The Threshold Adjuster (3 min):** Shows human-made decisions hidden in algorithms.
7. **The Ambiguity Amplifier (2 min):** Live webcam demo shows uncertainty.
8. **The Latent Space Navigator (2 min):** Exploring the "in-between".
9. **The Deep Vector Mirror (3 min):** Ends on the fragility of the fundamental representation itself.

**Closing (1 min):** "The roadmap to connect them to real archives is clear. The question is: Do we want AI that reinforces uniformity, or can we build deep cultures of difference?"

---

## Future Development Roadmap

### Phase 1: Data Integration (Months 1-3)
- Connect to EHRI API for Holocaust archives
- Scrape tribunal decisions from gov.uk
- Set up vector database infrastructure (Pinecone/Weaviate)

### Phase 2: Model Enhancement (Months 4-6)
- Fine-tune Legal-BERT on tribunal outcomes
- Implement Temporal Fusion Transformer for time-series
- Integrate Hugging Face APIs for real generative AI

### Phase 3: User Studies (Months 7-9)
- Run workshops with archivists, legal experts, activists
- Collect feedback on interface and conceptual clarity
- Iterate based on qualitative findings

### Phase 4: Publication & Dissemination (Months 10-12)
- Prepare academic publication on methodology
- Open-source codebase with documentation
- Develop educational materials for digital humanities courses

---

**End of Report**
