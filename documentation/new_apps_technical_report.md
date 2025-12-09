# Deep Culture: New Applications Report

## The Noise Predictor: What the Model Refuses to See

### Background

**Epistemic Translation:** Resolution → Noise  
**Archival Site:** Historical Archives  
**Keywords:** Uncertainty, Absence, Detail

The Noise Predictor inverts the traditional signal-to-noise ratio by forcing a deep learning model through an information bottleneck, then visualizing what it *cannot* encode. When an autoencoder compresses an image through a narrow latent space and reconstructs it, the residual—the difference between input and output—reveals the "cultural excess" that the model treats as noise. This makes visible what deep learning sacrifices for efficiency: texture, nuance, the irreducible particularity of the archive. The same compression architectures used for efficiency in production systems (JPEG, video codecs) can be repurposed to critique what counts as "signal" in AI's representation of reality.

### Technical Details

**Core Components:**
- `NoiseModel.js`: TensorFlow.js Convolutional Autoencoder (Encoder-Decoder architecture)
- `ResidualCanvas.jsx`: Canvas-based tensor visualization component
- `App.jsx`: Image upload, training orchestration, and residual visualization

**AI Model:**
- **Architecture:** Convolutional Autoencoder
  - Encoder: 2 Conv2D layers (16→8 filters) + MaxPooling (256×256 → 64×64)
  - Decoder: 2 UpSampling layers + Conv2D (8→3 filters) (64×64 → 256×256)
- **Bottleneck:** 64×64×8 latent representation (1/16th spatial resolution)
- **Training:** Single-image memorization task (MSE loss, Adam optimizer)
- **Output:** Original image, Reconstructed image, Enhanced Residual (5× amplified)

**Compression Mechanism:**  
The model attempts to memorize a single photograph by encoding it through a radical spatial bottleneck. The bottleneck acts as a filter: only the "legible" patterns (edges, large shapes, dominant colors) pass through. Everything else—fine texture, subtle gradients, incidental detail—is discarded as noise.

**Residual Amplification:**  
The raw residual (absolute pixel difference) is multiplied by 5× to make the "noise" visible to the human eye:

```javascript
const enhanced = diff.mul(5).clipByValue(0, 1);
```

This transforms the usually-invisible compression artifacts into a dramatic visualization of what the model "refuses to see."

### Demo Script (2-3 minutes)

1. **Upload Image:** Choose a high-detail archival photograph (e.g., historical portrait, document with text).
2. **Start Analysis:** Click "Start Analysis" to begin training the autoencoder.
3. **Observe Training:** Watch the epoch counter and loss decrease. The reconstruction appears after ~5 epochs.
4. **Compare Views:**
   - **Left (Input Signal):** The original photograph in full fidelity.
   - **Center (Model Perception):** What the AI "sees" after compression.
   - **Right (The Noise/Residual):** What the AI discarded.
5. **Point Out Details:**
   - "Notice how text becomes illegible?"
   - "See how facial features blur but outlines remain?"
   - "The 'noise' contains all the archival specificity the model treats as irrelevant."
6. **Key Insight:** "In 50 epochs, the model learned to see this image as a simplified schema. The residual is not random noise—it's a record of what deep learning deems 'excessive' to efficient representation."

**Key Message:**  
"Deep learning optimizes for resolution—compressing reality into learnable patterns. But archives resist compression. The 'noise' we visualize is the historical particularity, the cultural detail, the irreducible difference that AI must discard to function. This tool makes that loss visible."

### Next Steps for Production Launch

**Technical:**
1. **Performance Optimization:**
   - Reduce default epochs from 50 to 25 for faster demo experience
   - Add "Quick Demo" mode with pre-trained weights for instant results
   - Implement web workers to prevent UI blocking during training

2. **Enhanced Visualization:**
   - Add side-by-side zoom view for detailed comparison
   - Implement heatmap overlay to highlight areas of maximum information loss
   - Add export functionality to save all three views as a triptych

3. **Educational Features:**
   - Add tooltips explaining MSE loss and epoch progression
   - Include example images (archival documents, portraits, maps) with analysis
   - Create guided tour mode highlighting specific artifacts

**Conceptual:**
1. **Archival Integration:**
   - Partner with EHRI to analyze compression loss in digitized Holocaust documents
   - Create case studies showing how OCR noise differs from human-illegible text
   - Document how different image types produce different "noise signatures"

2. **Comparative Studies:**
   - Allow users to compare different bottleneck sizes (aggressive vs. minimal compression)
   - Add VAE (Variational Autoencoder) mode to show probabilistic vs. deterministic noise
   - Implement "compression through time" showing JPEG vs. neural compression artifacts

---

## Networked Narratives: From Linearity to Relationality

### Background

**Epistemic Translation:** Linearity → Relationality  
**Archival Site:** Historical, Real-time, Incidental Archives  
**Keywords:** Detail, Context, Discontinuity

Networked Narratives transforms linear historical text into dynamic knowledge graphs by extracting entities (people, places, organizations) and visualizing their co-occurrence relationships. When applied to archival documents, this reveals the hidden social networks, power structures, and relational contexts that linear reading obscures. The tool demonstrates how the same NLP methods used for information extraction in surveillance and social media analysis can be repurposed to make historical archives "queryable as networks" rather than just "readable as narratives." It exposes the model's ontological categories (Person, Place, Organization) and how they impose structure on messy historical reality.

### Technical Details

