import React, { useState, useEffect, useRef } from 'react';
import { Upload, Play, RefreshCw, AlertTriangle, Activity, EyeOff } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { NoiseModel } from './components/NoiseModel';
import { ResidualCanvas } from './components/ResidualCanvas';

const App = () => {
  const [model] = useState(new NoiseModel());
  const [image, setImage] = useState(null);
  const [tensor, setTensor] = useState(null);
  const [reconstructed, setReconstructed] = useState(null);
  const [residual, setResidual] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [loss, setLoss] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [latentDim, setLatentDim] = useState(32);

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const initTF = async () => {
      await tf.ready();
      console.log('TensorFlow.js ready');
    };
    initTF();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        // Reset state
        setTensor(null);
        setReconstructed(null);
        setResidual(null);
        setLoss(0);
        setEpoch(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    console.log('processImage called');
    console.log('imgRef.current:', imgRef.current);

    if (!imgRef.current) {
      console.error('No image ref available');
      return;
    }

    try {
      const t = tf.tidy(() => {
        const tensor = tf.browser.fromPixels(imgRef.current)
          .resizeNearestNeighbor([256, 256])
          .toFloat()
          .div(255.0)
          .expandDims();
        return tensor;
      });

      console.log('Tensor created:', t.shape);
      setTensor(t);

      // Initialize model with input shape
      console.log('Creating model...');
      await model.createModel([256, 256, 3], latentDim);
      console.log('Model created successfully');
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  const trainModel = async () => {
    console.log('=== TRAINING STARTED ===');

    if (!tensor) {
      console.error('No tensor for training');
      return;
    }

    console.log('Tensor shape:', tensor.shape);
    setIsTraining(true);

    try {
      await model.train(tensor, 50, (epochNum, lossValue) => {
        console.log(`Epoch ${epochNum + 1}/50, Loss: ${lossValue.toFixed(6)}`);
        setEpoch(epochNum + 1);
        setLoss(lossValue);

        if (epochNum % 5 === 0) {
          updateVisualization();
        }
      });

      console.log('=== TRAINING COMPLETE ===');
      updateVisualization();
    } catch (error) {
      console.error('Training error:', error);
    }

    setIsTraining(false);
  };

  const updateVisualization = async () => {
    if (!tensor) return;

    const recon = model.predict(tensor);
    const res = model.getResidual(tensor, recon);

    // Squeeze to remove batch dim for canvas
    const reconSqueezed = recon.squeeze();
    const resSqueezed = res.squeeze();

    // Clean up old tensors if needed, but React state handles refs
    // Ideally we should dispose old state tensors, but for this demo we rely on GC 
    // or we can wrap in tidy if we weren't setting state.
    // To be safe with memory in a loop, we should dispose previous state tensors if they exist.
    // For now, let's just set them.

    setReconstructed(reconSqueezed);
    setResidual(resSqueezed);

    recon.dispose();
    res.dispose();
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-8 font-sans selection:bg-[var(--color-main)] selection:text-white">
      <header className="mb-12 border-b-4 border-[var(--color-main)] pb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter mb-2 flex items-center justify-center gap-3 text-[var(--color-main)] uppercase">
          <EyeOff className="w-10 h-10" />
          The Noise Predictor
        </h1>
        <p className="text-[var(--color-text)] text-lg max-w-2xl mx-auto opacity-80">
          Inverting the signal-to-noise ratio. Visualizing what the model <span className="text-[var(--color-main)] font-bold">refuses to see</span>.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-3 space-y-6">
          <div className="deep-panel p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b-2 border-[var(--color-main)] pb-2">
              <Activity className="w-5 h-5" />
              Controls
            </h2>

            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--color-main)] hover:bg-white/50 p-8 text-center cursor-pointer transition-colors group"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--color-main)]" />
                <span className="text-sm font-bold text-[var(--color-main)] uppercase">Upload Image</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {image && (
                <div className="space-y-4 pt-4 border-t-2 border-[var(--color-main)]">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="opacity-70">Status</span>
                    <span className={isTraining ? "text-[var(--color-main)] animate-pulse" : "text-[var(--color-text)]"}>
                      {isTraining ? "Training..." : "Ready"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="opacity-70">Loss (MSE)</span>
                    <span className="font-mono">{loss.toFixed(6)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="opacity-70">Epoch</span>
                    <span className="font-mono">{epoch} / 50</span>
                  </div>

                  <button
                    onClick={trainModel}
                    disabled={isTraining || !tensor}
                    className="w-full deep-button flex items-center justify-center gap-2"
                  >
                    {isTraining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isTraining ? "Learning Noise..." : "Start Analysis"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="deep-panel p-6 bg-white">
            <h3 className="text-sm font-bold mb-2 text-[var(--color-main)] uppercase tracking-wider flex items-center gap-2 border-b-2 border-[var(--color-alt)] pb-1">
              <AlertTriangle className="w-4 h-4" />
              Epistemic Translation
            </h3>
            <p className="text-sm italic opacity-80">
              "We translate <strong>Resolution</strong> into <strong>Noise</strong>. By forcing the model through a bottleneck, we reveal the 'excess' culture that cannot be encoded."
            </p>
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="lg:col-span-9 space-y-8">
          {image ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Original */}
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-[var(--color-main)] text-sm uppercase tracking-wider font-bold">Input Signal</h3>
                <div className="relative group border-4 border-[var(--color-main)] shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                  <img
                    ref={imgRef}
                    src={image}
                    alt="Original"
                    onLoad={processImage}
                    className="max-w-full h-auto"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              {/* Reconstructed (The Model's View) */}
              <div className="flex flex-col items-center space-y-2">
                {reconstructed ? (
                  <ResidualCanvas tensor={reconstructed} width={256} height={256} label="Model Perception" />
                ) : (
                  <div className="w-[256px] h-[256px] bg-white flex items-center justify-center border-4 border-[var(--color-main)] shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                    <span className="text-[var(--color-main)] text-xs font-bold uppercase">Waiting for analysis...</span>
                  </div>
                )}
              </div>

              {/* Residual (The Noise) */}
              <div className="flex flex-col items-center space-y-2">
                {residual ? (
                  <ResidualCanvas tensor={residual} width={256} height={256} label="The Noise (Residual)" />
                ) : (
                  <div className="w-[256px] h-[256px] bg-white flex items-center justify-center border-4 border-[var(--color-main)] shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                    <span className="text-[var(--color-main)] text-xs font-bold uppercase">Waiting for analysis...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border-4 border-dashed border-[var(--color-main)] bg-white/50 text-[var(--color-main)]">
              <EyeOff className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-bold uppercase">Upload an image to begin noise analysis</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
