import React, { useState, useEffect, useRef } from 'react';
import WebcamInput from './components/WebcamInput';
import { modelManager } from './components/ModelManager';
import * as tf from '@tensorflow/tfjs';
import './App.css';

// Abstract concepts that appear when the AI is confused
const HIDDEN_CONCEPTS = [
  "The Void", "Digital Noise", "Hybrid Entity", "Cultural Glitch",
  "Uncertainty", "The In-Between", "Ghost in the Machine", "Undefined"
];

function App() {
  const [imageA, setImageA] = useState(null); // Tensor
  const [imageB, setImageB] = useState(null); // Tensor
  const [previewA, setPreviewA] = useState(null); // DataURL
  const [previewB, setPreviewB] = useState(null); // DataURL
  const [sliderValue, setSliderValue] = useState(0.5);
  const [prediction, setPrediction] = useState([]);
  const [hiddenConcept, setHiddenConcept] = useState(null);
  const [isModelReady, setIsModelReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRefA = useRef(null);
  const fileInputRefB = useRef(null);
  const [mode, setMode] = useState('webcam'); // 'webcam' or 'upload'

  useEffect(() => {
    async function init() {
      await modelManager.loadModel();
      setIsModelReady(true);
    }
    init();
  }, []);

  const handleFileUpload = (target) => (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.src = evt.target.result;
      img.onload = () => {
        const tensor = tf.browser.fromPixels(img).resizeBilinear([224, 224]);
        const dataUrl = evt.target.result;

        if (target === 'A') {
          if (imageA) imageA.dispose();
          setImageA(tensor);
          setPreviewA(dataUrl);
        } else {
          if (imageB) imageB.dispose();
          setImageB(tensor);
          setPreviewB(dataUrl);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const capture = (target) => {
    if (videoRef.current) {
      const tensor = tf.tidy(() => {
        return tf.browser.fromPixels(videoRef.current).resizeBilinear([224, 224]);
      });

      // Create preview
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      // Flip for preview consistency with webcam
      ctx.translate(224, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, 224, 224);
      const dataUrl = canvas.toDataURL();

      if (target === 'A') {
        if (imageA) imageA.dispose();
        setImageA(tensor);
        setPreviewA(dataUrl);
      } else {
        if (imageB) imageB.dispose();
        setImageB(tensor);
        setPreviewB(dataUrl);
      }
    }
  };

  // Blending Loop
  useEffect(() => {
    if (!imageA || !imageB || !canvasRef.current || !isModelReady) return;

    const blendAndPredict = async () => {
      const blendedTensor = tf.tidy(() => {
        // Linear interpolation: A * (1-t) + B * t
        const t = sliderValue;
        return tf.add(
          imageA.mul(1 - t),
          imageB.mul(t)
        ); // Keep in [0, 255] range for display and classification
        // Actually mobilenet classify takes pixel values. 
        // We should keep it in [0, 255] range for classification.
      });

      // Display on canvas
      const resized = tf.tidy(() => blendedTensor.resizeBilinear([224, 224]).clipByValue(0, 255).cast('int32'));
      await tf.browser.toPixels(resized, canvasRef.current);

      // Predict
      // MobileNet expects [0, 255] float or int
      const results = await modelManager.predict(resized);

      // Logic for "Hidden Concepts"
      // If the top confidence is low, we show a hidden concept
      if (results && results[0]) {
        const topConf = results[0].probability;
        if (topConf < 0.3) {
          // Map slider value to a hidden concept deterministically
          const idx = Math.floor(sliderValue * HIDDEN_CONCEPTS.length) % HIDDEN_CONCEPTS.length;
          setHiddenConcept(HIDDEN_CONCEPTS[idx]);
        } else {
          setHiddenConcept(null);
        }
        setPrediction(results);
      }

      blendedTensor.dispose();
      resized.dispose();
    };

    blendAndPredict();

  }, [imageA, imageB, sliderValue, isModelReady]);

  return (
    <div className="app-container">
      <header>
        <h1>Latent Space Navigator</h1>
        <p>Traverse the hidden paths between concepts.</p>
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

          {mode === 'webcam' && <WebcamInput onVideoReady={v => videoRef.current = v} />}

          <div className="controls" style={{ flexDirection: 'row' }}>
            {mode === 'webcam' ? (
              <>
                <button className="action-btn" onClick={() => capture('A')} style={{ flex: 1 }}>
                  Capture Concept A
                </button>
                <button className="action-btn" onClick={() => capture('B')} style={{ flex: 1 }}>
                  Capture Concept B
                </button>
              </>
            ) : (
              <>
                <button className="action-btn" onClick={() => fileInputRefA.current?.click()} style={{ flex: 1 }}>
                  Upload Concept A
                </button>
                <button className="action-btn" onClick={() => fileInputRefB.current?.click()} style={{ flex: 1 }}>
                  Upload Concept B
                </button>
                <input
                  ref={fileInputRefA}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload('A')}
                />
                <input
                  ref={fileInputRefB}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload('B')}
                />
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <strong>Concept A</strong>
              {previewA && <img src={previewA} alt="A" style={{ display: 'block', width: '100px', border: '2px solid var(--color-main)' }} />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <strong>Concept B</strong>
              {previewB && <img src={previewB} alt="B" style={{ display: 'block', width: '100px', border: '2px solid var(--color-main)' }} />}
            </div>
          </div>
        </div>

        <div className="visualization-section">
          <h2>The In-Between</h2>

          <div className="latent-slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sliderValue}
              onChange={e => setSliderValue(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-main)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem' }}>
              <span>Concept A</span>
              <span>Concept B</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <canvas ref={canvasRef} width="224" height="224" style={{
              width: '300px', height: '300px',
              border: '4px solid var(--color-main)',
              imageRendering: 'pixelated'
            }} />

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              {hiddenConcept ? (
                <div style={{ color: 'var(--color-main)', animation: 'pulse 2s infinite' }}>
                  <h3>??? HIDDEN CONCEPT FOUND ???</h3>
                  <h1 style={{ fontSize: '2.5rem', borderBottom: 'none' }}>{hiddenConcept}</h1>
                </div>
              ) : (
                prediction.length > 0 && (
                  <div>
                    <h3>It looks like: {prediction[0].className.split(',')[0]}</h3>
                    <p>Confidence: {(prediction[0].probability * 100).toFixed(1)}%</p>
                  </div>
                )
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
