import { useState, useEffect } from 'react';
import { modelManager } from './components/GlitchModelManager';
import { useSuiteStore } from '../../../stores/suiteStore';
import * as tf from '@tensorflow/tfjs';
import { AlertTriangle, Info, Target, Trash2, Activity, Shield } from 'lucide-react';
import ToolLayout from '../../shared/ToolLayout';

const GlitchDetector = () => {
    const { dataset, activeItem } = useSuiteStore();
    const selectedItem = dataset.find(i => i.id === activeItem);

    const [isModelReady, setIsModelReady] = useState(false);
    const [exampleCount, setExampleCount] = useState(0);
    const [isAnomaly, setIsAnomaly] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const [threshold, setThreshold] = useState(0.8);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        async function init() {
            await modelManager.loadModel();
            setIsModelReady(true);
        }
        init();
    }, []);

    const trainOnImage = () => {
        if (!selectedItem || selectedItem.type !== 'image' || !isModelReady) return;

        setIsProcessing(true);
        const img = new Image();
        img.src = selectedItem.content as string;
        img.onload = () => {
            const tensor = tf.browser.fromPixels(img);
            modelManager.addExample(tensor);
            tensor.dispose();
            setExampleCount(modelManager.getExampleCount());
            setIsProcessing(false);
        };
    };

    const resetModel = () => {
        modelManager.clear();
        setExampleCount(0);
        setIsAnomaly(false);
        setConfidence(0);
    };

    useEffect(() => {
        if (!selectedItem || selectedItem.type !== 'image' || !isModelReady || exampleCount === 0) {
            return;
        }

        const detect = async () => {
            setIsProcessing(true);
            try {
                const img = new Image();
                img.src = selectedItem.content as string;
                await new Promise((resolve) => { img.onload = resolve; });

                const tensor = tf.browser.fromPixels(img);
                const result = await modelManager.predict(tensor);
                tensor.dispose();

                if (result) {
                    const normConf = result.confidences['normal'] || 0;
                    setConfidence(normConf);
                    setIsAnomaly(normConf < threshold);
                }
            } catch (error) {
                console.error("Detection failed:", error);
            } finally {
                setIsProcessing(false);
            }
        };

        detect();
    }, [selectedItem, threshold, exampleCount, isModelReady]);

    const mainContent = (
        <div className={`h-full flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-lg overflow-hidden relative transition-colors duration-500 ${isAnomaly ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}>
            {isAnomaly && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-lg z-20 animate-bounce flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-white" />
                    ANOMALY DETECTED
                </div>
            )}

            {selectedItem && selectedItem.type === 'image' ? (
                <img
                    src={selectedItem.content as string}
                    alt="Analysis Target"
                    className={`max-h-full max-w-full object-contain ${isAnomaly ? 'sepia contrast-125' : ''} transition-all duration-1000`}
                />
            ) : (
                <div className="text-center p-8">
                    <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-text-muted">Select a baseline image to build the normality model.</p>
                </div>
            )}
        </div>
    );

    const sideContent = (
        <div className="flex flex-col gap-6 p-1">

            {/* Model Controls */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-main" />
                    Training Mode
                </h4>

                <p className="text-xs text-text-muted mb-4">
                    1. Select "Normal" images.<br />
                    2. Click "Add to Model" to teach the AI what is normal.<br />
                    3. Then select new images to test for glitches.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={trainOnImage}
                        disabled={!isModelReady || isProcessing || !selectedItem || selectedItem.type !== 'image'}
                        className="btn-primary w-full justify-center"
                    >
                        Add to Model ({exampleCount})
                    </button>

                    <button
                        onClick={resetModel}
                        className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-3 h-3" />
                        Reset Model
                    </button>
                </div>
            </div>

            {/* Threshold */}
            <div>
                <label className="text-sm font-bold block mb-2">Sensitivity Threshold</label>
                <input
                    type="range" min="0.5" max="1" step="0.01"
                    value={threshold}
                    onChange={e => setThreshold(parseFloat(e.target.value))}
                    className="dc-slider"
                />
                <div className="flex justify-between mt-1 text-xs text-text-muted">
                    <span>Lenient</span>
                    <span className="text-main font-bold">{threshold.toFixed(2)}</span>
                    <span>Strict</span>
                </div>
            </div>

            {/* Status */}
            <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-bold">Detection Status</span>
                </div>

                <div className="bg-white border border-gray-200 rounded p-3 text-sm">
                    <div className="flex justify-between mb-1">
                        <span className="text-text-muted">Normality Score</span>
                        <span className={`font-bold ${confidence < threshold ? 'text-red-500' : 'text-green-600'}`}>
                            {(confidence * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${confidence < threshold ? 'bg-red-500' : 'bg-green-500'} transition-all duration-300`}
                            style={{ width: `${confidence * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ToolLayout
            title="Glitch Detector"
            subtitle="Identify visual anomalies and disruptions"
            mainContent={mainContent}
            sideContent={sideContent}
        />
    );
};

export default GlitchDetector;
