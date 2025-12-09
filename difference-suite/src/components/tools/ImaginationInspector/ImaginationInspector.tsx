import { useState } from 'react';
import { Sparkles, Search, AlertTriangle } from 'lucide-react';
import PromptInput from './components/PromptInput';
import GenerationGrid from './components/GenerationGrid';
import AbsenceReport from './components/AbsenceReport';
import { generateImages } from './utils/GeneratorEngine';
import { analyzeBias } from './utils/BiasAnalyzer';
import ToolLayout from '../../shared/ToolLayout';

const ImaginationInspector = () => {
    const [prompt, setPrompt] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setResults([]);
        setReport(null);

        try {
            const generated = await generateImages(prompt);
            setResults(generated);

            const analysis = analyzeBias(generated);
            setReport(analysis);
        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const mainContent = (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-main flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generative Imagination
                </h2>
                <p className="text-xs text-text-muted">
                    Simulated image generation to probe the boundaries of machine "creativity"
                </p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                {loading && (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center animate-pulse">
                            <Sparkles className="w-16 h-16 mx-auto mb-4 text-main animate-spin" />
                            <p className="text-xl font-mono text-main">Dreaming of "{prompt}"...</p>
                            <p className="text-sm text-gray-400 mt-2">Simulating generative model outputs</p>
                        </div>
                    </div>
                )}

                {!loading && results.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">Enter a prompt to explore machine imagination</p>
                            <p className="text-sm mt-2 opacity-70">What can the model see? What does it miss?</p>
                        </div>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <GenerationGrid results={results} />
                )}
            </div>
        </div>
    );

    const sideContent = (
        <div className="flex flex-col h-full gap-4 p-1">
            {/* Prompt Input */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <PromptInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onGenerate={handleGenerate}
                    loading={loading}
                />
            </div>

            {/* Absence Report */}
            {report && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                    <div className="p-3 border-b border-gray-100 bg-amber-50 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h3 className="text-xs font-bold text-amber-700 uppercase">Absence Report</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <AbsenceReport report={report} />
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-500 space-y-2">
                <p className="font-bold text-gray-600">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 opacity-80">
                    <li>Enter a prompt (e.g., "a doctor")</li>
                    <li>View simulated generative results</li>
                    <li>Read the "Absence Report" for bias analysis</li>
                </ol>
                <div className="mt-3 pt-3 border-t border-gray-200 opacity-60 italic">
                    "To see what the machine cannot imagine."
                </div>
            </div>
        </div>
    );

    return (
        <ToolLayout
            title="Imagination Inspector"
            subtitle="Probing the absences and boundaries of the latent space"
            mainContent={mainContent}
            sideContent={sideContent}
        />
    );
};

export default ImaginationInspector;
