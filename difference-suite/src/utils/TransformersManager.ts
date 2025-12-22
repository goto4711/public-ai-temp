import { pipeline, env, RawImage } from '@xenova/transformers';

// Configuration for Transformers.js
// We use the default Hugging Face hub for model fetching
env.allowLocalModels = false;

class TransformersManager {
    private static instance: TransformersManager;
    private pipelines: Map<string, any> = new Map();
    private isLoading: Map<string, boolean> = new Map();

    private constructor() { }

    public static getInstance(): TransformersManager {
        if (!TransformersManager.instance) {
            TransformersManager.instance = new TransformersManager();
        }
        return TransformersManager.instance;
    }

    /**
     * Load a model pipeline if not already loaded
     * @param task The task type (e.g., 'feature-extraction')
     * @param modelName The Hugging Face model ID
     */
    public async loadPipeline(task: string, modelName: string, onProgress?: (progress: number) => void) {
        const key = `${task}:${modelName}`;
        if (this.pipelines.has(key)) {
            if (onProgress) onProgress(1.0);
            return;
        }

        if (this.isLoading.get(key)) {
            // Wait for existing loading process
            while (this.isLoading.get(key)) {
                await new Promise(r => setTimeout(r, 100));
            }
            if (onProgress) onProgress(1.0);
            return;
        }

        this.isLoading.set(key, true);
        try {
            console.log(`[TransformersManager] Loading pipeline: ${key}...`);
            const p = await pipeline(task as any, modelName, {
                progress_callback: (info: any) => {
                    if (info.status === 'progress' && onProgress) {
                        onProgress(info.progress / 100);
                    }
                }
            });
            this.pipelines.set(key, p);
            console.log(`[TransformersManager] Pipeline loaded: ${key}`);
            if (onProgress) onProgress(1.0);
        } catch (error) {
            console.error(`[TransformersManager] Failed to load pipeline ${key}:`, error);
            throw error;
        } finally {
            this.isLoading.set(key, false);
        }
    }

    /**
     * Get embeddings for a text input
     * @param text The input string
     * @param modelName The model to use (default: all-MiniLM-L6-v2)
     */
    public async getEmbeddings(text: string, modelName: string = 'Xenova/all-MiniLM-L6-v2'): Promise<number[]> {
        const task = 'feature-extraction';
        const key = `${task}:${modelName}`;

        await this.loadPipeline(task, modelName);
        const p = this.pipelines.get(key);

        // Output is a Tensor, we want the raw array from the [CLS] token or pooled output
        const output = await p(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data) as number[];
    }

    /**
     * Get embeddings for multiple text inputs in a batch
     * @param texts Array of input strings
     * @param batchSize Number of items to process at once
     * @param modelName The model ID
     */
    public async getEmbeddingsBatch(
        texts: string[],
        batchSize: number = 32,
        modelName: string = 'Xenova/all-MiniLM-L6-v2',
        onProgress?: (progress: number) => void
    ): Promise<number[][]> {
        const results: number[][] = [];
        const task = 'feature-extraction';

        await this.loadPipeline(task, modelName, (p) => {
            if (onProgress) onProgress(p * 0.5);
        });

        const key = `${task}:${modelName}`;
        const p = this.pipelines.get(key);

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);

            const output = await p(batch, { pooling: 'mean', normalize: true });

            // Extract each embedding from the flattened data
            const dims = output.dims; // [batchSize, 384]
            const data = output.data;
            const vectorSize = dims[1];

            for (let j = 0; j < batch.length; j++) {
                results.push(Array.from(data.slice(j * vectorSize, (j + 1) * vectorSize)) as number[]);
            }

