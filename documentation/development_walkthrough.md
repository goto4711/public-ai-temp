# Walkthrough - The Imagination Inspector

## Overview
"The Imagination Inspector" is a web application that probes the boundaries of generative AI to reveal what it **cannot** imagine. It translates the epistemic virtue of "Generativity" into "Creativity" by highlighting the constraints, biases, and absences in the latent space.

## Features Implemented
1.  **Latent Space Probing**: A "Generator Simulator" that mimics the output of a biased generative model for specific concepts (e.g., "CEO", "Nurse", "Terrorist").
2.  **Absence Detection**: Automatically analyzes the "generated" results to identify what is **missing** (e.g., 0% women in "CEO" results).
3.  **Visualization**:
    - **Generation Grid**: Displays the "generated" samples with their metadata tags.
    - **Absence Report**: A detailed breakdown of "Always Present" vs. "Never Present" attributes.
4.  **Deep Culture Aesthetic**: Custom UI using the project's signature purple/green color palette and glitch effects.

## Verification Results

### Build Verification
- [x] `npm run build` completed successfully.
- [x] All dependencies (`recharts`, `lucide-react`, `framer-motion`, `tailwindcss`) are correctly installed and configured.

### Manual Verification Steps
To verify the app locally:
1.  Run `npm run dev` in the `imagination-inspector` directory.
2.  **Probe**: Enter a concept like **"CEO"** in the input field and press Enter.
3.  **Observe**:
    - Watch the "Dreaming..." animation.
    - See the grid of 10 "generated" profiles appear.
4.  **Inspect**:
    - Look at the **Absence Report** below.
    - Confirm that it flags "Female" as **Absent (0%)** and "Suit" as **Always Present**.
5.  **Compare**: Try entering **"Nurse"** and see how the biases flip (mostly Female, Scrubs).

5.  **Compare**: Try entering **"Nurse"** and see how the biases flip (mostly Female, Scrubs).

## Future Integration: Real Generative AI

To replace the "Simulator" with real-time image generation, you can integrate an external API like the **Hugging Face Inference API**.

