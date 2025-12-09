import React, { useState, useEffect, useRef } from 'react';
import WebcamInput from './components/WebcamInput';
import TextInput from './components/TextInput';
import AudioInput from './components/AudioInput';
import EmbeddingVisualizer from './components/EmbeddingVisualizer';
import ClassControl from './components/ClassControl';
import { modelManager } from './components/ModelManager';
import * as tf from '@tensorflow/tfjs';
import './App.css';

const COLORS = ['#832161', '#ADFC92', '#bdceea', '#ffffff', '#000000', '#ff4d4d', '#ffff4d'];

function App() {
  const [mode, setMode] = useState('image'); // 'image', 'text', 'sound'
  const [classifierType, setClassifierType] = useState('knn'); // 'knn' or 'neuralNetwork'
  const [isTraining, setIsTraining] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);

  // State for each mode
  const [classes, setClasses] = useState({
    image: [
      { id: 0, name: 'Class A', count: 0 },
      { id: 1, name: 'Class B', count: 0 },
      { id: 2, name: 'Class C', count: 0 }
    ],
    text: [
      { id: 0, name: 'Class A', count: 0 },
      { id: 1, name: 'Class B', count: 0 },
      { id: 2, name: 'Class C', count: 0 }
    ],
    sound: [
      { id: 0, name: 'Class A', count: 0 },
      { id: 1, name: 'Class B', count: 0 },
      { id: 2, name: 'Class C', count: 0 }
    ]
  });

  const [currentConfidences, setCurrentConfidences] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5); // Default threshold
  const [isListening, setIsListening] = useState(false); // For sound

  const videoRef = useRef(null);
  const requestRef = useRef();
  const fileInputRef = useRef(null);
  const textInputRef = useRef('');

  // Initialize Model
  useEffect(() => {
    async function init() {
      setIsModelReady(false);
      await modelManager.loadModel(mode);
      setIsModelReady(true);

      // Try to load saved model
      if (modelManager.loadSavedModel(mode)) {
        updateCounts();
      }
    }
    init();
  }, [mode]);

  const handleVideoReady = (videoElement) => {
    videoRef.current = videoElement;
    if (mode === 'image') animate();
  };

  const updateCounts = () => {
    const counts = modelManager.getClassCounts(mode);
    setClasses(prev => ({
      ...prev,
      [mode]: prev[mode].map(c => ({
        ...c,
        count: counts[c.id] || 0
      }))
    }));
  };

  // Prediction Loop (Image)
  const animate = async () => {
    if (mode === 'image' && isModelReady && videoRef.current) {
      const counts = modelManager.getClassCounts('image');
      if (Object.keys(counts).length > 0) {
        const result = await modelManager.predict(videoRef.current, 'image', classifierType);
        if (result) {
          setPrediction(result.label);
          setCurrentConfidences(result.confidences);
        }
      }
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (mode === 'image') {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      setPrediction(null);
      setCurrentConfidences({});
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [mode, isModelReady, classifierType]);


  // Training Handler
  const handleTrain = async (classId) => {
    if (!isModelReady) return;

    if (mode === 'image' && videoRef.current) {
      await modelManager.addExample(videoRef.current, classId, 'image');
      updateCounts();
    }
    else if (mode === 'text') {
      const text = document.getElementById('text-input-source').value;
      if (!text.trim()) return alert("Please type some text first");
      await modelManager.addExample(text, classId, 'text');
      updateCounts();
      // Predict immediately for text
      const result = await modelManager.predict(text, 'text', classifierType);
      if (result) {
        setPrediction(result.label);
        setCurrentConfidences(result.confidences);
      }
    }
    else if (mode === 'sound') {
      if (isListening) return;
      setIsListening(true);
      const recognizer = modelManager.getSoundRecognizer();
      recognizer.listen(async ({ spectrogram }) => {
        // We take one sample
        await modelManager.addExample(spectrogram.data, classId, 'sound');
        updateCounts();
        recognizer.stop();
        setIsListening(false);
      }, { includeSpectrogram: true, probabilityThreshold: 0, invokeCallbackOnNoiseAndUnknown: true, overlapFactor: 0.50 });
    }
  };

  const handleTrainModel = async () => {
    setIsTraining(true);
    // Small delay to let UI update
    setTimeout(async () => {
      const numClasses = classes[mode].length;
      await modelManager.trainModel(mode, numClasses);
      setIsTraining(false);
      alert("Neural Network Trained!");
    }, 100);
  };

  useEffect(() => {
    let soundInterval;
    if (mode === 'sound' && isModelReady) {
      const counts = modelManager.getClassCounts('sound');
      if (Object.keys(counts).length > 0) {
        const recognizer = modelManager.getSoundRecognizer();
        if (!recognizer.isListening()) {
          recognizer.listen(async ({ spectrogram }) => {
            const result = await modelManager.predict(spectrogram.data, 'sound', classifierType);
            if (result) {
              setPrediction(result.label);
              setCurrentConfidences(result.confidences);
            }
          }, { includeSpectrogram: true, overlapFactor: 0.5 });
        }
      }
    }
    return () => {
      if (mode === 'sound' && modelManager.getSoundRecognizer() && modelManager.getSoundRecognizer().isListening()) {
        modelManager.getSoundRecognizer().stop();
      }
    }
  }, [mode, isModelReady, classes.sound, classifierType]);


  const handleNameChange = (id, newName) => {
    setClasses(prev => ({
      ...prev,
      [mode]: prev[mode].map(c => c.id === id ? { ...c, name: newName } : c)
    }));
  };

  const addNewClass = () => {
    const currentClasses = classes[mode];
    const newId = currentClasses.length > 0 ? Math.max(...currentClasses.map(c => c.id)) + 1 : 0;
    setClasses(prev => ({
      ...prev,
      [mode]: [...currentClasses, { id: newId, name: `Class ${String.fromCharCode(65 + newId)}`, count: 0 }]
    }));
  };

  const handleDeleteClass = (id) => {
    const cls = classes[mode].find(c => c.id === id);
    if (cls && window.confirm(`Are you sure you want to delete ${cls.name}?`)) {
      try {
        modelManager.clearClass(id, mode);
      } catch (e) {
        console.error("Failed to clear class from model", e);
      }

      setClasses(prev => ({
        ...prev,
        [mode]: prev[mode].filter(c => c.id !== id)
      }));
    }
  };

  const handleSave = () => {
    modelManager.saveModel(mode);
    alert(`${mode} model saved!`);
  };

  const handleClear = () => {
    modelManager.clearAllClasses(mode);
    updateCounts();
    setPrediction(null);
    setCurrentConfidences({});
  };

  const handleExport = () => {
    const json = modelManager.exportDataset(mode);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `little-tool-${mode}-model.json`;
    a.click();
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const classIdStr = prompt(`Enter class ID to assign these files to:`);
    const classId = parseInt(classIdStr);

    // Validate class ID exists
    if (isNaN(classId) || !classes[mode].find(c => c.id === classId)) {
      alert("Invalid class ID");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (mode === 'image') {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (evt) => {
          img.src = evt.target.result;
          img.onload = () => {
            const tfImg = tf.browser.fromPixels(img);
            modelManager.addExample(tfImg, classId, 'image');
            tfImg.dispose();
            updateCounts();
          }
        };
        reader.readAsDataURL(file);
      }
      else if (mode === 'text') {
        const reader = new FileReader();
        reader.onload = async (evt) => {
          const lines = evt.target.result.split('\n').filter(l => l.trim());
          for (const line of lines) {
            await modelManager.addExample(line, classId, 'text');
          }
          updateCounts();
        };
        reader.readAsText(file);
      }
      else if (mode === 'sound') {
        // Sound upload is experimental
        alert("Sound upload is experimental. Processing...");
        await modelManager.processAudioFile(file, classId);
        updateCounts();
      }
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Little Tool of Difference</h1>

        <div className="classifier-toggle" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '1rem', fontWeight: 'bold', color: 'var(--color-main)' }}>Model Type:</label>
            <select
              value={classifierType}
              onChange={(e) => setClassifierType(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '2px solid var(--color-main)',
                fontFamily: 'var(--font-main)',
                fontSize: '1rem'
              }}
            >
              <option value="knn">KNN (Instant)</option>
              <option value="neuralNetwork">Neural Network (Trainable)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '1rem', fontWeight: 'bold', color: 'var(--color-main)' }}>Uncertainty Threshold: {confidenceThreshold.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              style={{ accentColor: 'var(--color-main)' }}
            />
          </div>
        </div>

        <div className="mode-switcher">
          <button className={`mode-btn ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>Image</button>
          <button className={`mode-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>Text</button>
          <button className={`mode-btn ${mode === 'sound' ? 'active' : ''}`} onClick={() => setMode('sound')}>Sound</button>
        </div>
      </header>

      <main>
        <div className="input-section">
          {mode === 'image' && <WebcamInput onVideoReady={handleVideoReady} />}
          {mode === 'text' && <TextInput />}
          {mode === 'sound' && <AudioInput isListening={isListening} />}

          <div className="controls">
            {classes[mode].map((cls, idx) => (
              <ClassControl
                key={cls.id}
                {...cls}
                color={COLORS[idx % COLORS.length]}
                onTrain={handleTrain}
                onNameChange={handleNameChange}
                onDelete={handleDeleteClass}
              />
            ))}

            <button onClick={addNewClass} className="add-class-btn">+ Add Class</button>
          </div>

          <div className="data-controls">
            {classifierType === 'neuralNetwork' && (
              <button
                onClick={handleTrainModel}
                className="btn action-btn"
                style={{
                  width: '100%',
                  marginBottom: '1rem',
                  backgroundColor: 'var(--color-alt)',
                  fontWeight: 'bold',
                  border: '2px solid var(--color-main)'
                }}
                disabled={isTraining}
              >
                {isTraining ? 'Training...' : 'Train Neural Network'}
              </button>
            )}

            <div className="button-group">
              <button onClick={handleSave} className="btn action-btn">Save Model</button>
              <button onClick={handleClear} className="btn action-btn warning">Clear Data</button>
              <button onClick={handleExport} className="btn action-btn">Export JSON</button>

              <button onClick={() => fileInputRef.current.click()} className="btn action-btn">
                Upload {mode === 'image' ? 'Images' : mode === 'text' ? 'Text File' : 'Audio'}
              </button>
              <input
                type="file"
                multiple
                accept={mode === 'image' ? "image/*" : mode === 'text' ? ".txt" : "audio/*"}
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>

        <div className="visualization-section">
          <h2>Confidence Space ({mode})</h2>
          <EmbeddingVisualizer confidences={currentConfidences} classes={classes[mode]} />

          {prediction !== null && (
            <div className="prediction-display">
              <h3>
                Prediction: {
                  (currentConfidences[prediction] || 0) >= confidenceThreshold
                    ? (classes[mode].find(c => c.id == prediction)?.name || `Class ${prediction}`)
                    : <span style={{ color: 'var(--color-main)', opacity: 0.7, fontStyle: 'italic' }}>Uncertain</span>
                }
              </h3>
              <div className="confidence-bars">
                {Object.entries(currentConfidences).map(([id, score]) => (
                  <div key={id} className="confidence-bar-row" style={{ opacity: score < confidenceThreshold ? 0.5 : 1 }}>
                    <span>{classes[mode].find(c => c.id == id)?.name || `Class ${id}`}</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${score * 100}%`,
                          backgroundColor: score >= confidenceThreshold ? COLORS[id % COLORS.length] : '#ccc'
                        }}
                      />
                      {/* Threshold Marker */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${confidenceThreshold * 100}%`,
                          top: 0,
                          bottom: 0,
                          width: '2px',
                          backgroundColor: 'var(--color-main)',
                          zIndex: 10,
                          opacity: 0.5
                        }}
                      />
                    </div>
                    <span>{(score * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
