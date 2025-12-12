import { useState, useEffect, useRef } from 'react';
import { Play, RefreshCw, EyeOff, Info, Sliders, Brain } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { NoiseModel } from './components/NoiseModel';
import { ResidualCanvas } from './components/ResidualCanvas';
import { useSuiteStore } from '../../../stores/suiteStore';
import ToolLayout from '../../shared/ToolLayout';

const NoisePredictor = () => {
    const { dataset, activeItem, setActiveItem } = useSuiteStore();
    const imageItems = dataset.filter(i => i.type === 'image');
    const selectedItem = dataset.find(i => i.id === activeItem);

    const [model] = useState(new NoiseModel());
    const [image, setImage] = useState<string | null>(null);
    const [tensor, setTensor] = useState<any>(null);
    const [reconstructed, setReconstructed] = useState<any>(null);
    const [residual, setResidual] = useState<any>(null);
    const [isTraining, setIsTraining] = useState(false);
    const [loss, setLoss] = useState(0);
    const [epoch, setEpoch] = useState(0);
    const [latentDim, setLatentDim] = useState(32);

    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (selectedItem?.type === 'image') {
            setImage(selectedItem.content as string);
            setTensor(null);
            setReconstructed(null);
            setResidual(null);
        }
    }, [selectedItem]);

    useEffect(() => {
        const initTF = async () => {
            await tf.ready();
        };
        initTF();
    }, []);

    const processImage = async () => {
        if (!imgRef.current) return;

        try {
            const t = tf.tidy(() => {
                const tensor = tf.browser.fromPixels(imgRef.current!)
                    .resizeNearestNeighbor([256, 256])
                    .toFloat()
                    .div(255.0)
                    .expandDims();
                return tensor;
            });

            setTensor(t);
            await model.createModel([256, 256, 3], latentDim);
        } catch (error) {
            console.error('Error processing image:', error);
        }
    };

    const trainModel = async () => {
        if (!tensor) return;

        setIsTraining(true);
        setLoss(0);
        setEpoch(0);

        try {
            await model.train(tensor, 50, (e: number, l: number) => {
                setEpoch(e + 1);
                setLoss(l);
            });

            const rec = model.predict(tensor);
            if (rec) {
                setReconstructed(rec);

                const res = tf.tidy(() => {
                    return tf.sub(tensor, rec as tf.Tensor).abs();
                });
                setResidual(res);
            }

        } catch (error) {
            console.error('Training error:', error);
        } finally {
            setIsTraining(false);
        }
    };

    // Empty state handled in main render

    const mainContent = (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-main">Image Decomposition</h2>
                <p className="text-xs text-text-muted">Original → Signal (Reconstructed) → Noise (Residual)</p>
            </div>

            <div className="flex-1 p-6 grid grid-cols-3 gap-4 min-h-0">
                {/* Original */}
                <div className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-100 bg-white">
                        <h3 className="text-xs font-bold text-gray-600 uppercase">Original</h3>
                    </div>
                    <div className="flex-1 p-2 flex items-center justify-center">
                        {image && (
                            <img
                                ref={imgRef}
                                src={image}
                                alt="Original"
                                className="max-w-full max-h-full object-contain rounded border border-gray-300"
                                crossOrigin="anonymous"
                            />
                        )}
                    </div>
                </div>

                {/* Reconstructed */}
                <div className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-100 bg-white">
                        <h3 className="text-xs font-bold text-gray-600 uppercase">Reconstructed (Signal)</h3>
                    </div>
                    <div className="flex-1 p-2 flex items-center justify-center">
                        {reconstructed ? (
                            <ResidualCanvas tensor={reconstructed} width={256} height={256} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs italic">
                                Train model first
                            </div>
                        )}
                    </div>
                </div>

                {/* Residual (Noise) */}
                <div className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-100 bg-white flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-gray-500" />
                        <h3 className="text-xs font-bold text-gray-600 uppercase">Residual (Noise)</h3>
                    </div>
                    <div className="flex-1 p-2 flex items-center justify-center">
                        {residual ? (
                            <ResidualCanvas tensor={residual} width={256} height={256} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs italic">
                                Train model first
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const sideContent = (
        <div className="flex flex-col h-full gap-4 p-1">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
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

            {/* Controls Panel */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Sliders className="w-4 h-4" />
                    Controls
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Latent Dimension</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="8"
                            max="128"
                            step="8"
                            value={latentDim}
                            onChange={(e) => setLatentDim(parseInt(e.target.value))}
                            className="flex-1"
                            disabled={isTraining}
                        />
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded w-10 text-center">{latentDim}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Lower = more compression = more noise visible</p>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={processImage}
                        className="deep-button w-full justify-center text-sm"
                        disabled={isTraining || !image}
                    >
                        <Play className="w-4 h-4" />
                        Process Image
                    </button>
                    <button
                        onClick={trainModel}
                        className="deep-button w-full justify-center text-sm"
                        disabled={isTraining || !tensor}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Train Autoencoder
                    </button>
                </div>
            </div>

            {/* Training Status */}
            {isTraining && (
                <div className="bg-main text-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 animate-pulse" />
                        <span className="font-mono text-sm">Training...</span>
                    </div>
                    <p className="font-mono text-xs mb-2">Epoch {epoch}/50 | Loss: {loss.toFixed(4)}</p>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-400 transition-all"
                            style={{ width: `${(epoch / 50) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-500 space-y-2 flex-1">
                <p className="font-bold text-gray-600">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 opacity-80">
                    <li>Process the image to prepare it</li>
                    <li>Train an autoencoder to compress & reconstruct</li>
                    <li>View "Residual" — what the model couldn't learn</li>
                </ol>
                <div className="mt-3 pt-3 border-t border-gray-200 opacity-60 italic">
                    "The noise is not random; it is the detail the algorithm chose to ignore."
                </div>
            </div>
        </div>
    );

    return (
        <ToolLayout
            title="Noise Predictor"
            subtitle="What the model cannot see: extracting residual noise from autoencoder compression"
            mainContent={mainContent}
            sideContent={sideContent}
        />
    );
};

export default NoisePredictor;
