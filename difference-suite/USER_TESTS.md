# Difference Suite - User Test Plan

This document contains manual user acceptance tests for each tool in the Difference Suite.

---

## Prerequisites

1. Start the dev server: `cd difference-suite && npm run dev`
2. Open http://localhost:5173
3. Upload test data via Dashboard (at least 2 images and 1 text file)

---

## 1. Data Dashboard

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| D-01 | Load dashboard | Navigate to `/` | Header says "DATA DASHBOARD", Sidebar has Logo + Menu |
| D-02 | Verify Widgets | Check top stats row | 3 Widgets: Images, Documents, Other Data (0 Records) |
| D-03 | Create Collection | Sidebar → "New Collection" → Name it | New collection appears in list and becomes active |
| D-04 | Upload Folder | Click "Upload Folder" → Select folder | Folder name becomes collection, items added to grid |
| D-05 | Multi-select | Cmd/Shift+Click multiple items | Items highlighted, Context Panel shows count |
| D-06 | Send to Tool | Select item(s) → Click "Send to Glitch..." | Navigates to tool with items pre-selected |

---

## 2. Deep Vector Mirror

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| DVM-01 | Load tool | Navigate to `/deep-vector-mirror` | Tool layout with heatmap area and controls |
| DVM-02 | Process image | Select image from dataset | Vector heatmap renders after processing |
| DVM-03 | Process text | Select text from dataset | Vector heatmap renders for text embeddings |
| DVM-04 | Noise slider | Move "Noise Injection" slider | Heatmap updates showing noise effects |
| DVM-05 | Context slider | Move "Context Shift" slider | Heatmap shows context bias changes |
| DVM-06 | Empty state | Deselect all items | "Select an item" message displayed |

---

## 3. Ambiguity Amplifier

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| AA-01 | Load tool | Navigate to `/ambiguity-amplifier` | Tool loads with image preview and controls |
| AA-02 | Model loads | Wait 3-5 seconds | "ONLINE" status appears |
| AA-03 | Classify image | Select an image | Top 5 predictions displayed with percentages |
| AA-04 | Inject noise | Move noise slider to 50% | Image filter changes, confidence drops |
| AA-05 | High noise | Move noise slider to 100% | "High Ambiguity" warning appears |
| AA-06 | Wrong input | Select text item | Warning: "This tool requires an image input" |

---

## 4. Glitch Detector

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| GD-01 | Load tool | Navigate to `/glitch-detector` | Tool layout with training controls |
| GD-02 | Train model | Select image → click "Add to Model" | Example count increments |
| GD-03 | Train multiple | Add 3+ images to model | Count shows 3+ examples |
| GD-04 | Detect normal | Select trained image | High normality score (green) |
| GD-05 | Detect anomaly | Select very different image | "ANOMALY DETECTED" banner appears (red) |
| GD-06 | Reset model | Click "Reset Model" | Example count resets to 0 |
| GD-07 | Threshold | Adjust sensitivity slider | Detection threshold changes results |

---

## 5. Latent Space Navigator

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| LSN-01 | Load tool | Navigate to `/latent-space-navigator` | Two image selectors and blend canvas |
| LSN-02 | Select images | Pick Image A and Image B | Both thumbnails appear |
| LSN-03 | Blend 50% | Move slider to center | Blended image shows mix of both |
| LSN-04 | Blend 0% | Slider at left | Shows only Image A |
| LSN-05 | Blend 100% | Slider at right | Shows only Image B |
| LSN-06 | Prediction | With blended image | AI prediction displayed below canvas |

---

## 6. Context Weaver

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| CW-01 | Load tool | Navigate to `/context-weaver` | Radial viz and context list display |
| CW-02 | Analyze query | Enter text in query input → click Analyze | Radial visualization updates |
| CW-03 | Compare contexts | View comparison table | Cosine similarities shown for each context |
| CW-04 | Select context | Click row in comparison table | Vector inspector shows embedding details |
| CW-05 | Use text item | Select text from dataset | Query auto-populates with text content |

---

## 7. Networked Narratives

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| NN-01 | Load tool | Navigate to `/networked-narratives` | Graph area and text input visible |
| NN-02 | Extract network | Enter narrative text → click "Extract Network" | Force-directed graph renders |
| NN-03 | Entity types | Check graph nodes | Different colors for Person/Place/Event |
| NN-04 | Highlighted text | View annotated narrative panel | Entities highlighted with colors |
| NN-05 | Click node | Click a node in graph | Node becomes selected |
| NN-06 | Stats update | Extract new text | Entity and relation counts update |

---

## 8. Detail Extractor

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| DE-01 | Load tool | Navigate to `/detail-extractor` | Cluster viz and detail panel visible |
| DE-02 | Upload data | Have multiple images in dataset | t-SNE clustering visualization renders |
| DE-03 | Select cluster point | Click a point in cluster viz | Detail panel shows extracted detail |
| DE-04 | Zoom/pan | Scroll and drag on cluster viz | Visualization responds to interactions |

---

## 9. Discontinuity Detector

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| DD-01 | Load tool | Navigate to `/discontinuity-detector` | Timeline viz and upload zone visible |
| DD-02 | Upload CSV | Upload time-series CSV file | Timeline renders with data points |
| DD-03 | Detect anomalies | View timeline after processing | Anomaly points highlighted |
| DD-04 | Select anomaly | Click anomaly marker | Anomaly inspector panel populates |
| DD-05 | Add annotation | Type in annotation field | Text saved to anomaly |

---

## 10. Threshold Adjuster

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| TA-01 | Load tool | Navigate to `/threshold-adjuster` | Histogram, case list, and impact stats visible |
| TA-02 | Histogram renders | View main panel | Distribution histogram with draggable threshold |
| TA-03 | Drag threshold | Drag threshold line on histogram | Accepted/Rejected counts update |
| TA-04 | Case list | View cases near threshold | Table shows borderline cases |
| TA-05 | Impact stats | Check side panel | Accepted/In Doubt/Rejected categories shown |
| TA-06 | Badge colors | Check case list badges | Green for Accepted, Red for Rejected |

---

## 11. Noise Predictor

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| NP-01 | Load tool | Navigate to `/noise-predictor` | 3-panel image grid and controls |
| NP-02 | Select image | Pick image from dataset | Original image displayed |
| NP-03 | Train model | Click "Train Model" | Progress shown, epoch/loss updates |
| NP-04 | View reconstruction | After training | Reconstructed image appears |
| NP-05 | View residual | After training | Residual/noise panel shows difference |
| NP-06 | Latent slider | Adjust latent dimension | Affects model complexity |

---

## 12. Imagination Inspector

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| II-01 | Load tool | Navigate to `/imagination-inspector` | Prompt input and generation grid |
| II-02 | Enter prompt | Type text prompt → click Generate | Generation grid shows simulated results |
| II-03 | Bias report | View absence report panel | Detected biases displayed with percentages |
| II-04 | Multiple prompts | Try different prompts | Results vary based on input |

---

## Quick Smoke Test Sequence

For rapid validation, run this sequence:

1. **Dashboard** → Upload 2 images + 1 text file ✓
2. **Deep Vector Mirror** → Select image, adjust noise ✓
3. **Ambiguity Amplifier** → Classify image, add noise ✓
4. **Threshold Adjuster** → Drag threshold line ✓
5. **Networked Narratives** → Extract from default text ✓
6. **Context Weaver** → Analyze a query ✓

If all pass, the core functionality is working.
