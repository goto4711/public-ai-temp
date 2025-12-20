import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { dictionary } from '../data/dictionary';

class LatentTextModelManager {
    private model: use.UniversalSentenceEncoder | null = null;
    private dictionaryEmbeddings: tf.Tensor2D | null = null;
    private dictionaryWords: string[] = dictionary;

    async loadModel() {
        if (this.model) return;
        this.model = await use.load();
        console.log("USE loaded for Latent Space Navigator");

        // Pre-compute embeddings for dictionary
        const batchSize = 100;
        const embeddingsList: tf.Tensor2D[] = [];

        for (let i = 0; i < this.dictionaryWords.length; i += batchSize) {
            const batch = this.dictionaryWords.slice(i, i + batchSize);
            const emb = await this.model.embed(batch) as tf.Tensor2D;
            embeddingsList.push(emb);
        }

        if (embeddingsList.length > 0) {
            this.dictionaryEmbeddings = tf.concat(embeddingsList) as tf.Tensor2D;
            // Dispose intermediate tensors
            embeddingsList.forEach(t => t.dispose());
        }
        console.log(`Latent Navigator: Dictionary embeddings computed (${this.dictionaryEmbeddings?.shape})`);
    }

    async getNearest(vectorTensor: tf.Tensor2D) {
        if (!this.dictionaryEmbeddings) return null;

        return tf.tidy(() => {
            // Calculate Cosine Similarity
            // Normalize inputs to be safe
            const v = tf.div(vectorTensor, tf.norm(vectorTensor, 2, 1, true));
            const dict = this.dictionaryEmbeddings!;
            const dictNorm = tf.div(dict, tf.norm(dict, 2, 1, true));

            // Dot product: [1, 512] * [N, 512]^T = [1, N]
            const similarities = tf.matMul(v, dictNorm, false, true);

            // Get top k
            const { values, indices } = tf.topk(similarities, 5);
            const topIndices = indices.dataSync();
            const topScores = values.dataSync();

            const results = [];
            for (let i = 0; i < topIndices.length; i++) {
                results.push({
                    word: this.dictionaryWords[topIndices[i]],
                    score: topScores[i]
                });
            }
            return results;
        });
    }

    async interpolate(textA: string, textB: string, t: number) {
        if (!this.model || !this.dictionaryEmbeddings) return null;

        // Manual memory management for async parts
        const embA = await this.model.embed([textA]) as tf.Tensor2D;
        const embB = await this.model.embed([textB]) as tf.Tensor2D;

        const interpolated = tf.tidy(() => {
            // Linear Interpolation: A * (1-t) + B * t
            return tf.add(
                embA.mul(1 - t),
                embB.mul(t)
            ) as tf.Tensor2D;
        });

        const nearest = await this.getNearest(interpolated);

        embA.dispose();
        embB.dispose();
        interpolated.dispose();
        return nearest;
    }

    async extendDictionary(words: string[]) {
        if (!this.model) return;

        // Filter out existing words and normalize
        const newWords = words
            .map(w => w.toLowerCase().trim())
            .filter(w => w.length > 2)
            .filter(w => !this.dictionaryWords.includes(w));

        if (newWords.length === 0) return;

        console.log(`Latent Navigator: Extending dictionary with ${newWords.length} words...`);

        const newEmbeddings = await this.model.embed(newWords) as tf.Tensor2D;

        if (this.dictionaryEmbeddings) {
            const oldEmbeddings = this.dictionaryEmbeddings;
            this.dictionaryEmbeddings = tf.concat([oldEmbeddings, newEmbeddings]) as tf.Tensor2D;
            oldEmbeddings.dispose();
            newEmbeddings.dispose();
        } else {
            this.dictionaryEmbeddings = newEmbeddings;
        }

        this.dictionaryWords = [...this.dictionaryWords, ...newWords];
        console.log(`Latent Navigator: Dictionary size is now ${this.dictionaryWords.length}`);
    }
    async getEmbedding(text: string) {
        if (!this.model) await this.loadModel();
        return await this.model!.embed([text]) as tf.Tensor2D;
    }
}

export const latentTextManager = new LatentTextModelManager();
