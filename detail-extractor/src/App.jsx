import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import ClusterViz from './components/ClusterViz';
import DetailView from './components/DetailView';
import { processTextData, loadModels } from './utils/DataProcessor';

// Default demo data
const DEMO_TEXTS = [
    "The Jewish Council in Warsaw attempted to organize underground education despite the ban.",
    "Emanuel Ringelblum and his team hid the Oyneg Shabbos archive in milk cans to preserve history.",
    "Couriers like Vladka Meed smuggled weapons and dynamite into the ghetto for the resistance.",
    "The ZOB launched an armed uprising in April 1943, surprising the German forces.",
    "Partisans in the forests of Belarus disrupted supply lines and rescued escapees.",
    "Individual acts of sabotage were common in forced labor camps, though often undocumented.",
    "Diaries were kept in secret to document the daily atrocities and preserve the memory of victims.",
    "Underground newspapers circulated news from the front to boost morale among the imprisoned.",
    "The quick brown fox jumps over the lazy dog.", // Outlier: Generic text
    "Quantum mechanics describes the behavior of particles at the subatomic level.", // Outlier: Scientific text
    "Resistance was not just armed; it included spiritual and cultural defiance.",
    "Smugglers risked their lives to bring food into the sealed districts.",
    "The Oneg Shabbat group worked in secret to create a comprehensive record of life under occupation."
];

function App() {
    const [data, setData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Ready");

    useEffect(() => {
        // Load initial demo data
        handleProcess(DEMO_TEXTS);
    }, []);

    const handleProcess = async (texts) => {
        setLoading(true);
        setStatus("Loading Models...");
        try {
            await loadModels();
            setStatus("Processing Embeddings...");
            const { data: processed } = await processTextData(texts);
            setData(processed);
            setStatus("Ready");
        } catch (error) {
            console.error(error);
            setStatus("Error processing data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            // Split by newlines and filter empty
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            handleProcess(lines);
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen p-8 flex flex-col gap-8">
            <header className="flex justify-between items-center border-b-4 border-[var(--color-main)] pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--color-main)] uppercase tracking-tighter">The Detail Extractor</h1>
                </div>

                <div className="flex gap-4">
                    <label className="flex items-center gap-2 bg-[var(--color-main)] text-white px-4 py-2 font-bold uppercase cursor-pointer hover:opacity-90 transition-opacity shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                        <Upload size={20} />
                        Upload Text (CSV/TXT)
                        <input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button
                        onClick={() => handleProcess(DEMO_TEXTS)}
                        className="flex items-center gap-2 bg-white border-2 border-[var(--color-main)] text-[var(--color-main)] px-4 py-2 font-bold uppercase hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                    >
                        <RefreshCw size={20} />
                        Reset Demo
                    </button>
                </div>
            </header>

            {loading && (
                <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center flex-col gap-4">
                    <div className="w-16 h-16 border-4 border-[var(--color-main)] border-t-[var(--color-alt)] rounded-full animate-spin"></div>
                    <p className="font-mono text-xl text-[var(--color-main)] animate-pulse">{status}</p>
                </div>
            )}

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-[600px]">

                {/* Left: Visualization */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <h2 className="text-xl font-bold text-[var(--color-main)] uppercase">Latent Space Projection</h2>
                        <div className="text-sm font-mono opacity-60">
                            {data.length} items clustered
                        </div>
                    </div>
                    <ClusterViz
                        data={data}
                        onSelect={setSelectedItem}
                        selectedId={selectedItem?.id}
                    />
                    <p className="text-sm text-center opacity-60 max-w-2xl mx-auto">
                        Visualizing the semantic distance between items. Items closer together share similar meanings.
                        Outliers (far from clusters) represent unique details.
                    </p>
                </div>

                {/* Right: Detail View */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-[var(--color-main)] uppercase">Detail Inspector</h2>
                    <DetailView item={selectedItem} />
                </div>

            </main>
        </div>
    );
}

export default App;
