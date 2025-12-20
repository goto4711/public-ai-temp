import { useState, useEffect, useRef, useMemo } from 'react';
import { modelManager } from '../AmbiguityAmplifier/components/ModelManager';
import { latentTextManager } from './components/LatentTextModelManager';
import { useSuiteStore } from '../../../stores/suiteStore';
import * as tf from '@tensorflow/tfjs';
import { Info, Layers, Sparkles, Image as ImageIcon, Type, ArrowRight, BrainCircuit, Wand2 } from 'lucide-react';
import ToolLayout from '../../shared/ToolLayout';
import { extractSemanticKeywords } from '../ContextWeaver/utils/ContextProcessor';

type NavMode = 'image' | 'text';

// Abstract concepts that appear when the AI is confused
const HIDDEN_CONCEPTS = [
    "The Void", "Digital Noise", "Hybrid Entity", "Cultural Glitch",
    "Uncertainty", "The In-Between", "Ghost in the Machine", "Undefined"
];

const LatentSpaceNavigator = () => {
    const { dataset, activeItem, setActiveItem } = useSuiteStore();
    const [mode, setMode] = useState<NavMode>('image');

    // Image State
    const imageItems = useMemo(() => dataset.filter(item => item.type === 'image'), [dataset]);
    const [imageA, setImageA] = useState<tf.Tensor3D | null>(null);
    const [imageB, setImageB] = useState<tf.Tensor3D | null>(null);
    const [selectedIdA, setSelectedIdA] = useState<string | null>(null);
    const [selectedIdB, setSelectedIdB] = useState<string | null>(null);
    const [imagePrediction, setImagePrediction] = useState<any[]>([]);
    const [hiddenConcept, setHiddenConcept] = useState<string | null>(null);

    // Text State
    const textItems = useMemo(() => dataset.filter(item => item.type === 'text'), [dataset]);
    const [conceptA, setConceptA] = useState('King');
    const [conceptB, setConceptB] = useState('Woman');
    const [textResults, setTextResults] = useState<any[]>([]);

    // Shared State
    const [sliderValue, setSliderValue] = useState(0.5);
    const [isModelReady, setIsModelReady] = useState(false);
    const [isComputing, setIsComputing] = useState(false);

    const [isSummarizing, setIsSummarizing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initial load and Dictionary Extension
    useEffect(() => {
        async function init() {
            await Promise.all([
                modelManager.loadModel(),
                latentTextManager.loadModel()
            ]);
            setIsModelReady(true);
        }
        init();

        // Cleanup tensors on unmount
        return () => {
            if (imageA) imageA.dispose();
            if (imageB) imageB.dispose();
        }
    }, []);

    // Effect to extend dictionary with keywords from text items
    useEffect(() => {
        if (!isModelReady || textItems.length === 0) return;

        const extendDict = async () => {
            console.log("Latent Navigator: Extracting keywords from dataset to extend latent space...");
            const allKeywords = new Set<string>();

            for (const item of textItems) {
                const keywords = await extractSemanticKeywords(item.content as string, 20);
                keywords.forEach((k: string) => allKeywords.add(k));
            }

            if (allKeywords.size > 0) {
                await latentTextManager.extendDictionary(Array.from(allKeywords));
            }
        };

        extendDict();
    }, [textItems, isModelReady]);

    // Load text from dataset item and summarize
    const handleQuickSelectText = async (itemId: string, target: 'A' | 'B') => {
        const item = dataset.find(i => i.id === itemId);
        if (!item || item.type !== 'text') return;

        setIsSummarizing(true);
        try {
            const keywords = await extractSemanticKeywords(item.content as string, 5);
            const summary = keywords.join(" ");
            if (target === 'A') setConceptA(summary);
            else setConceptB(summary);
        } catch (err) {
            console.error("Failed to summarize text", err);
            // Fallback to substring
            const fallback = String(item.content).substring(0, 30);
            if (target === 'A') setConceptA(fallback);
            else setConceptB(fallback);
        } finally {
            setIsSummarizing(false);
        }
    };

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

    // Image Interpolation Loop
    useEffect(() => {
        if (mode !== 'image' || !imageA || !imageB || !canvasRef.current || !isModelReady) return;

        const blendAndPredict = async () => {
            setIsComputing(true);
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
                setImagePrediction(results);
            }

            blendedTensor.dispose();
            resized.dispose();
            setIsComputing(false);
        };

        blendAndPredict();
    }, [imageA, imageB, sliderValue, isModelReady, mode]);

    // Text Interpolation Loop
    useEffect(() => {
        if (mode !== 'text' || !isModelReady || !conceptA || !conceptB) return;

        const computeText = async () => {
            setIsComputing(true);
            const results = await latentTextManager.interpolate(conceptA, conceptB, sliderValue);
            if (results) setTextResults(results);
            setIsComputing(false);
        };

        const timeoutId = setTimeout(computeText, 150);
        return () => clearTimeout(timeoutId);
    }, [conceptA, conceptB, sliderValue, isModelReady, mode]);

    const mainContent = (
        <div className="h-full flex flex-col">
            {/* Mode Toggle */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Navigation Space:</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                    <button
                        onClick={() => setMode('image')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${mode === 'image'
                            ? 'bg-[var(--color-main)] text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <ImageIcon size={16} />
                        Visual
                    </button>
                    <button
                        onClick={() => setMode('text')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${mode === 'text'
                            ? 'bg-[var(--color-main)] text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Type size={16} />
                        Semantic
                    </button>
                </div>
                {isComputing && <span className="text-xs text-main animate-pulse ml-auto font-bold uppercase">Synthesizing...</span>}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/30 overflow-hidden relative">
                {mode === 'image' ? (
                    // IMAGE MODE DISPLAY
                    !imageA || !imageB ? (
                        <div className="text-center p-12 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-text-muted max-w-sm text-sm">
                                Select two distinct visual concepts from the sidebar to begin navigating the latent space between them.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500 w-full max-w-xl">
                            <div className="relative p-2 bg-white rounded-2xl shadow-xl border border-gray-200 group">
                                <canvas
                                    ref={canvasRef}
                                    width="224"
                                    height="224"
                                    className="bg-gray-100 rounded-xl"
                                    style={{ width: '380px', height: '380px', imageRendering: 'auto' }}
                                />
                                {hiddenConcept && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-md transition-all">
                                        <div className="bg-white/95 p-6 rounded-2xl shadow-2xl text-center transform scale-110 border border-purple-200">
                                            <Sparkles className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-1">Emergent Concept</p>
                                            <p className="text-2xl font-black text-purple-800 tracking-tight">{hiddenConcept}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-center bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
                                {imagePrediction.length > 0 && !hiddenConcept && (
                                    <div className="transition-all">
                                        <h3 className="text-xl font-black text-main tracking-tight uppercase">
                                            {imagePrediction[0].className.split(',')[0]}
                                        </h3>
                                        <div className="flex items-center gap-2 justify-center">
                                            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-main transition-all duration-300"
                                                    style={{ width: `${imagePrediction[0].probability * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] font-bold text-text-muted">{(imagePrediction[0].probability * 100).toFixed(0)}% SYNTHESIS</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    // TEXT MODE DISPLAY
                    <div className="w-full h-full flex flex-col items-center justify-center max-w-3xl">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-10 w-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <BrainCircuit size={120} />
                            </div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-8">Interpolated Semantic Meaning</div>

                                <div className="text-6xl font-black text-main tracking-tighter mb-4 animate-in slide-in-from-bottom-4">
                                    {textResults[0]?.word || "..."}
                                </div>

                                <div className="w-full max-w-xs h-1 bg-gray-100 rounded-full mb-10 overflow-hidden">
                                    <div
                                        className="h-full bg-main transition-all duration-500"
                                        style={{ width: `${(textResults[0]?.score || 0) * 100}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full pt-8 border-t border-gray-50">
                                    <div className="text-left">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-3">Semantic Shift</span>
                                        <div className="flex flex-wrap gap-2">
                                            {textResults.slice(1, 4).map((r, i) => (
                                                <div key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600 flex items-center gap-2">
                                                    <span>{r.word}</span>
                                                    <span className="text-[9px] opacity-40">{(r.score * 100).toFixed(0)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-3">Target Influence</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold truncate max-w-[80px]">{conceptA}</span>
                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-main transition-all" style={{ width: `${(1 - sliderValue) * 100}%` }} />
                                            </div>
                                            <ArrowRight size={12} className="text-gray-300" />
                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-secondary transition-all" style={{ width: `${sliderValue * 100}%` }} />
                                            </div>
                                            <span className="text-xs font-bold truncate max-w-[80px]">{conceptB}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const sideContent = (
        <div className="flex flex-col h-full gap-4 p-1">
            {/* Slider Control */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm z-10 sticky top-0">
                <label className="text-[10px] font-bold text-text-muted uppercase mb-3 block tracking-wider">Latent Space Position</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sliderValue}
                    onChange={e => setSliderValue(parseFloat(e.target.value))}
                    className="dc-slider mb-2"
                    disabled={mode === 'image' && (!imageA || !imageB)}
                />
                <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter">
                    <span className={sliderValue < 0.5 ? 'text-main' : 'text-gray-400'}>Alpha</span>
                    <span className="font-mono text-gray-300">{(sliderValue * 100).toFixed(0)}%</span>
                    <span className={sliderValue > 0.5 ? 'text-secondary' : 'text-gray-400'}>Beta</span>
                </div>
            </div>

            {/* Selectors Area */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
                {mode === 'image' ? (
                    // IMAGE SELECTOR LISTS
                    <>
                        <div className="flex-1 overflow-y-auto min-h-0 border border-gray-100 rounded-xl bg-gray-50/50 p-2">
                            <h4 className="text-[10px] font-bold text-main mb-2 sticky top-0 bg-gray-50/95 py-2 px-1 z-10 border-b border-gray-200 uppercase tracking-widest">Target A (Source)</h4>
                            <div className="space-y-1">
                                {imageItems.map(item => (
                                    <div
                                        key={`A-${item.id}`}
                                        onClick={() => loadImageFromItem(item.id, 'A')}
                                        className={`cursor-pointer p-2 rounded-lg text-xs flex items-center gap-2 border transition-all
                                            ${selectedIdA === item.id ? 'bg-white border-main shadow-sm' : 'border-transparent hover:bg-white hover:border-gray-200'}
                                        `}
                                    >
                                        <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                                            <img src={item.content as string} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="truncate font-medium">{item.name}</span>
                                    </div>
                                ))}
                                {imageItems.length === 0 && <div className="text-[10px] text-text-muted italic p-4 text-center">No images found in dashboard.</div>}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0 border border-gray-100 rounded-xl bg-gray-50/50 p-2">
                            <h4 className="text-[10px] font-bold text-secondary mb-2 sticky top-0 bg-gray-50/95 py-2 px-1 z-10 border-b border-gray-200 uppercase tracking-widest">Target B (End)</h4>
                            <div className="space-y-1">
                                {imageItems.map(item => (
                                    <div
                                        key={`B-${item.id}`}
                                        onClick={() => loadImageFromItem(item.id, 'B')}
                                        className={`cursor-pointer p-2 rounded-lg text-xs flex items-center gap-2 border transition-all
                                            ${selectedIdB === item.id ? 'bg-white border-secondary shadow-sm' : 'border-transparent hover:bg-white hover:border-gray-200'}
                                        `}
                                    >
                                        <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                                            <img src={item.content as string} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="truncate font-medium">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    // TEXT SELECTOR AREA
                    <div className="flex-1 flex flex-col gap-6 p-1">
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <label className="text-[10px] font-bold text-main uppercase mb-2 block tracking-wider">Concept A</label>
                                <input
                                    type="text"
                                    value={conceptA}
                                    onChange={e => setConceptA(e.target.value)}
                                    className="deep-input w-full text-sm font-bold h-12"
                                    placeholder="Enter word..."
                                />
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block">Quick Select (Text Items)</label>
                                    <select
                                        className="w-full text-[11px] p-2 bg-gray-50 border-none rounded-lg"
                                        onChange={(e) => handleQuickSelectText(e.target.value, 'A')}
                                        value=""
                                        disabled={isSummarizing}
                                    >
                                        <option value="" disabled>{isSummarizing ? "Summarizing..." : "-- Load from Text Item --"}</option>
                                        {textItems.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <label className="text-[10px] font-bold text-secondary uppercase mb-2 block tracking-wider">Concept B</label>
                                <input
                                    type="text"
                                    value={conceptB}
                                    onChange={e => setConceptB(e.target.value)}
                                    className="deep-input w-full text-sm font-bold h-12"
                                    placeholder="Enter word..."
                                />
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block">Quick Select (Text Items)</label>
                                    <select
                                        className="w-full text-[11px] p-2 bg-gray-50 border-none rounded-lg"
                                        onChange={(e) => handleQuickSelectText(e.target.value, 'B')}
                                        value=""
                                        disabled={isSummarizing}
                                    >
                                        <option value="" disabled>{isSummarizing ? "Summarizing..." : "-- Load from Text Item --"}</option>
                                        {textItems.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 bg-purple-50 rounded-2xl border border-purple-100">
                            <p className="text-[10px] text-purple-700 leading-relaxed font-medium">
                                <strong>Tip:</strong> Try concepts like "King" and "Woman" to see how the model navigates towards "Queen".
                                Semantic interpolation discovers relationships in multi-dimensional space.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <ToolLayout
            title="Latent Space Navigator"
            subtitle="Navigate the multi-dimensional vectors of AI meaning"
            mainContent={mainContent}
            sideContent={sideContent}
        />
    );
};

export default LatentSpaceNavigator;
