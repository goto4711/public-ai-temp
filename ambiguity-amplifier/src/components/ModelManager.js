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

    async predict(input, noiseLevel = 0) {
        if (!this.model) return null;

        return tf.tidy(() => {
            // 1. Get image tensor
            let img;
            if (input instanceof tf.Tensor) {
                img = input.clone();
            } else {
                img = tf.browser.fromPixels(input);
            }

            // 2. Resize to 224x224 (MobileNet expectation)
            img = tf.image.resizeBilinear(img, [224, 224]);

            // 3. Add noise if needed
            if (noiseLevel > 0) {
                // Generate noise: shape [224, 224, 3]
                const noise = tf.randomNormal([224, 224, 3], 0, noiseLevel * 50); // Scale noise
                img = img.add(noise);

                // Clip to valid range [0, 255]
                img = img.clipByValue(0, 255);
            }

            // 4. Classify
            return this.model.classify(img, 10); // Get top 10
        });
    }
}

export const modelManager = new ModelManager();
