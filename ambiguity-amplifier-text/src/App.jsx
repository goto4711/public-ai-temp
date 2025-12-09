import React, { useState, useEffect, useRef } from 'react';
import { modelManager } from './components/ModelManager';
import './App.css';

function App() {
    const [isModelReady, setIsModelReady] = useState(false);
    const [classA, setClassA] = useState('Concept A');
    const [classB, setClassB] = useState('Concept B');
    const [inputTextA, setInputTextA] = useState('');
    const [inputTextB, setInputTextB] = useState('');
    const [exampleCounts, setExampleCounts] = useState({});

    const [testSentence, setTestSentence] = useState('This is a test sentence.');
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [noisySentence, setNoisySentence] = useState('');
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        async function init() {
            await modelManager.loadModel();
            setIsModelReady(true);
        }
        init();
    }, []);

    const addExample = async (text, label) => {
        if (!text.trim()) return;
        await modelManager.addExample(text, label);
        setExampleCounts(modelManager.getExampleCount());
        setInputTextA('');
        setInputTextB('');
    };

    const injectNoise = (text, level) => {
        if (level === 0) return text;
        return text.split('').map(char => {
            if (Math.random() < level * 0.3) { // Max 30% noise
                // 50% chance to swap with neighbor, 50% random char
                if (Math.random() > 0.5) {
                    const chars = "abcdefghijklmnopqrstuvwxyz";
                    return chars[Math.floor(Math.random() * chars.length)];
                } else {
                    return char; // Placeholder for swap logic which is harder in map
                }
            }
            return char;
        }).join('');
    };

    // Better noise: character swaps
    const applyNoise = (text, level) => {
        if (level === 0) return text;
        let chars = text.split('');
        for (let i = 0; i < chars.length; i++) {
            if (Math.random() < level * 0.2) { // 20% chance per char
                const type = Math.random();
                if (type < 0.33) {
                    // Random char
                    const alphabet = "abcdefghijklmnopqrstuvwxyz";
                    chars[i] = alphabet[Math.floor(Math.random() * alphabet.length)];
                } else if (type < 0.66 && i < chars.length - 1) {
                    // Swap with next
                    const temp = chars[i];
                    chars[i] = chars[i + 1];
                    chars[i + 1] = temp;
                    i++; // Skip next
                } else {
                    // Drop char
                    chars[i] = '';
                }
            }
        }
        return chars.join('');
    };

    useEffect(() => {
        const noisy = applyNoise(testSentence, noiseLevel);
        setNoisySentence(noisy);

        const predict = async () => {
            if (isModelReady && (exampleCounts[classA] || 0) > 0 && (exampleCounts[classB] || 0) > 0) {
                const result = await modelManager.predict(noisy);
                if (result && result.confidences) {
                    // Format for viz
                    const preds = Object.entries(result.confidences).map(([label, score]) => ({
                        className: label,
                        probability: score
                    })).sort((a, b) => b.probability - a.probability);
                    setPredictions(preds);
                }
            }
        };
        predict();
    }, [testSentence, noiseLevel, exampleCounts, isModelReady, classA, classB]);

    return (
        <div className="app-container">
            <header>
                <h1>Text Ambiguity Amplifier</h1>
                <p>Explore how semantic noise disrupts machine understanding.</p>
            </header>

            <main>
                <div className="input-section">

                    {/* Training Section */}
                    <div className="control-group" style={{ flexDirection: 'column', gap: '1.5rem' }}>
                        <h3>1. Train Concepts</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-main)', marginBottom: '0.5rem' }}>CONCEPT A</label>
                                <input
                                    className="class-name-input"
                                    value={classA}
                                    onChange={e => setClassA(e.target.value)}
                                    style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}
                                />
                                <p className="example-count">{exampleCounts[classA] || 0} examples</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={inputTextA}
                                        onChange={e => setInputTextA(e.target.value)}
                                        placeholder={`Type text for ${classA}...`}
                                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                        onKeyDown={e => e.key === 'Enter' && addExample(inputTextA, classA)}
                                    />
                                    <button className="action-btn" onClick={() => addExample(inputTextA, classA)}>+</button>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: '1px', background: '#eee' }}></div>

                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-main)', marginBottom: '0.5rem' }}>CONCEPT B</label>
                                <input
                                    className="class-name-input"
                                    value={classB}
                                    onChange={e => setClassB(e.target.value)}
                                    style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}
                                />
                                <p className="example-count">{exampleCounts[classB] || 0} examples</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={inputTextB}
                                        onChange={e => setInputTextB(e.target.value)}
                                        placeholder={`Type text for ${classB}...`}
                                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                        onKeyDown={e => e.key === 'Enter' && addExample(inputTextB, classB)}
                                    />
                                    <button className="action-btn" onClick={() => addExample(inputTextB, classB)}>+</button>
                                </div>
                            </div>
                        </div>
                        <button className="delete-btn" onClick={() => { modelManager.clear(); setExampleCounts({}); }} style={{ marginTop: '1rem', width: '100%' }}>Reset Model</button>
                    </div>

                    {/* Test Section */}
                    <div className="control-group" style={{ flexDirection: 'column', gap: '1rem' }}>
                        <h3>2. Test & Amplify Noise</h3>
                        <textarea
                            className="text-input-area"
                            value={testSentence}
                            onChange={e => setTestSentence(e.target.value)}
                            placeholder="Type a sentence to test..."
                        />

                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <label>Noise Level</label>
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
                        </div>
                    </div>

                </div>

                <div className="visualization-section">
                    <h2>Confidence Spectrum</h2>

                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', border: '2px solid var(--color-main)', borderRadius: '8px', boxShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
                        <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#666', marginBottom: '0.5rem' }}>Noisy Input:</p>
                        <p style={{ fontSize: '1.5rem', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: '1.4' }}>
                            {noisySentence || "..."}
                        </p>
                    </div>


                    {!isModelReady && <div style={{ textAlign: 'center' }}>Loading Universal Sentence Encoder...</div>}

                    {isModelReady && predictions.length === 0 && (
                        <div style={{ textAlign: 'center', opacity: 0.5 }}>Train both concepts to see predictions.</div>
                    )}

                    <div className="confidence-bars">
                        {predictions.map((pred, idx) => (
                            <div key={pred.className} className="ambiguity-bar-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                <div className="ambiguity-label" style={{ width: '100px', fontWeight: 'bold' }}>
                                    {pred.className}
                                </div>
                                <div className="bar-container" style={{ flex: 1, height: '30px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${pred.probability * 100}%`,
                                            height: '100%',
                                            backgroundColor: pred.className === classA ? 'var(--color-main)' : 'var(--color-main-secondary)',
                                            transition: 'width 0.2s'
                                        }}
                                    />
                                </div>
                                <div className="ambiguity-value" style={{ width: '50px', textAlign: 'right' }}>
                                    {(pred.probability * 100).toFixed(1)}%
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
}

export default App;
