import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

class ModelManager {
    constructor() {
        this.model = null;
        this.classifier = null;
    }

    async loadModel() {
        this.model = await use.load();
        this.classifier = knnClassifier.create();
        console.log("USE and KNN loaded for Glitch Detector");
    }

    async addExample(text) {
        if (!this.model || !this.classifier) return;
        const embeddings = await this.model.embed([text]);
        this.classifier.addExample(embeddings, 'normal');
        embeddings.dispose();
    }

    async predict(text) {
        if (!this.model || !this.classifier) return null;
        if (this.classifier.getNumClasses() === 0) return null;

        const embeddings = await this.model.embed([text]);
        const result = await this.classifier.predictClass(embeddings);
        embeddings.dispose();

        // Return confidence for 'normal'
        return result.confidences['normal'] || 0;
    }

    clear() {
        if (this.classifier) {
            this.classifier.clearAllClasses();
        }
    }

    getExampleCount() {
        if (!this.classifier) return 0;
        const counts = this.classifier.getClassExampleCount();
        return counts['normal'] || 0;
    }
}

export const modelManager = new ModelManager();
