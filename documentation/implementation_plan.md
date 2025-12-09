# Implementation Plan - Deep Culture Project

## Goal Description
Develop and demonstrate a suite of **nine** prototype applications that translate key deep learning concepts (Anomaly, Generativity, Vectorization, etc.) into humanistic values (Contingency, Creativity, Relationality, etc.). These applications serve as "epistemic translations," operationalizing critical digital humanities theory into functional software.

## User Review Required
> [!NOTE]
> **Status Update**: All 9 prototype applications have been implemented and are ready for demonstration.
> **Next Phase**: The project is moving from "Prototyping" to "Data Integration" (connecting to real archives).

## Implemented Applications

### 1. The Discontinuity Detector (`discontinuity-detector`)
- **Status**: [x] Prototype Complete
- **Core Tech**: LSTM (TensorFlow.js), Recharts
- **Key Features**:
    - [x] Time-series visualization
    - [x] Anomaly detection logic (MSE > Threshold)
    - [x] Event inspector panel

### 2. The Imagination Inspector (`imagination-inspector`)
- **Status**: [x] Prototype Complete
- **Core Tech**: React, Custom Simulation Logic
- **Key Features**:
    - [x] Mock generative engine (Bias Simulator)
    - [x] Absence Report visualization
    - [x] "Dreaming" animation state

### 3. The Detail Extractor (`detail-extractor`)
- **Status**: [x] Prototype Complete
- **Core Tech**: Universal Sentence Encoder, PCA (Custom)
- **Key Features**:
    - [x] Semantic embedding of text
    - [x] 2D Scatter plot visualization
    - [x] Detail view for individual narratives

### 4. The Threshold Adjuster (`threshold-adjuster`)
- **Status**: [x] Prototype Complete
- **Core Tech**: Recharts, Custom Logic
- **Key Features**:
    - [x] Risk score histogram
    - [x] Interactive threshold slider
    - [x] "Zone of Doubt" visualization

### 5. The Context Weaver (`context-weaver`)
- **Status**: [x] Prototype Complete
- **Core Tech**: Universal Sentence Encoder
- **Key Features**:
    - [x] Multi-context embedding comparison
    - [x] Radial visualization
    - [x] Vector inspector

### 6. The Ambiguity Amplifier (`ambiguity-amplifier`)
- **Status**: [x] Prototype Complete
- **Core Tech**: MobileNet, Webcam Integration
- **Key Features**:
    - [x] Real-time image classification
    - [x] Noise injection slider
    - [x] Confidence distribution display

### 7. The Glitch Detector (`glitch-detector`)
- **Status**: [x] Prototype Complete
- **Core Tech**: MobileNet + KNN Classifier
- **Key Features**:
    - [x] One-class training UI
    - [x] Real-time anomaly detection
    - [x] Visual glitch overlay effect

### 8. The Latent Space Navigator (`latent-space-navigator`)
- **Status**: [x] Prototype Complete
- **Core Tech**: MobileNet, Tensor Interpolation
- **Key Features**:
    - [x] Dual-image capture
    - [x] Linear interpolation slider
    - [x] "Hidden Concept" detection logic
---

## Phase 2: New Experimental Apps

### 10. The Noise Predictor (`noise-predictor`)

**Goal:** Invert the typical deep learning objective of "signal-to-noise" ratio. Instead of cleaning data to find the signal, this app predicts and visualizes the "noise"—the data that the model discards, ignores, or treats as irrelevant error. It asks: *What does the model refuse to see?*

**Epistemic Translation:** Resolution → Noise

