import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

class ModelManager {
    constructor() {
        this.model = null;
        this.classifier = null;
    }

    async loadModel() {
        this.model = await mobilenet.load();
        this.classifier = knnClassifier.create();
        console.log("MobileNet and KNN loaded");
    }

    addExample(tensor) {
        if (!this.model || !this.classifier) return;
        const activation = this.model.infer(tensor, true);
        this.classifier.addExample(activation, 'normal');
        activation.dispose();
    }

    async predict(tensor) {
        if (!this.model || !this.classifier) return null;
        if (this.classifier.getNumClasses() === 0) return null;

        const activation = this.model.infer(tensor, true);
        // Get the result
        const result = await this.classifier.predictClass(activation);
        activation.dispose();
        return result;
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
