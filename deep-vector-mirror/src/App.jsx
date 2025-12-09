import React, { useState, useEffect, useRef } from 'react';
import { vectorManager } from './components/VectorManager';
import VectorHeatmap from './components/VectorHeatmap';
import './App.css';

// Reusing components from previous app where possible or simplified versions
const WebcamInput = ({ onVideoReady }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            onVideoReady(videoRef.current);
          };
        }
      });
    }
  }, [onVideoReady]);
  return (
    <div className="webcam-container">
      <video ref={videoRef} width="224" height="224" style={{ transform: 'scaleX(-1)' }} />
    </div>
  );
};

function App() {
  const [mode, setMode] = useState('image');
  const [vector, setVector] = useState([]);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [contextLevel, setContextLevel] = useState(0);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const videoRef = useRef(null);
  const requestRef = useRef();
  const [textInput, setTextInput] = useState("Hello World");
  const [isListening, setIsListening] = useState(false);

  // Load models
  useEffect(() => {
    vectorManager.loadModel(mode);
  }, [mode]);

  // Processing Loop
  const process = async () => {
    let rawVector = [];

    if (mode === 'image' && videoRef.current) {
      rawVector = await vectorManager.getVector(videoRef.current, 'image');
    } else if (mode === 'text') {
      rawVector = await vectorManager.getVector(textInput, 'text');
    }
    // Sound is handled via callback

    if (rawVector.length > 0) {
      if (isCloudMode) {
        setIsUploading(true);
        // Simulate network delay (500ms - 1500ms)
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
        setIsUploading(false);
      }

      // Apply Fragility (Noise)
      const noisyVector = rawVector.map(v => v + (Math.random() - 0.5) * noiseLevel * 2);

      // Apply Context (Shift)
      // Simulating a "Historical Context" vector that adds a bias
      const contextVector = noisyVector.map((v, i) => v + Math.sin(i) * contextLevel);

      setVector(contextVector);
    }

    if (mode === 'image' && isAutoMode) {
      requestRef.current = requestAnimationFrame(process);
    }
  };

  useEffect(() => {
    if (!isAutoMode) return;

    if (mode === 'image') {
      requestRef.current = requestAnimationFrame(process);
    } else if (mode === 'text') {
      process();
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [mode, textInput, noiseLevel, contextLevel, isAutoMode]);

  // Sound Handler
  useEffect(() => {
    if (mode === 'sound' && isAutoMode) {
      const recognizer = vectorManager.getSoundRecognizer();
      if (recognizer && !isListening) {
        setIsListening(true);
        recognizer.listen(async ({ spectrogram }) => {
          // If cloud mode and already uploading, drop this frame (simulate bandwidth constraint)
          if (isCloudMode && isUploading) return;

          // Spectrogram is the vector
          const rawVector = Array.from(spectrogram.data);

          if (isCloudMode) {
            setIsUploading(true);
            // Simulate network delay (500ms - 1500ms)
            await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
            setIsUploading(false);
          }

          // Apply modifiers
          const noisyVector = rawVector.map(v => v + (Math.random() - 0.5) * noiseLevel * 10); // Higher scale for sound
          const contextVector = noisyVector.map((v, i) => v + Math.sin(i) * contextLevel * 5);

          setVector(contextVector);
        }, { includeSpectrogram: true, overlapFactor: 0.5 });
      }
    }
    return () => {
      if (mode === 'sound' && vectorManager.getSoundRecognizer()) {
        vectorManager.getSoundRecognizer().stop();
        setIsListening(false);
      }
    }
  }, [mode, noiseLevel, contextLevel, isAutoMode]);

  const handleManualVectorize = async () => {
    if (mode === 'sound') {
      const recognizer = vectorManager.getSoundRecognizer();
      if (recognizer) {
        setIsListening(true);
        // Listen for just one frame
        await recognizer.listen(async ({ spectrogram }) => {
          await recognizer.stop();
          setIsListening(false);

          const rawVector = Array.from(spectrogram.data);

          if (isCloudMode) {
            setIsUploading(true);
            await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
            setIsUploading(false);
          }

          const noisyVector = rawVector.map(v => v + (Math.random() - 0.5) * noiseLevel * 10);
          const contextVector = noisyVector.map((v, i) => v + Math.sin(i) * contextLevel * 5);
          setVector(contextVector);

        }, { includeSpectrogram: true, overlapFactor: 0.5, invokeCallbackOnNoiseAndUnknown: true });
      }
    } else {
      process();
    }
  };


  return (
    <div className="app-container">
      <header>
        <h1>Deep Vector Mirror</h1>
        <div className="mode-switcher">
          <button className={`mode-btn ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>Image</button>
          <button className={`mode-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>Text</button>
          <button className={`mode-btn ${mode === 'sound' ? 'active' : ''}`} onClick={() => setMode('sound')}>Sound</button>
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>

        {/* Sidebar Controls */}
        <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div className="sidebar-control">
            <h3>Fragility Explorer</h3>
            <p className="description">Add noise to "break" the mirror. See how stable the vector really is.</p>
            <label>Noise Level: {noiseLevel.toFixed(2)}</label>
            <input
              type="range" min="0" max="1" step="0.01"
              value={noiseLevel} onChange={e => setNoiseLevel(parseFloat(e.target.value))}
            />
          </div>

          <div className="sidebar-control">
            <h3>Context Bias</h3>
            <p className="description">Inject a "Historical" context vector. Does the meaning change?</p>
            <label>Context Weight: {contextLevel.toFixed(2)}</label>
            <input
              type="range" min="0" max="1" step="0.01"
              value={contextLevel} onChange={e => setContextLevel(parseFloat(e.target.value))}
            />
          </div>

          <div className="sidebar-control">
            <h3>Infrastructure</h3>
            <div className="toggle-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label>Local</label>
              <input
                type="checkbox"
                checked={isCloudMode}
                onChange={e => setIsCloudMode(e.target.checked)}
              />
              <label>Cloud (Simulated)</label>
            </div>
            {isCloudMode && <p className="warning-text" style={{ color: 'red' }}>Warning: Data leaving device.</p>}
          </div>

        </div>

        {/* Main Mirror Area */}
        <div className="mirror-display" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

          {/* Input Display */}
          <div className="input-display">
            {mode === 'image' && <WebcamInput onVideoReady={v => videoRef.current = v} />}
            {mode === 'text' && (
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                style={{
                  width: '300px', height: '150px',
                  padding: '1rem', fontSize: '1.2rem',
                  border: '4px solid var(--color-main)'
                }}
              />
            )}
            {mode === 'sound' && (
              <div style={{ padding: '2rem', border: '4px solid var(--color-main)' }}>
                {isListening ? "Listening..." : "Starting Mic..."}
              </div>
            )}
          </div>

          {/* Arrow */}
          <div style={{ fontSize: '2rem', color: 'var(--color-main)' }}>⬇️ Vectorizes To ⬇️</div>

          {/* Controls */}
          <div className="vector-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleManualVectorize}
              className="action-btn"
              disabled={isAutoMode || (mode === 'sound' && isListening)}
              style={{
                padding: '0.5rem 1.5rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                backgroundColor: isAutoMode ? '#ccc' : 'var(--color-alt)',
                border: '2px solid var(--color-main)',
                cursor: isAutoMode ? 'not-allowed' : 'pointer'
              }}
            >
              {mode === 'sound' && isListening ? 'Listening...' : 'Vectorize'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="auto-mode"
                checked={isAutoMode}
                onChange={e => setIsAutoMode(e.target.checked)}
              />
              <label htmlFor="auto-mode" style={{ fontWeight: 'bold', color: 'var(--color-main)' }}>Continuous / Auto</label>
            </div>
          </div>

          {/* Vector Visualization */}
          <div className="vector-display">
            <div className="vector-wrapper">
              <VectorHeatmap vector={vector} width={400} height={400} />
              {isCloudMode && isUploading && (
                <div className="upload-overlay">
                  Uploading...
                </div>
              )}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <strong>Vector Dimensions:</strong> {vector.length} <br />
              <small>Each square is one dimension of the deep learning representation.</small>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default App;
