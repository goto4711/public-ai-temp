import { transformersManager } from '../../../../utils/TransformersManager';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

class GlitchTextModelManager {
    constructor() {
        this.classifier = null;
        this.isReady = false;
    }

    async loadModel() {
        if (this.isReady) return;
        this.classifier = knnClassifier.create();

        // Seed with anomaly examples (gibberish)
        const anomalies = [
            'sdfsdf sdfsdf sdfsdf',
            '1234 5678 9012',
            '!@#$% ^&*()'
        ];

        for (const text of anomalies) {
            const emb = await transformersManager.getEmbeddings(text);
            const tensor = tf.tensor2d([emb]);
            this.classifier.addExample(tensor, 'anomaly');
            tensor.dispose();
        }

        this.isReady = true;
        console.log("Glitch Detector Text Model initialized with Transformers.js backend");
    }

    async addExample(text) {
        console.log('[GlitchTextModelManager] addExample (Transformers.js):', { text: text?.substring(0, 50) });
        if (!this.isReady || !this.classifier) {
            await this.loadModel();
        }

        const emb = await transformersManager.getEmbeddings(text);
        const tensor = tf.tensor2d([emb]);
        this.classifier.addExample(tensor, 'normal');
        console.log('[GlitchTextModelManager] Example added. Current count:', this.getExampleCount());
        tensor.dispose();
    }

    async predict(text) {
        if (!this.isReady || !this.classifier) return 0;
        if (this.classifier.getNumClasses() === 0) return 0;

        const emb = await transformersManager.getEmbeddings(text);
        const tensor = tf.tensor2d([emb]);
        const result = await this.classifier.predictClass(tensor);
        tensor.dispose();

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
