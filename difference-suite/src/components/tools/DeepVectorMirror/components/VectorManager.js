import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as speechCommands from '@tensorflow-models/speech-commands';

class VectorManager {
    constructor() {
        this.models = {
            image: null,
            text: null,
            sound: null
        };
        this.recognizer = null;
    }

    async loadModel(mode) {
        if (this.models[mode]) return;

        if (mode === 'image') {
            this.models.image = await mobilenet.load();
        } else if (mode === 'text') {
            this.models.text = await use.load();
        } else if (mode === 'sound') {
            this.recognizer = speechCommands.create('BROWSER_FFT');
            await this.recognizer.ensureModelLoaded();
            this.models.sound = this.recognizer;
        }
    }

    async getVector(input, mode) {
        if (!this.models[mode]) await this.loadModel(mode);

        if (mode === 'image') {
            // input is an HTMLVideoElement or HTMLImageElement
            const activation = this.models.image.infer(input, true);
            const vector = await activation.data();
            activation.dispose();
            return Array.from(vector);
        } else if (mode === 'text') {
            // input is a string
            const embeddings = await this.models.text.embed(input);
            const vector = await embeddings.data();
            embeddings.dispose();
            return Array.from(vector);
        } else if (mode === 'sound') {
            // input is spectrogram data (Float32Array)
            // For sound, we might just return the raw spectrogram frame as the "vector"
            // or use the recognizer's internal model to get an embedding if possible.
            // For simplicity and visualization, the spectrogram frame itself is a good "vector".
            return Array.from(input);
        }
        return [];
    }

    getSoundRecognizer() {
        return this.recognizer;
    }
}

export const vectorManager = new VectorManager();
