import { pipeline, env } from '@xenova/transformers';

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
    public async loadPipeline(task: string, modelName: string) {
        const key = `${task}:${modelName}`;
        if (this.pipelines.has(key)) return;
        if (this.isLoading.get(key)) {
            // Wait for existing loading process
            while (this.isLoading.get(key)) {
                await new Promise(r => setTimeout(r, 100));
            }
            return;
        }

        this.isLoading.set(key, true);
        try {
            console.log(`[TransformersManager] Loading pipeline: ${key}...`);
            const p = await pipeline(task as any, modelName);
            this.pipelines.set(key, p);
            console.log(`[TransformersManager] Pipeline loaded: ${key}`);
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
    public async getEmbeddings(text: string, modelName: string = 'Xenova/all-MiniLM-L6-v2') {
        const task = 'feature-extraction';
        const key = `${task}:${modelName}`;

        await this.loadPipeline(task, modelName);
        const p = this.pipelines.get(key);

        // Output is a Tensor, we want the raw array from the [CLS] token or pooled output
        const output = await p(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }

    /**
     * Get raw attention/tokens (placeholder for "Attention Lens")
     */
    public async analyzeText(text: string, modelName: string = 'Xenova/all-MiniLM-L6-v2') {
        // This will be expanded for the Attention Lens
        await this.loadPipeline('feature-extraction', modelName);
        const p = this.pipelines.get(`feature-extraction:${modelName}`);

        // For now, return basic info. Future update will extract actual attention weights.
        return {
            text,
            tokens: p.tokenizer.encode(text)
        };
    }
}

export const transformersManager = TransformersManager.getInstance();
