import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

class ModelManager {
    constructor() {
        this.model = null;
    }

    async loadModel() {
        this.model = await mobilenet.load();
        console.log("MobileNet loaded");
    }

    async predict(tensor) {
        if (!this.model) return null;
        return this.model.classify(tensor, 5);
    }
}

export const modelManager = new ModelManager();
