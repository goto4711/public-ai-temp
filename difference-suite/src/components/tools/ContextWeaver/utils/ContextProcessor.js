import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

let model = null;

export const loadModel = async () => {
    if (!model) {
        model = await use.load();
    }
    return model;
};

// Compute cosine similarity between two vectors
const cosineSimilarity = (a, b) => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
};

export const processContexts = async (queryText, contexts) => {
    if (!model) await loadModel();

    // Embed the query
    const queryEmbeddingTensor = await model.embed([queryText]);
    const queryEmbedding = (await queryEmbeddingTensor.array())[0];
    queryEmbeddingTensor.dispose();

    // Process each context
    const results = [];

    for (const context of contexts) {
        // Embed all items in this context
        const contextEmbeddingsTensor = await model.embed(context.items);
        const contextEmbeddings = await contextEmbeddingsTensor.array();
        contextEmbeddingsTensor.dispose();

        // Compute similarities
        const similarities = contextEmbeddings.map((embedding, i) => ({
            text: context.items[i],
            similarity: cosineSimilarity(queryEmbedding, embedding),
            vector: embedding // Store raw vector
        }));

        // Sort by similarity (descending) and take top 5
        similarities.sort((a, b) => b.similarity - a.similarity);
        const topMatches = similarities.slice(0, 5);

        results.push({
            contextName: context.name,
            color: context.color,
            matches: topMatches,
            queryVector: queryEmbedding // Store query vector for comparison
        });
    }

    return results;
};
