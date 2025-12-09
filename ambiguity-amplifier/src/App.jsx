import React, { useState, useEffect, useRef } from 'react';
import WebcamInput from './components/WebcamInput';
import { modelManager } from './components/ModelManager';
import * as tf from '@tensorflow/tfjs';
import './App.css';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isModelReady, setIsModelReady] = useState(false);
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
    reader.onload = async (evt) => {
      const img = new Image();
      img.src = evt.target.result;
      img.onload = async () => {
        // Dispose old tensor if exists
        if (uploadedImage) uploadedImage.dispose();

        // Create tensor and preview
        const tensor = tf.browser.fromPixels(img).resizeBilinear([224, 224]);
        setUploadedImage(tensor);
        setUploadedPreview(evt.target.result);

        // Predict immediately
        if (isModelReady) {
          const results = await modelManager.predict(tensor, noiseLevel);
          if (results) setPredictions(results);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const animate = async () => {
    if (mode === 'webcam' && videoRef.current && isModelReady) {
      const results = await modelManager.predict(videoRef.current, noiseLevel);
      if (results) {
        setPredictions(results);
      }
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isModelReady && mode === 'webcam') {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isModelReady, noiseLevel, mode]);

  // Re-predict when noise changes in upload mode
  useEffect(() => {
    const predictUpload = async () => {
      if (mode === 'upload' && uploadedImage && isModelReady) {
        const results = await modelManager.predict(uploadedImage, noiseLevel);
        if (results) setPredictions(results);
      }
    };
    predictUpload();
  }, [noiseLevel, mode, uploadedImage, isModelReady]);

  return (
    <div className="app-container">
      <header>
        <h1>The Ambiguity Amplifier</h1>
        <p>Explore the fragility of machine certainty.</p>
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

          <div className="controls">
            <div className="control-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 'bold', color: 'var(--color-main)' }}>Noise Injection</label>
                <span>{(noiseLevel * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={noiseLevel}
                onChange={e => setNoiseLevel(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-main)' }}
              />
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
                Add digital noise to the image to see how the AI's confidence crumbles and shifts.
              </p>
            </div>
          </div>
        </div>

        <div className="visualization-section">
          <h2>Confidence Spectrum</h2>

          {!isModelReady && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Neural Network...</div>}

          {isModelReady && predictions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Waiting for video...</div>
          )}

          <div className="confidence-bars">
            {predictions.map((pred, idx) => (
              <div key={pred.className} className="ambiguity-bar-row">
                <div className="ambiguity-label" title={pred.className}>
                  {pred.className.split(',')[0]}
                </div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${pred.probability * 100}%`,
                      height: '100%',
                      backgroundColor: idx === 0 ? 'var(--color-main)' : 'var(--color-main-secondary)',
                      opacity: Math.max(0.3, pred.probability * 2) // Fade out low confidence
                    }}
                  />
                </div>
                <div className="ambiguity-value">
                  {(pred.probability * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>

          {predictions.length > 0 && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              border: '2px solid var(--color-main)',
              backgroundColor: 'white'
            }}>
              <h3 style={{ fontSize: '1.2rem' }}>Interpretation</h3>
              <p>
                The AI is <strong>{(predictions[0].probability * 100).toFixed(0)}%</strong> certain this is a <strong>{predictions[0].className.split(',')[0]}</strong>.
                {predictions[0].probability < 0.5 && (
                  <span style={{ color: '#ff4d4d', display: 'block', marginTop: '0.5rem', fontWeight: 'bold' }}>
                    ⚠️ High Ambiguity Detected. The model is guessing.
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
