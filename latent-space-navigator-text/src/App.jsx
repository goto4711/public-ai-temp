import React, { useState, useEffect } from 'react';
import { modelManager } from './components/ModelManager';
import './App.css';

function App() {
    const [isModelReady, setIsModelReady] = useState(false);
    const [conceptA, setConceptA] = useState('King');
    const [conceptB, setConceptB] = useState('Woman');
    const [interpolation, setInterpolation] = useState(0.5);
    const [result, setResult] = useState(null);
    const [isComputing, setIsComputing] = useState(false);

    useEffect(() => {
        async function init() {
            await modelManager.loadModel();
            setIsModelReady(true);
        }
        init();
    }, []);

    useEffect(() => {
        const compute = async () => {
            if (isModelReady && conceptA && conceptB) {
                setIsComputing(true);
                const res = await modelManager.interpolate(conceptA, conceptB, interpolation);
                setResult(res);
                setIsComputing(false);
            }
        };
        // Debounce slightly to avoid too many calls while sliding
        const timeoutId = setTimeout(compute, 100);
        return () => clearTimeout(timeoutId);
    }, [conceptA, conceptB, interpolation, isModelReady]);

    return (
        <div className="app-container">
            <header>
                <h1>Latent Space Navigator</h1>
                <p>Traverse the semantic space between words.</p>
            </header>

            <main>
                {!isModelReady ? (
                    <div className="loading-screen">
                        <h2>Loading Dictionary Embeddings...</h2>
                        <p>This may take a few seconds.</p>
                    </div>
                ) : (
                    <div className="navigator-interface">

                        <div className="concepts-row">
                            <div className="concept-input">
                                <label>Start Concept</label>
                                <input
                                    type="text"
                                    value={conceptA}
                                    onChange={e => setConceptA(e.target.value)}
                                    className="big-input"
                                />
                            </div>

                            <div className="concept-input" style={{ textAlign: 'right' }}>
                                <label>End Concept</label>
                                <input
                                    type="text"
                                    value={conceptB}
                                    onChange={e => setConceptB(e.target.value)}
                                    className="big-input"
                                    style={{ textAlign: 'right' }}
                                />
                            </div>
                        </div>

                        <div className="slider-container">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={interpolation}
                                onChange={e => setInterpolation(parseFloat(e.target.value))}
                                className="latent-slider"
                            />
                            <div className="slider-labels">
                                <span>{conceptA}</span>
                                <span>{(interpolation * 100).toFixed(0)}%</span>
                                <span>{conceptB}</span>
                            </div>
                        </div>

                        <div className="result-display">
                            <h3>Nearest Semantic Neighbor</h3>
                            {isComputing ? (
                                <div className="result-word" style={{ opacity: 0.5 }}>Computing...</div>
                            ) : (
                                <div className="result-word">
                                    {result && result[0] ? result[0].word : "..."}
                                </div>
                            )}

                            <div className="alternatives">
                                <p>Alternatives:</p>
                                <div className="alt-list">
                                    {result && result.slice(1).map((r, i) => (
                                        <span key={i} className="alt-word">
                                            {r.word} <span className="score">({r.score.toFixed(2)})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
