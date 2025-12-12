import { useState, useEffect } from 'react';
import { vectorManager } from './components/VectorManager';
import VectorHeatmap from './components/VectorHeatmap';
import { useSuiteStore } from '../../../stores/suiteStore';
import { Info, Cpu } from 'lucide-react';
import ToolLayout from '../../shared/ToolLayout';

const DeepVectorMirror = () => {
    const { dataset, activeItem, setActiveItem } = useSuiteStore();
    const imageItems = dataset.filter(i => i.type === 'image');
    const selectedItem = dataset.find(i => i.id === activeItem);

    const [vector, setVector] = useState<number[]>([]);
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [contextLevel, setContextLevel] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load models on mount
    useEffect(() => {
        vectorManager.loadModel('image');
        vectorManager.loadModel('text');
    }, []);

    // Process item when selected or params change
    useEffect(() => {
        if (!selectedItem) return;

        const processItem = async () => {
            setIsProcessing(true);
            try {
                let rawVector: number[] = [];

                if (selectedItem.type === 'image') {
                    const img = new Image();
                    img.src = selectedItem.content as string;
                    await new Promise((resolve) => { img.onload = resolve; });
                    rawVector = await vectorManager.getVector(img, 'image');
                } else if (selectedItem.type === 'text') {
                    rawVector = await vectorManager.getVector(selectedItem.content, 'text');
                }

                if (rawVector.length > 0) {
                    const noisyVector = rawVector.map((v: number) => v + (Math.random() - 0.5) * noiseLevel * 2);
                    const contextVector = noisyVector.map((v: number, i: number) => v + Math.sin(i) * contextLevel);
                    setVector(contextVector);
                }
            } catch (error) {
                console.error("Vectorization failed:", error);
            } finally {
                setIsProcessing(false);
            }
        };

        processItem();
    }, [selectedItem, noiseLevel, contextLevel]);

    const mainContent = (
        <div className="h-full flex flex-col p-6">
            {selectedItem ? (
                <div className="flex-1 flex gap-6 min-h-0">
                    {/* Left: Reality (Input) */}
                    <div className="flex-1 flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-2 border-b border-gray-200 bg-white flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Input (Reality)</span>
                        </div>
                        <div className="flex-1 p-4 flex items-center justify-center overflow-hidden relative">
                            {selectedItem.type === 'image' ? (
                                <img
                                    src={selectedItem.content as string}
                                    alt="Target"
                                    className="max-w-full max-h-full object-contain shadow-sm"
                                />
                            ) : (
                                <div className="prose prose-sm max-w-none p-4 w-full h-full overflow-y-auto bg-white border border-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
                                    {selectedItem.content as string}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Representation (Vector) */}
                    <div className="flex-1 flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative">
                        <div className="px-4 py-2 border-b border-gray-200 bg-white flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Vector (Representation)</span>
                            {isProcessing && <span className="text-xs text-main animate-pulse">Processing...</span>}
                        </div>
                        <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
                            {vector.length > 0 ? (
                                <div className="border border-gray-200 shadow-sm bg-white p-1">
                                    {/* @ts-ignore */}
                                    <VectorHeatmap vector={vector} width={400} height={400} />
                                </div>
                            ) : (
                                <div className="text-center text-text-muted text-xs">
                                    {isProcessing ? 'Calculating...' : 'Waiting for vector...'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-text-muted">Select an item from the dashboard to begin analysis.</p>
                </div>
            )}

            {/* Footer / Description */}
            {selectedItem && (
                <div className="mt-4 text-center">
                    <p className="text-xs text-text-muted max-w-2xl mx-auto">
                        <strong>Left:</strong> The raw input as perceived by humans. <strong>Right:</strong> The internal mathematical representation (embedding) used by the AI. Note how the "Context Shift" alters the representation even if the input image stays the same.
                    </p>
                </div>
            )}
        </div>
    );

    const sideContent = (
        <div className="flex flex-col gap-6 p-1">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm mb-2">
                <label className="text-xs font-bold text-text-muted block mb-2">Select Target Image:</label>
                <select
                    className="deep-input w-full text-xs"
                    value={activeItem || ''}
                    onChange={(e) => setActiveItem(e.target.value)}
                >
                    <option value="" disabled>-- Choose Image --</option>
                    {imageItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                </select>
            </div>

            {/* Controls */}
            <div>
                <label className="text-sm font-bold block mb-2">Noise Injection</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={noiseLevel}
                    onChange={e => setNoiseLevel(parseFloat(e.target.value))}
                    className="dc-slider"
                />
                <div className="flex justify-between mt-1 text-xs text-text-muted">
                    <span>Stable</span>
                    <span>{noiseLevel.toFixed(2)}</span>
                    <span>Chaotic</span>
                </div>
                <p className="text-xs text-text-muted mt-2 leading-relaxed opacity-80">
                    Randomly perturbs vector values to simulate signal degradation or input corruption. Tests how "robust" the AI's understanding is.
                </p>
            </div>

            <div>
                <label className="text-sm font-bold block mb-2">Context Shift</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={contextLevel}
                    onChange={e => setContextLevel(parseFloat(e.target.value))}
                    className="dc-slider"
                />
                <div className="flex justify-between mt-1 text-xs text-text-muted">
                    <span>Neutral</span>
                    <span>{contextLevel.toFixed(2)}</span>
                    <span>Biased</span>
                </div>
                <p className="text-xs text-text-muted mt-2 leading-relaxed opacity-80">
                    Systematically alters the vector space (sine wave addition). Simulates changing the semantic context or background. Tests if the meaning holds.
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-main" />
                    <span className="text-sm font-bold">Vector Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                        <span className="block text-text-muted">Dimensions</span>
                        <span className="font-bold">{vector.length || '-'}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                        <span className="block text-text-muted">Sparsity</span>
                        <span className="font-bold">
                            {vector.length > 0 ? (vector.filter(v => Math.abs(v) < 0.01).length / vector.length * 100).toFixed(0) : '-'}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold">Visualization Legend</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                        <span className="text-text-muted">High Positive Activation (Red)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-black rounded-sm border border-gray-600"></div>
                        <span className="text-text-muted">Neutral / Near Zero (Black)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                        <span className="text-text-muted">High Negative Activation (Blue)</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ToolLayout
            title="Deep Vector Mirror"
            subtitle="Explore the stability of AI representations"
            mainContent={mainContent}
            sideContent={sideContent}
        />
    );
};

export default DeepVectorMirror;
