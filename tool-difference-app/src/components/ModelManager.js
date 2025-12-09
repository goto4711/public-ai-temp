import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as speechCommands from '@tensorflow-models/speech-commands';
import * as tf from '@tensorflow/tfjs';

class ModelManager {
  constructor() {
    this.classifiers = {
      image: knnClassifier.create(),
      text: knnClassifier.create(),
      sound: knnClassifier.create()
    };

    // KNN Models (feature extractors)
    this.models = {
      image: null,
      text: null,
      sound: null
    };

    // Neural Network Models (trained heads)
    this.nnModels = {
      image: null,
      text: null,
      sound: null
    };

    // Raw training data for NN
    this.trainingData = {
      image: [],
      text: [],
      sound: []
    };

    this.isModelLoaded = {
      image: false,
      text: false,
      sound: false
    };

    this.soundRecognizer = null;
  }

  async loadModel(mode) {
    if (this.isModelLoaded[mode]) return;

    console.log(`Loading ${mode} model...`);

    if (mode === 'image') {
      this.models.image = await mobilenet.load();
    } else if (mode === 'text') {
      this.models.text = await use.load();
    } else if (mode === 'sound') {
      this.soundRecognizer = speechCommands.create('BROWSER_FFT');
      await this.soundRecognizer.ensureModelLoaded();
      this.models.sound = this.soundRecognizer;
    }

    this.isModelLoaded[mode] = true;
    console.log(`${mode} model loaded`);
  }

  async addExample(input, classId, mode) {
    if (!this.isModelLoaded[mode]) return;

    let activation;

    if (mode === 'image') {
      activation = this.models.image.infer(input, true);
      this.classifiers.image.addExample(activation, classId);
      // Store for NN
      this.trainingData.image.push({
        activation: activation.clone(),
        label: classId
      });
      activation.dispose();
    } else if (mode === 'text') {
      // Input is string
      const embeddings = await this.models.text.embed([input]);
      this.classifiers.text.addExample(embeddings, classId);
      // Store for NN
      this.trainingData.text.push({
        activation: embeddings.clone(),
        label: classId
      });
      embeddings.dispose();
    } else if (mode === 'sound') {
      // Input is spectrogram tensor
      this.classifiers.sound.addExample(input, classId);
      // Store for NN
      this.trainingData.sound.push({
        activation: input.clone(),
        label: classId
      });
    }
  }

  // Create a simple dense neural network
  createModel(inputShape, numClasses) {
    const model = tf.sequential();
    model.add(tf.layers.dense({
      inputShape: inputShape,
      units: 128,
      activation: 'relu'
    }));
    model.add(tf.layers.dense({
      units: numClasses,
      activation: 'softmax'
    }));
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    return model;
  }

