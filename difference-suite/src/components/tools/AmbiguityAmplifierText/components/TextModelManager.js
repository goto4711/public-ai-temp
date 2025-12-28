import { transformersManager } from '../../../../utils/TransformersManager';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

class TextModelManager {
    constructor() {
        this.classifier = null;
        this.isReady = false;
    }

    async loadModel() {
        if (this.isReady) return;
        this.classifier = knnClassifier.create();
        this.isReady = true;
        console.log("KNN Classifier initialized for Ambiguity Amplifier Text (Transformers.js backend)");
    }

    async addExample(text, label) {
        console.log('[TextModelManager] addExample (Transformers.js):', { text: text?.substring(0, 50), label });
        if (!this.isReady || !this.classifier) {
            await this.loadModel();
        }

        const embeddingArray = await transformersManager.getEmbeddings(text);
        const tensor = tf.tensor2d([embeddingArray]);
        this.classifier.addExample(tensor, label);

        console.log('[TextModelManager] Example added. Current counts:', this.classifier.getClassExampleCount());
        tensor.dispose();
    }

    async predict(text) {
        if (!this.isReady || !this.classifier) return null;
        if (this.classifier.getNumClasses() === 0) return null;

        const embeddingArray = await transformersManager.getEmbeddings(text);
        const tensor = tf.tensor2d([embeddingArray]);
        const result = await this.classifier.predictClass(tensor);

        tensor.dispose();
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
