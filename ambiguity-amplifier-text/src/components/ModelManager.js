import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

class ModelManager {
    constructor() {
        this.model = null;
        this.classifier = null;
    }

    async loadModel() {
        // Load Universal Sentence Encoder
        this.model = await use.load();
        // Create KNN Classifier
        this.classifier = knnClassifier.create();
        console.log("USE and KNN loaded");
    }

    async addExample(text, label) {
        if (!this.model || !this.classifier) return;

        // Encode text to get embedding
        const embeddings = await this.model.embed([text]);

        // Add to classifier
        this.classifier.addExample(embeddings, label);

        embeddings.dispose();
    }

    async predict(text) {
        if (!this.model || !this.classifier) return null;
        if (this.classifier.getNumClasses() === 0) return null;

        const embeddings = await this.model.embed([text]);

        // Predict class
        const result = await this.classifier.predictClass(embeddings);

        embeddings.dispose();
        return result;
    }

    clear() {
        if (this.classifier) {
            this.classifier.clearAllClasses();
        }
    }

    getExampleCount() {
        if (!this.classifier) return {};
        return this.classifier.getClassExampleCount();
    }
}

export const modelManager = new ModelManager();
