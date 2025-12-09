import { useState, useEffect, useRef } from 'react';
import { modelManager } from '../AmbiguityAmplifier/components/ModelManager';
import { useSuiteStore } from '../../../stores/suiteStore';
import * as tf from '@tensorflow/tfjs';
import { Info, Layers, Sparkles } from 'lucide-react';
import ToolLayout from '../../shared/ToolLayout';

// Abstract concepts that appear when the AI is confused
const HIDDEN_CONCEPTS = [
    "The Void", "Digital Noise", "Hybrid Entity", "Cultural Glitch",
    "Uncertainty", "The In-Between", "Ghost in the Machine", "Undefined"
];

const LatentSpaceNavigator = () => {
    const { dataset } = useSuiteStore();
    const imageItems = dataset.filter(item => item.type === 'image');

    const [imageA, setImageA] = useState<tf.Tensor3D | null>(null);
    const [imageB, setImageB] = useState<tf.Tensor3D | null>(null);
    const [selectedIdA, setSelectedIdA] = useState<string | null>(null);
    const [selectedIdB, setSelectedIdB] = useState<string | null>(null);
    const [sliderValue, setSliderValue] = useState(0.5);
    const [prediction, setPrediction] = useState<any[]>([]);
    const [hiddenConcept, setHiddenConcept] = useState<string | null>(null);
    const [isModelReady, setIsModelReady] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load model
    useEffect(() => {
        async function init() {
            await modelManager.loadModel();
            setIsModelReady(true);
        }
        init();
    }, []);

    // Load image from dataset item
    const loadImageFromItem = (itemId: string, target: 'A' | 'B') => {
        const item = dataset.find(i => i.id === itemId);
        if (!item || item.type !== 'image') return;

        const img = new Image();
        img.src = item.content as string;
        img.onload = () => {
            const tensor = tf.browser.fromPixels(img).resizeBilinear([224, 224]) as tf.Tensor3D;

            if (target === 'A') {
                if (imageA) imageA.dispose();
                setImageA(tensor);
                setSelectedIdA(itemId);
            } else {
                if (imageB) imageB.dispose();
                setImageB(tensor);
                setSelectedIdB(itemId);
            }
        };
    };

    // Blending Loop
    useEffect(() => {
        if (!imageA || !imageB || !canvasRef.current || !isModelReady) return;

        const blendAndPredict = async () => {
            const blendedTensor = tf.tidy(() => {
                const t = sliderValue;
                return tf.add(
                    imageA.mul(1 - t),
                    imageB.mul(t)
                ) as tf.Tensor3D;
            });

            // Display on canvas
            const resized = tf.tidy(() =>
                blendedTensor.resizeBilinear([224, 224]).clipByValue(0, 255).cast('int32') as tf.Tensor3D
            );
            await tf.browser.toPixels(resized, canvasRef.current!);

            // Predict
            const results = await modelManager.predict(resized) as any;

            if (results && Array.isArray(results) && results[0]) {
                const topConf = results[0].probability;
                if (topConf < 0.3) {
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

    const mainContent = (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-100 rounded-lg">
            {!imageA || !imageB ? (
                <div className="text-center">
                    <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-text-muted max-w-sm">
                        Select two distinct concepts (images) from the sidebar to begin navigating the latent space between them.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                    <div className="relative p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                        <canvas
                            ref={canvasRef}
                            width="224"
                            height="224"
                            className="bg-gray-100 rounded"
                            style={{ width: '350px', height: '350px', imageRendering: 'auto' }}
                        />
                        {hiddenConcept && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded backdrop-blur-sm">
                                <div className="bg-white/90 p-3 rounded shadow-lg text-center transform scale-110">
                                    <Sparkles className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-text-muted">New Concept Discovered</p>
                                    <p className="text-lg font-black text-purple-700">{hiddenConcept}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        {prediction.length > 0 && !hiddenConcept && (
                            <div className="transition-all">
                                <h3 className="text-lg font-bold text-main">{prediction[0].className.split(',')[0]}</h3>
                                <p className="text-sm text-text-muted">Confidence: {(prediction[0].probability * 100).toFixed(1)}%</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const sideContent = (
        <div className="flex flex-col h-full gap-4 p-1">

            {/* Slider Control */}
            <div className="bg-white p-3 rounded border border-gray-200 shadow-sm z-10 sticky top-0">
                <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Interpolation Control</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sliderValue}
                    onChange={e => setSliderValue(parseFloat(e.target.value))}
                    className="dc-slider mb-1"
                    disabled={!imageA || !imageB}
                />
                <div className="flex justify-between text-xs font-bold text-text-muted">
                    <span className={sliderValue < 0.5 ? 'text-main' : ''}>Concept A</span>
                    <span className="font-mono opacity-50">{(sliderValue * 100).toFixed(0)}%</span>
                    <span className={sliderValue > 0.5 ? 'text-main' : ''}>Concept B</span>
                </div>
            </div>

            {/* Selectors */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">

                {/* Concept A List */}
                <div className="flex-1 overflow-y-auto min-h-0 border border-gray-100 rounded bg-gray-50/50 p-2">
                    <h4 className="text-xs font-bold text-main mb-2 sticky top-0 bg-gray-50/95 py-1 z-10 border-b border-gray-200">Concept A Source</h4>
                    <div className="space-y-1">
                        {imageItems.map(item => (
                            <div
                                key={`A-${item.id}`}
                                onClick={() => loadImageFromItem(item.id, 'A')}
                                className={`cursor-pointer p-2 rounded text-xs flex items-center gap-2 border transition-all
                                    ${selectedIdA === item.id ? 'bg-white border-main shadow-sm' : 'border-transparent hover:bg-white hover:border-gray-200'}
                                `}
                            >
                                <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden shrink-0">
                                    <img src={item.content as string} className="w-full h-full object-cover" />
                                </div>
                                <span className="truncate">{item.name}</span>
                            </div>
                        ))}
                        {imageItems.length === 0 && <div className="text-xs text-text-muted italic p-2">No images available.</div>}
                    </div>
                </div>

                {/* Concept B List */}
                <div className="flex-1 overflow-y-auto min-h-0 border border-gray-100 rounded bg-gray-50/50 p-2">
                    <h4 className="text-xs font-bold text-secondary mb-2 sticky top-0 bg-gray-50/95 py-1 z-10 border-b border-gray-200">Concept B Source</h4>
                    <div className="space-y-1">
                        {imageItems.map(item => (
                            <div
                                key={`B-${item.id}`}
                                onClick={() => loadImageFromItem(item.id, 'B')}
                                className={`cursor-pointer p-2 rounded text-xs flex items-center gap-2 border transition-all
                                    ${selectedIdB === item.id ? 'bg-white border-secondary shadow-sm' : 'border-transparent hover:bg-white hover:border-gray-200'}
                                `}
                            >
                                <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden shrink-0">
                                    <img src={item.content as string} className="w-full h-full object-cover" />
                                </div>
                                <span className="truncate">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );

    return (
        <ToolLayout
            title="Latent Space Navigator"
            subtitle="Interpolate between distinct visual concepts"
            mainContent={mainContent}
            sideContent={sideContent}
        />
    );
};

export default LatentSpaceNavigator;
