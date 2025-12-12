import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

class ModelManager {
    constructor() {
        this.model = null;
        this.examples = []; // Stores activation tensors
    }

    async loadModel() {
        this.model = await mobilenet.load();
        console.log("MobileNet loaded (Custom Anomaly Detector)");
    }

    addExample(tensor) {
        if (!this.model) return;
        // Infer and keep the tensor. We keep the result for the database.
        // infer(tensor, true) returns embedding.
        const activation = this.model.infer(tensor, true);
        // Clean up immediately? No, we need it for the database.
        // But we should simplify it to 1D to make stacking easier later?
        // It comes out as [1, 1024].
        this.examples.push(activation);
    }

    async predict(tensor) {
        if (!this.model || this.examples.length === 0) return null;

        const maxSim = tf.tidy(() => {
            const inputActivation = this.model.infer(tensor, true);

            // Stack all examples into one tensor: [N, 1024]
            // Note: inputActivation is [1, 1024]. examples are list of [1, 1024].
            // tf.concat is better than stack if they are Rank 2.
            const database = tf.concat(this.examples, 0); // [N, 1024]

            // Normalize Input: [1, 1024]
            const inputNorm = inputActivation.div(inputActivation.norm());

            // Normalize Database: [N, 1024]
            // axis 1 is the feature dimension
            const databaseNorm = database.div(database.norm('euclidean', 1, true));

            // Cosine Similarity: [N, 1]
            // [N, 1024] @ [1024, 1]
            const similarities = tf.matMul(databaseNorm, inputNorm.transpose());

            return similarities.max().dataSync()[0];
        });

        // Return format matching UI
        // Score 1.0 = Identical to a normal example
        // Score < 0.5 = Very different
        return {
            confidences: { 'normal': maxSim }
        };
    }

    clear() {
        this.examples.forEach(t => t.dispose());
        this.examples = [];
    }

    getExampleCount() {
        return this.examples.length;
    }
}

export const modelManager = new ModelManager();