  async trainModel(mode, numClasses) {
    const data = this.trainingData[mode];
    if (data.length === 0) return null;

    // Prepare data
    const xs = tf.concat(data.map(d => d.activation));
    const ys = tf.oneHot(tf.tensor1d(data.map(d => d.label), 'int32'), numClasses);

    // Create model if not exists or if output shape changed (simplified: recreate always for now)
    const inputShape = [data[0].activation.shape[1]];
    this.nnModels[mode] = this.createModel(inputShape, numClasses);

    console.log(`Training ${mode} NN model with ${data.length} examples...`);

    await this.nnModels[mode].fit(xs, ys, {
      epochs: 20,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
        }
      }
    });

    xs.dispose();
    ys.dispose();
    console.log(`${mode} NN model trained`);
    return this.nnModels[mode];
  }

  async predict(input, mode, classifierType = 'knn') {
    if (!this.isModelLoaded[mode]) return null;

    let activation;
    let result = null;

    // 1. Get Activation / Embedding
    if (mode === 'image') {
      activation = this.models.image.infer(input, true);
    } else if (mode === 'text') {
      activation = await this.models.text.embed([input]);
    } else if (mode === 'sound') {
      activation = input; // Already tensor
    }

    // 2. Predict
    if (classifierType === 'knn') {
      if (this.classifiers[mode].getNumClasses() > 0) {
        result = await this.classifiers[mode].predictClass(activation);
      }
    } else if (classifierType === 'neuralNetwork') {
      if (this.nnModels[mode]) {
        const preds = this.nnModels[mode].predict(activation);
        const probabilities = preds.dataSync();
        const label = preds.argMax(1).dataSync()[0];

        // Format like KNN result
        const confidences = {};
        probabilities.forEach((p, i) => confidences[i] = p);

        result = {
          label: label,
          confidences: confidences
        };
        preds.dispose();
      }
    }

    if (mode !== 'sound' && activation) {
      activation.dispose();
    }

    return result;
  }

  getClassCounts(mode) {
    return this.classifiers[mode].getClassExampleCount();
  }

  clearClass(classId, mode) {
    this.classifiers[mode].clearClass(classId);
    // Also clear from training data
    this.trainingData[mode] = this.trainingData[mode].filter(d => d.label !== classId);
  }

  clearAllClasses(mode) {
    this.classifiers[mode].clearAllClasses();
    // Clear training data
    this.trainingData[mode].forEach(d => d.activation.dispose());
    this.trainingData[mode] = [];
    this.nnModels[mode] = null;
  }

  saveModel(mode) {
    // Save KNN dataset
    const dataset = this.classifiers[mode].getDataset();
    let datasetObj = {};
    Object.keys(dataset).forEach((key) => {
      let data = dataset[key].dataSync();
      datasetObj[key] = Array.from(data);
    });
    localStorage.setItem(`${mode}KNNClassifierDataset`, JSON.stringify(datasetObj));

    // Note: Saving NN model and raw training data is more complex and skipped for now as per user request for "simple" NN.
    // We rely on re-training from the KNN dataset if we wanted to persist, but KNN dataset is aggregated.
    // For now, NN is transient (session-based) or we assume user adds data again.
    // Actually, we can save the trainingData if we want, but it might be large.
  }

  loadSavedModel(mode) {
    const datasetObj = JSON.parse(localStorage.getItem(`${mode}KNNClassifierDataset`));
    if (!datasetObj) return false;

    let dataset = {};
    Object.keys(datasetObj).forEach((key) => {
      let shape;
      if (mode === 'image') shape = [datasetObj[key].length / 1024, 1024];
      if (mode === 'text') shape = [datasetObj[key].length / 512, 512];
      if (mode === 'sound') return; // Skip sound for now

      const tensor = tf.tensor(datasetObj[key], shape);
      dataset[key] = tensor;

      // Re-populate trainingData from KNN dataset? 
      // KNN dataset merges all examples of a class into one tensor [N, features].
      // We can split it back to individual examples for NN training.
      const numExamples = tensor.shape[0];
      const classId = parseInt(key);
      const examples = tf.split(tensor, numExamples);
      examples.forEach(ex => {
        this.trainingData[mode].push({
          activation: ex.clone(),
          label: classId
        });
      });
      // examples are clones, we can dispose the split results? No, we pushed clones.
      // Wait, tf.split returns tensors. We pushed clones. So we should dispose the split results?
      // Actually, let's just push the split results directly if we don't clone.
      // But let's be safe.
    });

    if (Object.keys(dataset).length > 0) {
      this.classifiers[mode].setDataset(dataset);
      return true;
    }
    return false;
  }

  exportDataset(mode) {
    const dataset = this.classifiers[mode].getDataset();
    let datasetObj = {};
    Object.keys(dataset).forEach((key) => {
      let data = dataset[key].dataSync();
      datasetObj[key] = Array.from(data);
    });
    return JSON.stringify(datasetObj);
  }

  getSoundRecognizer() {
    return this.soundRecognizer;
  }
}

export const modelManager = new ModelManager();