### 1. Get an API Key
- Sign up at [Hugging Face](https://huggingface.co/).
- Go to Settings > Access Tokens and create a new token (Read access).

**About Hugging Face Inference API:**
The [Inference API](https://huggingface.co/docs/api-inference/index) allows you to run thousands of open-source models directly from your browser without setting up your own servers.
- **Free Tier**: Good for prototyping and low-volume testing. Rate limits apply.
- **Models**: Access to Stable Diffusion (Image Gen), ViLT (VQA), BERT (Text), and more.
- **Latency**: Variable. Cold starts (loading a model) can take a few seconds.
- **Privacy**: Data is processed on HF servers but not stored for training by default (check specific model licenses).

### 2. Update `GeneratorEngine.js`
Replace the mock logic with a fetch call to a Stable Diffusion model.

```javascript
const HF_API_KEY = "your_hf_token_here";
const MODEL_ID = "stabilityai/stable-diffusion-2-1";

export const generateImages = async (prompt, count = 4) => {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    // Add random seed to get different images for same prompt
    const seed = Math.floor(Math.random() * 1000000);
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      {
        headers: { Authorization: `Bearer ${HF_API_KEY}` },
        method: "POST",
        body: JSON.stringify({ inputs: prompt, parameters: { seed } }),
      }
    );
    
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    // Note: Real API won't return metadata tags automatically.
    // You would need a separate "Image-to-Text" model (like CLIP or BLIP)
    // to analyze the generated image and extract tags for the BiasAnalyzer.
    
    results.push({
      id: i,
      prompt,
      image: imageUrl,
      tags: {} // Placeholder until analysis step is added
    });
  }
  
  return results;
};
```

### 3. Add Image Analysis (Crucial Step)
Since real generation doesn't come with "metadata" (like "gender: male"), you must **probe the output** to detect bias.

**Recommended VQA Model:**
- **Model**: `dandelin/vilt-b32-finetuned-vqa` (ViLT - Vision-and-Language Transformer)
- **Why**: It is lightweight, fast, and specifically fine-tuned for answering natural language questions about images.
- **Alternative**: `Salesforce/blip-vqa-base` (BLIP).

**Integration Code:**

```javascript
const VQA_MODEL = "dandelin/vilt-b32-finetuned-vqa";

async function analyzeImage(imageUrl) {
  const questions = [
    { category: 'gender', q: "Is the person male or female?" },
    { category: 'race', q: "What is the race of the person?" },
    { category: 'style', q: "Is the person wearing a suit or casual clothes?" }
  ];

  const tags = {};

  for (const item of questions) {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${VQA_MODEL}`,
      {
        headers: { Authorization: `Bearer ${HF_API_KEY}` },
        method: "POST",
        body: JSON.stringify({
          inputs: {
            image: imageUrl, // Pass the image URL or base64
            question: item.q
          }
        }),
      }
    );
    
    const answer = await response.json();
    // API returns array of answers with scores, e.g., [{ answer: "male", score: 0.9 }]
    if (answer && answer.length > 0) {
      tags[item.category] = answer[0].answer;
    }
  }
  
  return tags;
}
```

**Full Workflow:**
1.  **Generate**: Call `generateImages` to get an image URL.
2.  **Analyze**: Call `analyzeImage(url)` to get the tags.
3.  **Report**: Pass the tags to `BiasAnalyzer` to visualize the absences.

## Future Integration Plans for Other Apps

Just as with the *Imagination Inspector*, the other Deep Culture applications are currently running on "Demo Data" to illustrate the concepts. Below is the roadmap for connecting them to real-world data and AI models.

### 1. The Detail Extractor
**Goal:** Replace static narratives with dynamic analysis of large-scale archives (e.g., Holocaust testimonies).
*   **Real Data Source:** Connect to a Vector Database (e.g., **Pinecone**, **Weaviate**) hosting digitized archives (e.g., from the [European Holocaust Research Infrastructure](https://www.ehri-project.eu/)).
*   **AI Model:** Use a high-performance embedding model like `sentence-transformers/all-MiniLM-L6-v2` (via Hugging Face API) or OpenAI's `text-embedding-3-small`.
*   **Implementation:**
    1.  **Ingest**: Pre-calculate embeddings for the full archive.
    2.  **Query**: When a user uploads a new text, generate its embedding on the fly.
    3.  **Visualize**: Use a library like `umap-js` to perform real-time dimensionality reduction, placing the new text within the "universe" of the archive to reveal its semantic distance.

### 2. The Threshold Adjuster
**Goal:** Replace mock risk scores with real uncertainty quantification in legal decision-making.
*   **Real Data Source:** Scrape anonymized tribunal decisions (e.g., from government repositories like `gov.uk` or `HUDOC`).
*   **AI Model:** Fine-tune a **Legal-BERT** model on "Accepted" vs. "Rejected" asylum cases.
*   **Uncertainty Quantification:**
    *   Instead of a simple probability output, implement **Monte Carlo Dropout** (running the model multiple times with dropout enabled) to measure the *variance* of the prediction.
    *   High variance = High Epistemic Uncertainty (The model "doubts" itself).
    *   This real "Uncertainty Score" would replace the mock "Risk Score" in the UI.

### 3. The Context Weaver
**Goal:** Replace static word lists with dynamic semantic search across distinct cultural corpora.
*   **Real Data Source:** Create three distinct indices in a Vector Database:
    1.  **Historical Index**: Ingested Holocaust archives.
    2.  **Social Media Index**: Ingested Twitter/Reddit streams (filtered for hate speech keywords).
    3.  **Legal Index**: Ingested legal frameworks and tribunal judgments.
*   **AI Model:** Use a **multilingual embedding model** (like `LaBSE`) to ensure concepts map correctly across languages and registers.
*   **Implementation:**
    *   When the user enters a query (e.g., "vermin"), the app sends the vector to *all three* indices.
    *   It retrieves the "Nearest Neighbors" from each index independently.
    *   The **Radial Viz** then plots these neighbors to show how the *same* word has radically different semantic associations in each context.

## Phase 2: New Experimental Apps

We have successfully implemented two new applications that further explore the "Deep Culture" concepts of **Noise** and **Relationality**.

### 10. The Noise Predictor (`noise-predictor`)
**Concept:** Inverts the signal-to-noise ratio to visualize what the model discards.
**Implementation:**
-   **Tech:** TensorFlow.js Convolutional Autoencoder.
-   **Visuals:** Updated to the **Deep Culture Brutalist Aesthetic** (Light theme, Lexend font, hard shadows) to match the project standard.
-   **Fix Applied:** Added `yieldEvery: 'epoch'` to training loop to allow UI updates during training (epoch counter, loss display).
-   **Status:** Fully functional and verified.

### 11. Networked Narratives (`networked-narratives`)
**Concept:** Simulates relationality by extracting entities and relationships from linear text.
**Implementation:**
-   **Tech:** `compromise` (NLP) + `react-force-graph-2d` with custom entity lexicon.
-   **Visuals:** Deep Culture Brutalist Aesthetic (Light theme, Lexend font, Violet/Green/Blue palette).
-   **Data:** Simulated historical document from WW2 (French Resistance) with 14 entities highlighted in the text.
-   **Features:** Entity highlighting in text, "Entities • Relations" label, interactive graph.
-   **Status:** Fully functional and verified.

![Networked Narratives Interface (All Entities Highlighted)](/Users/tblanke/.gemini/antigravity/brain/aa3b8088-ca70-468a-8b5f-3e34326a7a3c/screenshot_networked_narratives_all_entities_1764770090342.png)

### 4. The Discontinuity Detector
**Goal:** Replace mock time-series with live social signal monitoring to detect historical ruptures.
*   **Real Data Source:** Connect to live APIs such as:
    *   **GDELT Project** (Global Database of Events, Language, and Tone).
    *   **Twitter/X API** (Volume/Sentiment streams).
    *   **Web Archives**: Use the [Internet Archive CDX API](https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server) to fetch snapshot density over time.
*   **AI Model:** Deploy a **Temporal Fusion Transformer** or **LSTM Autoencoder** (via TensorFlow.js or ONNX).
*   **Implementation:**
    *   Feed live data points into the model window.
    *   Calculate the **Reconstruction Error** (MSE) between the predicted next value and the actual value.
### 5. The Glitch Detector
**Goal:** Move from webcam play to critical surveillance analysis.
*   **Real Data Source:** Connect to **RTSP streams** (Real-Time Streaming Protocol) from public CCTV cameras or uploaded video files.
*   **AI Model:** Use a **Video Vision Transformer (ViViT)** or **SlowFast** network for action recognition and anomaly detection.
*   **Implementation:**
    *   The app ingests a continuous video feed.
    *   The model predicts the next frame or classifies the current action.
    *   "Glitches" (high prediction error) are highlighted not just as visual artifacts but as **"Breaks in the Pattern"** of everyday life.

### 6. The Ambiguity Amplifier
**Goal:** Replace lightweight client-side detection with high-fidelity ambiguity scoring.
*   **Real Data Source:** High-resolution images from social media datasets (e.g., Flickr, Instagram).
*   **AI Model:** Use a **Vision Transformer (ViT)** or **DETR** (Detection Transformer) with access to the **Softmax Probabilities**.
*   **Implementation:**
    *   Instead of just showing the top label ("Cup: 90%"), the app retrieves the *entire* probability distribution.
    *   It calculates the **Entropy** of the distribution. High entropy = High Ambiguity.
    *   The UI amplifies this by blurring or pixelating regions where the model is "confused" between multiple categories (e.g., is it a "gun" or a "hairdryer"?).

### 7. The Latent Space Navigator
**Goal:** Replace pre-computed paths with real-time exploration of the generative latent space.
*   **Real Data Source:** **Stable Diffusion** (via Hugging Face API or local GPU).
*   **Implementation:**
    *   **Latent Walk**: When the user moves the joystick/cursor, the app calculates a vector interpolation (SLERP) between two random seeds in the model's latent space.
    *   **Decode**: It sends this interpolated vector to the VAE decoder to generate the image in real-time.
    *   **Result**: A smooth, infinite journey through the "dream" of the machine, rather than a fixed set of images.