**Core Components:**
- `NLPProcessor.js`: Named Entity Recognition + Co-occurrence Relation Extraction
- `GraphViz.jsx`: Interactive force-directed graph visualization (react-force-graph-2d)
- `App.jsx`: Text input, entity highlighting, and network rendering

**AI Model:**
- **Architecture:** compromise.js (rule-based NLP library)
- **Custom Lexicon:** Manual entity tagging for historical terms (e.g., "Gestapo," "French Resistance," "Normandy")
- **Entity Types:** Person (purple), Place (green), Organization (red)
- **Relation Extraction:** Sentence-level co-occurrence heuristic

**Network Construction:**
1. **Entity Extraction:** NLP identifies all entities in the text
2. **Co-occurrence Linking:** If two entities appear in the same sentence, create an edge
3. **Frequency Weighting:** Node size increases with mention count
4. **Force Layout:** Physics simulation pulls connected nodes together, pushing unconnected nodes apart

**Interactive Highlighting:**  
Extracted entities are color-coded in the input text using the same schema as the graph nodes, creating a visual bridge between linear narrative and relational structure:

```javascript
// People: Purple background
// Places: Green background  
// Organizations: Red background
```

### Demo Script (2-3 minutes)

1. **Default Text:** The app loads with a WW2 narrative about the French Resistance.
2. **Observe Highlighting:** Point out the **14 highlighted entities** in the text.
3. **Analyze Network:** Click "Analyze Network" to generate the graph.
4. **Read Stats:** "14 Entities • 3 Relations"—note how few links exist despite 14 entities. This reveals the network's sparsity.
5. **Explore Connections:**
   - Click on **Jean Moulin** to inspect
   - Show the node's **type** (Person) and **mention count**
   - Explain: "Moulin is connected to Lyon and Gestapo because they co-occur in a sentence."
6. **Contrast Views:**
   - "In the linear text, you read: 'Moulin organized the secret army in Lyon to fight the Gestapo.'"
   - "In the network, you see: Moulin is a bridge node connecting Lyon and Gestapo."
   - "The graph reveals structural roles—who connects who—that the narrative hides."
7. **Toggle Edit:** Click the highlighted text to return to edit mode and try a new document.

**Key Message:**  
"Archives are written as stories, but they encode networks. NLP allows us to reverse-engineer the social graph—who knew whom, who acted where, which organizations intersected. But this translation is lossy: the model only 'sees' the categories it was trained to recognize. What entities are missing? What relationships are too subtle for sentence-level heuristics?"

### Next Steps for Production Launch

**Technical:**
1. **Advanced NER:**
   - Integrate spaCy or Hugging Face Transformers for more robust entity recognition
   - Add support for dates, events, and custom entity types (e.g., "Resistance Cell," "Operation Name")
   - Implement coreference resolution to link pronouns to entities

2. **Relation Refinement:**
   - Move beyond co-occurrence to dependency parsing for typed relations ("led," "fought," "coordinated with")
   - Add relation labels to graph edges
   - Implement relation strength based on syntactic proximity

3. **Enhanced Visualization:**
   - Add timeline view showing entity interactions over time
   - Implement graph clustering to identify sub-networks (e.g., "London Command" vs. "Lyon Resistance")
   - Add export to GraphML/GEXF for analysis in Gephi/Cytoscape

4. **Interactive Features:**
   - Allow users to manually add/remove entities and relations
   - Implement "hide unconnected nodes" filter to focus on the main network
   - Add multi-document mode to build cumulative networks across texts

**Conceptual:**
1. **Archival Case Studies:**
   - Apply to EHRI testimony transcripts to map witness networks
   - Analyze real-time Twitter archives to show information diffusion patterns
   - Process incidental archives (emails, meeting notes) to reveal institutional networks

2. **Critical Interrogation:**
   - Create "bias audit" mode showing which entity types are over/under-represented
   - Add "missing link" visualization highlighting implicit relationships the model cannot infer
   - Implement "alternative ontology" mode allowing users to define custom entity types beyond Person/Place/Org

3. **Pedagogical Tools:**
   - Develop lesson plans for teaching network analysis in digital humanities courses
   - Create comparison tool showing how different NLP models produce different networks from the same text
   - Build "network literacy" tutorial explaining centrality, bridges, and clustering

---

## Shared Production Considerations

### Deployment Infrastructure
- **Hosting:** Vercel or Netlify for static site deployment with automatic CI/CD
- **CDN:** CloudFlare for global edge caching (especially for model assets)
- **TensorFlow.js:** Consider WASM backend for better cross-browser performance
- **Analytics:** Add privacy-respecting analytics (e.g., Plausible) to track usage patterns

### Accessibility & UX
- **ARIA Labels:** Add screen reader support for all interactive elements
- **Keyboard Navigation:** Ensure full keyboard accessibility for graph exploration
- **Mobile Optimization:** Responsive design with touch-friendly controls
- **Loading States:** Clear progress indicators for model initialization and training

### Documentation & Outreach
- **User Guide:** Step-by-step tutorials with video walkthroughs
- **Academic Paper:** Publish methodology and case studies in Digital Humanities journal
- **Workshop Materials:** Develop 90-minute workshop curriculum for DH conferences
- **Blog Post Series:** Document development process and design decisions

### Sustainability
- **Model Updates:** Plan for quarterly updates to NLP models as libraries improve
- **Community Features:** Add ability for users to submit example texts and networks
- **Archival Partnerships:** Formalize collaborations with EHRI and other digital archive projects
- **Open Source:** Release code on GitHub with clear documentation for forking and extending
