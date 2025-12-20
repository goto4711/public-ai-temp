import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

class GlitchTextModelManager {
    constructor() {
        this.model = null;
        this.classifier = null;
    }

    async loadModel() {
        if (this.model) return; // Already loaded
        this.model = await use.load();
        this.classifier = knnClassifier.create();
        console.log("USE and KNN loaded for Glitch Detector Text");

        // Seed with anomaly examples (gibberish) so KNN has 2 classes
        await this.classifier.addExample(await this.model.embed(['sdfsdf sdfsdf sdfsdf']), 'anomaly');
        await this.classifier.addExample(await this.model.embed(['1234 5678 9012']), 'anomaly');
        await this.classifier.addExample(await this.model.embed(['!@#$% ^&*()']), 'anomaly');
    }

    async addExample(text) {
        console.log('[GlitchTextModelManager] addExample called:', { text: text?.substring(0, 50), modelReady: !!this.model, classifierReady: !!this.classifier });
        if (!this.model || !this.classifier) {
            console.warn('[GlitchTextModelManager] Model not ready, skipping addExample');
            return;
        }
        const embeddings = await this.model.embed([text]);
        this.classifier.addExample(embeddings, 'normal');
        console.log('[GlitchTextModelManager] Example added. Current count:', this.getExampleCount());
        embeddings.dispose();
    }

    async predict(text) {
        if (!this.model || !this.classifier) return 0;
        if (this.classifier.getNumClasses() === 0) return 0;

        const embeddings = await this.model.embed([text]);
        const result = await this.classifier.predictClass(embeddings);
        embeddings.dispose();
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

export const glitchTextModelManager = new GlitchTextModelManager();
