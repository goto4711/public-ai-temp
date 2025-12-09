import React, { useState, useEffect, useRef } from 'react';
import WebcamInput from './components/WebcamInput';
import { modelManager } from './components/ModelManager';
import * as tf from '@tensorflow/tfjs';
import './App.css';

function App() {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [exampleCount, setExampleCount] = useState(0);
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [threshold, setThreshold] = useState(0.8);
  const [mode, setMode] = useState('webcam'); // 'webcam' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null); // Tensor
  const [uploadedPreview, setUploadedPreview] = useState(null); // DataURL

  const videoRef = useRef(null);
  const requestRef = useRef();
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function init() {
      await modelManager.loadModel();
      setIsModelReady(true);
    }
    init();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.src = evt.target.result;
      img.onload = () => {
        if (uploadedImage) uploadedImage.dispose();
        const tensor = tf.browser.fromPixels(img).resizeBilinear([224, 224]);
        setUploadedImage(tensor);
        setUploadedPreview(evt.target.result);
      };
    };
    reader.readAsDataURL(file);
  };

  const trainOnUpload = () => {
    if (uploadedImage && isModelReady) {
      modelManager.addExample(uploadedImage);
      setExampleCount(modelManager.getExampleCount());
    }
  };

  // Training Loop (when button held) - for webcam mode
  useEffect(() => {
    let interval;
    if (isTraining && mode === 'webcam' && videoRef.current && isModelReady) {
      interval = setInterval(() => {
        const tensor = tf.tidy(() => tf.browser.fromPixels(videoRef.current));
        modelManager.addExample(tensor);
        tensor.dispose();
        setExampleCount(modelManager.getExampleCount());
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTraining, isModelReady, mode]);

  // Detection Loop
  const detect = async () => {
    const source = mode === 'webcam' ? videoRef.current : uploadedImage;
    if (source && isModelReady && exampleCount > 0 && !isTraining) {
      const tensor = mode === 'webcam'
        ? tf.tidy(() => tf.browser.fromPixels(source))
        : source;

      const result = await modelManager.predict(tensor);

      if (mode === 'webcam') tensor.dispose();

      if (result) {
        // result.confidences['normal'] is the confidence that it IS normal
        // If 'normal' doesn't exist in result (e.g. if we have other classes, but here we only have 'normal'), 
        // actually KNN with 1 class always returns probability 1 for that class if K=3 and we have >3 examples.
        // Wait. KNN needs *negative* examples to distinguish?
        // NO. KNN calculates distance. But `predictClass` returns probability based on neighbors.
        // If ALL neighbors are 'normal', probability is 1.
        // We need to use DISTANCE, not probability, for anomaly detection with 1 class.
        // BUT `knn-classifier` doesn't expose raw distance easily in `predictClass`.

        // WORKAROUND: We need a "Not Normal" class or we can't use KNN probability.
        // OR we assume the user trains 'normal', and we initialize with some random noise as 'anomaly'.
        // Let's initialize 'anomaly' with random noise examples on load.

        const normConf = result.confidences['normal'] || 0;
        setConfidence(normConf);

        if (normConf < threshold) {
          setIsAnomaly(true);
        } else {
          setIsAnomaly(false);
        }
      }
    }
    if (mode === 'webcam') {
      requestRef.current = requestAnimationFrame(detect);
    }
  };

  useEffect(() => {
    if (isModelReady && exampleCount > 0 && !isTraining) {
      if (mode === 'webcam') {
        requestRef.current = requestAnimationFrame(detect);
      } else {
        detect(); // Run once for upload mode
      }
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isModelReady, exampleCount, isTraining, threshold, mode, uploadedImage]);

  // Initialize 'anomaly' class with random noise so KNN has something to compare against
  useEffect(() => {
    if (isModelReady && modelManager.getExampleCount() === 0) {
      // Add 10 random noise examples as 'anomaly'
      for (let i = 0; i < 10; i++) {
        const noise = tf.randomNormal([224, 224, 3]).mul(255).clipByValue(0, 255).cast('int32');
        // We need to use the model manager's internal classifier access or extend it
        // Let's extend ModelManager to handle this or just do it here if we exposed classifier.
        // I'll update ModelManager to have initAnomaly()
      }
    }
  }, [isModelReady]);

  return (
    <div className="app-container">
      <div className={`glitch-overlay ${isAnomaly ? 'glitch-active' : ''}`}></div>

      <header>
        <h1>Glitch Detector</h1>
        <p>Train "Normal". Detect the Abnormal.</p>
      </header>

      <main>
        <div className="input-section">
          <div className="mode-switcher" style={{ marginBottom: '1rem' }}>
            <button
              className={`mode-btn ${mode === 'webcam' ? 'active' : ''}`}
              onClick={() => setMode('webcam')}
            >
              Webcam
            </button>
            <button
              className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
            >
              Upload
            </button>
          </div>

          {mode === 'webcam' ? (
            <WebcamInput onVideoReady={v => videoRef.current = v} />
          ) : (
            <div
              className="webcam-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedPreview ? (
                <img
                  src={uploadedPreview}
                  alt="Uploaded"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <p style={{ fontSize: '2rem' }}>📁</p>
                  <p>Click to Upload Image</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          )}

          <div className={`status-indicator ${isAnomaly ? 'status-anomaly' : 'status-normal'}`}>
            {isAnomaly ? "⚠️ ANOMALY DETECTED ⚠️" : "SYSTEM NORMAL"}
          </div>

          <div className="controls">
            {mode === 'webcam' ? (
              <button
                className="action-btn"
                onMouseDown={() => setIsTraining(true)}
                onMouseUp={() => setIsTraining(false)}
                onMouseLeave={() => setIsTraining(false)}
                onTouchStart={() => setIsTraining(true)}
                onTouchEnd={() => setIsTraining(false)}
                style={{ backgroundColor: isTraining ? 'var(--color-alt)' : 'white' }}
              >
                {isTraining ? "Training..." : "Hold to Train 'Normal'"}
              </button>
            ) : (
              <button
                className="action-btn"
                onClick={trainOnUpload}
                disabled={!uploadedImage}
                style={{ backgroundColor: uploadedImage ? 'var(--color-alt)' : 'white', opacity: uploadedImage ? 1 : 0.5 }}
              >
                Add Image to 'Normal' Training
              </button>
            )}
            <button className="delete-btn" onClick={() => { modelManager.clear(); setExampleCount(0); }}>
              Reset Model
            </button>

            <div style={{ marginTop: '1rem' }}>
              <label>Sensitivity Threshold: {threshold.toFixed(2)}</label>
              <input
                type="range" min="0.5" max="1" step="0.01"
                value={threshold}
                onChange={e => setThreshold(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-main)' }}
              />
            </div>
          </div>
        </div>

        <div className="visualization-section">
          <h2>System Status</h2>
          <div style={{ padding: '1rem', border: '2px solid var(--color-main)', background: 'white' }}>
            <p><strong>Normal Samples:</strong> {exampleCount}</p>
            <p><strong>Current Match Confidence:</strong> {(confidence * 100).toFixed(1)}%</p>
            <div style={{ width: '100%', height: '20px', background: '#eee', marginTop: '0.5rem' }}>
              <div style={{
                width: `${confidence * 100}%`,
                height: '100%',
                background: confidence < threshold ? 'red' : 'green',
                transition: 'all 0.1s'
              }} />
            </div>
            <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
              <strong>Instructions:</strong>
              <ol>
                <li>Point camera at a static background (e.g. empty wall).</li>
                <li>Hold "Train Normal" for 3-5 seconds.</li>
                <li>Introduce an object (your hand, a face).</li>
                <li>Watch the system glitch as it detects the anomaly.</li>
              </ol>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
