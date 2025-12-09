import React, { useState, useEffect, useRef } from 'react';
import { modelManager } from './components/ModelManager';
import './App.css';

function App() {
    const [isModelReady, setIsModelReady] = useState(false);
    const [exampleCount, setExampleCount] = useState(0);
    const [inputText, setInputText] = useState('');

    const [testSentence, setTestSentence] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [threshold, setThreshold] = useState(0.8);
    const [isAnomaly, setIsAnomaly] = useState(false);

    useEffect(() => {
        async function init() {
            await modelManager.loadModel();
            setIsModelReady(true);

            // Initialize with random noise "anomaly" so KNN works
            // Actually for text, we can just add a "gibberish" example as 'anomaly' internally?
            // Or we rely on the fact that if we only have 'normal', KNN might return 100%?
            // KNN with 1 class returns 100%. We need a negative class.
            // Let's add some random strings as 'anomaly'
            // But USE embeddings for random strings might be close to something?
            // Let's add "System Failure Error" as anomaly for now.
            // Actually, let's just use a threshold on distance if possible? 
            // KNN classifier returns confidence. If we only have 'normal', confidence is 1.
            // We need a second class 'anomaly'.
            // Let's add a hidden 'anomaly' class with very different text.
            await modelManager.classifier.addExample(await modelManager.model.embed(['sdfsdf sdfsdf sdfsdf']), 'anomaly');
            await modelManager.classifier.addExample(await modelManager.model.embed(['1234 5678 9012']), 'anomaly');
            await modelManager.classifier.addExample(await modelManager.model.embed(['!@#$% ^&*()']), 'anomaly');
        }
        init();
    }, []);

    const addExample = async () => {
        if (!inputText.trim()) return;
        await modelManager.addExample(inputText);
        setExampleCount(modelManager.getExampleCount());
        setInputText('');
    };

    useEffect(() => {
        const predict = async () => {
            if (isModelReady && exampleCount > 0 && testSentence.trim()) {
                const conf = await modelManager.predict(testSentence);
                setConfidence(conf);
                setIsAnomaly(conf < threshold);
            } else {
                setIsAnomaly(false);
                setConfidence(0);
            }
        };
        predict();
    }, [testSentence, exampleCount, isModelReady, threshold]);

    return (
        <div className="app-container">
            <div className={`glitch-overlay ${isAnomaly ? 'glitch-active' : ''}`}></div>

            <header>
                <h1>Text Glitch Detector</h1>
                <p>Train "Normal". Detect the Abnormal.</p>
            </header>

            <main>
                <div className="input-section">

                    {/* Training Section */}
                    <div className="control-group" style={{ flexDirection: 'column', gap: '1rem' }}>
                        <h3>1. Train "Normal"</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            Teach the system what "Normal" conversation looks like.
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                placeholder="Type normal text (e.g. 'Hello')..."
                                style={{ flex: 1, padding: '0.5rem', border: '2px solid var(--color-main)' }}
                                onKeyDown={e => e.key === 'Enter' && addExample()}
                            />
                            <button className="action-btn" onClick={addExample}>Train</button>
                        </div>
                        <p className="example-count">{exampleCount} normal examples learned</p>

                        <button className="delete-btn" onClick={() => { modelManager.clear(); setExampleCount(0); window.location.reload(); }}>Reset Model</button>
                    </div>

                    {/* Detection Section */}
                    <div className="control-group" style={{ flexDirection: 'column', gap: '1rem' }}>
                        <h3>2. Detect Anomalies</h3>
                        <textarea
                            className="text-input-area"
                            value={testSentence}
                            onChange={e => setTestSentence(e.target.value)}
                            placeholder="Type text to test..."
                        />

                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <label>Sensitivity Threshold</label>
                                <span>{threshold.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="1"
                                step="0.01"
                                value={threshold}
                                onChange={e => setThreshold(parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-main)' }}
                            />
                        </div>
                    </div>

                </div>

                <div className="visualization-section">
                    <h2>System Status</h2>

                    <div className={`status-indicator ${isAnomaly ? 'status-anomaly' : 'status-normal'}`}>
                        {isAnomaly ? "⚠️ ANOMALY DETECTED ⚠️" : "SYSTEM NORMAL"}
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1rem', border: '2px solid var(--color-main)', background: 'white' }}>
                        <p><strong>Match Confidence:</strong> {(confidence * 100).toFixed(1)}%</p>
                        <div style={{ width: '100%', height: '20px', background: '#eee', marginTop: '0.5rem', position: 'relative' }}>
                            {/* Threshold Marker */}
                            <div style={{
                                position: 'absolute',
                                left: `${threshold * 100}%`,
                                top: '-5px',
                                bottom: '-5px',
                                width: '2px',
                                background: 'black',
                                zIndex: 10
                            }} title="Threshold"></div>

                            <div style={{
                                width: `${confidence * 100}%`,
                                height: '100%',
                                background: isAnomaly ? 'red' : 'green',
                                transition: 'all 0.1s'
                            }} />
                        </div>
                        <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
                            If confidence drops below the threshold line, the system glitches.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default App;
