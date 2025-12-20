import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

class TextModelManager {
    constructor() {
        this.model = null;
        this.classifier = null;
    }

    async loadModel() {
        if (this.model) return; // Already loaded
        this.model = await use.load();
        this.classifier = knnClassifier.create();
        console.log("USE and KNN loaded for Ambiguity Amplifier Text");
    }

    async addExample(text, label) {
        console.log('[TextModelManager] addExample called:', { text: text?.substring(0, 50), label, modelReady: !!this.model, classifierReady: !!this.classifier });
        if (!this.model || !this.classifier) {
            console.warn('[TextModelManager] Model not ready, skipping addExample');
            return;
        }
        const embeddings = await this.model.embed([text]);
        this.classifier.addExample(embeddings, label);
        console.log('[TextModelManager] Example added. Current counts:', this.classifier.getClassExampleCount());
        embeddings.dispose();
    }

    async predict(text) {
        if (!this.model || !this.classifier) return null;
        if (this.classifier.getNumClasses() === 0) return null;

        const embeddings = await this.model.embed([text]);
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

export const textModelManager = new TextModelManager();
