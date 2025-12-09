import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { dictionary } from '../data/dictionary';

class ModelManager {
    constructor() {
        this.model = null;
        this.dictionaryEmbeddings = null; // Tensor of shape [N, 512]
        this.dictionaryWords = dictionary;
    }

    async loadModel() {
        this.model = await use.load();
        console.log("USE loaded for Latent Space Navigator");

        // Pre-compute embeddings for dictionary
        // Batching to avoid blocking UI too much
        const batchSize = 100;
        const embeddingsList = [];

        for (let i = 0; i < this.dictionaryWords.length; i += batchSize) {
            const batch = this.dictionaryWords.slice(i, i + batchSize);
            const emb = await this.model.embed(batch);
            embeddingsList.push(emb);
            // Small delay to let UI breathe if needed, but async await helps
        }

        if (embeddingsList.length > 0) {
            this.dictionaryEmbeddings = tf.concat(embeddingsList);
            // Dispose intermediate tensors
            embeddingsList.forEach(t => t.dispose());
        }
        console.log(`Dictionary embeddings computed: ${this.dictionaryEmbeddings.shape}`);
    }

    async getNearest(vectorTensor) {
        if (!this.dictionaryEmbeddings) return null;

        return tf.tidy(() => {
            // Calculate Cosine Similarity
            // A . B / (|A| * |B|)
            // USE embeddings are already normalized? Let's assume yes or normalize.
            // Actually USE output is approx normalized, but let's be safe.

            const v = tf.div(vectorTensor, tf.norm(vectorTensor));
            const dictNorm = tf.div(this.dictionaryEmbeddings, tf.norm(this.dictionaryEmbeddings, 2, 1, true));

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

    async interpolate(textA, textB, t) {
        if (!this.model || !this.dictionaryEmbeddings) return null;

        const results = tf.tidy(() => {
            // Embed inputs
            // We need to do this inside tidy to clean up
            // But embed is async... tf.tidy doesn't support async.
            // So we have to manage memory manually for the async part.
            return null;
        });

        // Manual memory management for async parts
        const embA = await this.model.embed([textA]);
        const embB = await this.model.embed([textB]);

        const interpolated = tf.tidy(() => {
            // Linear Interpolation: A * (1-t) + B * t
            return tf.add(
                embA.mul(1 - t),
                embB.mul(t)
            );
        });

        const nearest = await this.getNearest(interpolated);

        embA.dispose();
        embB.dispose();
        interpolated.dispose();

        return nearest;
    }
}

export const modelManager = new ModelManager();