**Technical Approach:**
*   **Core Logic:** Use a **Convolutional Autoencoder** (TensorFlow.js).
    *   The model tries to "reconstruct" the input image through a bottleneck (simulating the model's limited "understanding").
    *   **The Twist:** We do not show the reconstruction. We show the **Residual** (Original Image - Reconstructed Image). This residual is the "noise" or "detail" the model failed to capture.
*   **Visualization:**
    *   Display the "Noise Map" (Residuals) in high contrast.
    *   Allow users to adjust the "Bottleneck Size" (Latent Dim)—as the model gets "smarter" (larger bottleneck), the noise changes.
    *   "Noise Prediction": A secondary model that tries to *generate* this noise pattern, treating the discarded data as the primary subject.

**Components:**
*   `NoiseVisualizer`: Canvas rendering the pixel-wise difference.
*   `BottleneckSlider`: Controls the autoencoder's compression level.
*   `NoiseStats`: Metrics on how much "culture" is being lost (MSE, structural similarity).

**File Structure:**
*   `src/components/NoiseModel.js`: TF.js autoencoder management.
*   `src/components/ResidualCanvas.jsx`: Visualizes the difference.

---

### 11. Networked Narratives (`networked-narratives`)

**Goal:** Simulate the "relationality" of deep learning by extracting entities and relationships from linear text and reassembling them into a dynamic network graph. It challenges the linearity of traditional narrative by exposing the latent network structure.

**Epistemic Translation:** Linearity → Relationality

**Technical Approach:**
*   **Core Logic:** **Relation Extraction** simulation.
    *   Use `compromise` (lightweight NLP) for Named Entity Recognition (NER) to find People, Places, Organizations.
    *   **Heuristic Relation Extraction:** Identify Subject-Verb-Object (SVO) triplets or co-occurrences within sentence windows to define "links".
*   **Visualization:**
    *   **Force-Directed Graph:** Use `react-force-graph-2d` to visualize entities as nodes and relations as edges.
    *   **Dynamic Physics:** Nodes pull together based on narrative proximity.
    *   **"Narrative Path"**: Highlight the path of specific entities through the network over time (text progression).

**Components:**
*   `TextInput`: Large text area for pasting narratives.
*   `NetworkGraph`: Interactive force-directed graph.
*   `EntityInspector`: Sidebar showing details of selected nodes and their connections.
*   `RelationFilter`: Controls to filter weak vs. strong connections.

**File Structure:**
*   `src/components/NLPProcessor.js`: Handles NER and relation extraction logic.
*   `src/components/GraphViz.jsx`: Wrapper for `react-force-graph-2d`.

---

## Verification Plan (Phase 2)

### Automated Tests
*   **Noise Predictor:**
    *   Verify autoencoder trains and produces valid output tensors.
    *   Verify residual calculation (Original - Output) is non-zero for complex images.
*   **Networked Narratives:**
    *   Verify NLP processor extracts entities from sample text.
    *   Verify graph data structure (nodes/links) is correctly formed.

### Manual Verification
*   **Noise Predictor:**
    *   Upload an image and verify the "Noise Map" reveals details lost by the compression (e.g., texture, fine lines).
    *   Adjust bottleneck slider and observe noise patterns changing.
*   **Networked Narratives:**
    *   Paste a sample text (e.g., a short story or news article).
    *   Verify the graph generates with correct entities.
    *   Test interactivity (dragging nodes, clicking for details).

### 9. The Deep Vector Mirror (`deep-vector-mirror`)
- **Status**: [x] Prototype Complete
- **Core Tech**: MobileNet, USE, Speech Commands
- **Key Features**:
    - [x] Multi-modal input (Image, Text, Sound)
    - [x] Vector heatmap visualization
    - [x] Fragility (Noise) and Context (Bias) injection

## Verification Plan

### Automated Tests
- [x] Build verification for all apps (`npm run build`)
- [x] Component rendering tests

### Manual Verification
- [x] **Discontinuity**: Verify anomalies appear at Day 30, 65, 85.
- [x] **Imagination**: Verify "CEO" prompt shows bias.
- [x] **Detail**: Verify clustering of resistance narratives.
- [x] **Threshold**: Verify slider updates acceptance counts.
- [x] **Context**: Verify "insect" query changes neighbors across contexts.
- [x] **Ambiguity**: Verify noise reduces confidence.
- [x] **Glitch**: Verify "normal" training and anomaly triggering.
- [x] **Latent**: Verify interpolation between two images.
- [x] **Vector Mirror**: Verify heatmap reacts to noise/bias sliders.