            if (onProgress) {
                // Report progress of batch processing (0.5 to 1.0 range after loading)
                const currentBatchEnd = Math.min(i + batch.length, texts.length);
                onProgress(0.5 + (currentBatchEnd / texts.length) * 0.5);
            }
        }
        return results;
    }

    /**
     * Get embeddings for an image
     * @param imageSource URL or data URL of the image
     * @param modelName The model to use (default: CLIP base)
     */
    public async getImageEmbeddings(imageSource: string, modelName: string = 'Xenova/clip-vit-base-patch32'): Promise<number[]> {
        const task = 'feature-extraction';
        const key = `${task}:${modelName}`;

        await this.loadPipeline(task, modelName);
        const p = this.pipelines.get(key);

        const image = await RawImage.fromURL(imageSource);
        const output = await p(image);

        return Array.from(output.data) as number[];
    }

    /**
     * Batch align a text prompt against multiple images
     */
    public async getMultimodalAlignmentBatch(text: string, imageUrls: string[], modelName: string = 'Xenova/clip-vit-base-patch32'): Promise<{ url: string, score: number }[]> {
        const task = 'feature-extraction';
        const key = `${task}:${modelName}`;

        await this.loadPipeline(task, modelName);
        const p = this.pipelines.get(key);

        // 1. Get text embedding once
        const textOutput = await p(text);
        const textEmb = textOutput.data;

        const results: { url: string, score: number }[] = [];

        // 2. Process images (in chunks of 4 to avoid memory pressure)
        const chunkSize = 4;
        for (let i = 0; i < imageUrls.length; i += chunkSize) {
            const chunk = imageUrls.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (url) => {
                try {
                    const image = await RawImage.fromURL(url);
                    const imageOutput = await p(image);
                    const imageEmb = imageOutput.data;

                    // Cosine similarity
                    let dotProduct = 0;
                    let normImage = 0;
                    let normText = 0;
                    for (let n = 0; n < imageEmb.length; n++) {
                        dotProduct += imageEmb[n] * textEmb[n];
                        normImage += imageEmb[n] * imageEmb[n];
                        normText += textEmb[n] * textEmb[n];
                    }
                    const score = dotProduct / (Math.sqrt(normImage) * Math.sqrt(normText));
                    results.push({ url, score });
                } catch (e) {
                    console.warn(`CLIP: Failed to align image ${url}`, e);
                }
            }));

            // Yield to main thread
            await new Promise(r => setTimeout(r, 10));
        }

        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * Get raw attention/tokens (Attention Lens)
     */
    public async analyzeText(text: string, modelName: string = 'Xenova/all-MiniLM-L6-v2') {
        const task = 'feature-extraction';
        const key = `${task}:${modelName}`;

        await this.loadPipeline(task, modelName);
        const p = this.pipelines.get(key);

        // We need attention weights, which are not returned by default in the pipeline
        // We call the model directly with specific options
        const result = await p(text, {
            pooling: 'mean',
            normalize: true,
            output_attentions: true
        });

        const tokens = p.tokenizer.encode(text);
        const decodedTokens = tokens.map((t: number) => p.tokenizer.decode([t]));

        // Extract attention from the result if available 
        // Note: Transformers.js attention heads are [layers, batch, heads, seq, seq]
        const attention = result.attentions as any[];
        let averagedAttention: number[] | null = null;

        if (attention) {
            const lastLayer = attention[attention.length - 1];
            const data = lastLayer.data as Float32Array;
            const dims = lastLayer.dims; // [batch, heads, seq, seq]
            const heads = dims[1];
            const seqLen = dims[2];
            const matrixSize = seqLen * seqLen;

            averagedAttention = new Array(matrixSize).fill(0);

            // Sum across all heads
            for (let h = 0; h < heads; h++) {
                const headOffset = h * matrixSize;
                for (let i = 0; i < matrixSize; i++) {
                    averagedAttention[i] += data[headOffset + i];
                }
            }

            // Divide by number of heads
            for (let i = 0; i < matrixSize; i++) {
                averagedAttention[i] /= heads;
            }
        }

        return {
            text,
            tokens: decodedTokens as string[],
            attention: averagedAttention,
            dimensions: {
                layers: attention?.length || 0,
                heads: attention?.[0]?.dims?.[1] || 0,
                seqLength: tokens.length
            }
        };
    }
}

export const transformersManager = TransformersManager.getInstance();
