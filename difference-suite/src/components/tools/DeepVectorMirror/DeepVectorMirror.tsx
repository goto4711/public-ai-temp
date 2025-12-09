import { useState, useEffect } from 'react';
import { vectorManager } from './components/VectorManager';
import VectorHeatmap from './components/VectorHeatmap';
import { useSuiteStore } from '../../../stores/suiteStore';
import { Info, Cpu } from 'lucide-react';
import ToolLayout from '../../shared/ToolLayout';

const DeepVectorMirror = () => {
    const { dataset, activeItem } = useSuiteStore();
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
        <div className="h-full flex items-center justify-center relative p-6">
            {selectedItem ? (
                <div className="flex flex-col items-center gap-4">
                    {isProcessing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-main font-bold animate-pulse">
                            Processing Vector...
                        </div>
                    )}

                    {vector.length > 0 ? (
                        <div className="border border-gray-200 shadow-sm">
                            {/* @ts-ignore */}
                            <VectorHeatmap vector={vector} width={400} height={400} />
                        </div>
                    ) : (
                        <div className="w-[400px] h-[400px] bg-gray-50 flex items-center justify-center text-text-muted border-2 border-dashed border-gray-200 rounded-lg">
                            Waiting for vectorization...
                        </div>
                    )}
                    <p className="text-xs text-text-muted text-center max-w-md">
                        Visualization of the high-dimensional vector space. Each cell represents a neuron activation or embedding dimension.
                    </p>
                </div>
            ) : (
                <div className="text-center">
                    <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-text-muted">Select an item from the dashboard to begin analysis.</p>
                </div>
            )}
        </div>
    );

    const sideContent = (
        <div className="flex flex-col gap-6 p-1">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                <h4 className="text-xs font-bold text-secondary uppercase mb-1">Active Target</h4>
                {selectedItem ? (
                    <div>
                        <div className="font-semibold text-sm truncate mb-0.5">{selectedItem.name}</div>
                        <div className="text-xs text-text-muted uppercase">{selectedItem.type} Input</div>
                    </div>
                ) : (
                    <div className="text-sm text-text-muted italic">No item selected</div>
                )}
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
