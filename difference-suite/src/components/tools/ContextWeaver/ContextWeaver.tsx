import { useState } from 'react';
import { Search, Info, FileText } from 'lucide-react';
import RadialViz from './components/RadialViz';
import ComparisonTable from './components/ComparisonTable';
import VectorInspector from './components/VectorInspector';
import { loadModel, processContexts } from './utils/ContextProcessor';
import { useSuiteStore } from '../../../stores/suiteStore';
import ToolLayout from '../../shared/ToolLayout';

const DEMO_CONTEXTS = [
    {
        name: "Historical Archive",
        color: "#5D4037",
        items: ["memory", "archive", "document", "witness", "testimony", "record", "evidence", "history", "past", "remembrance"]
    },
    {
        name: "Social Media",
        color: "#1976D2",
        items: ["viral", "engagement", "trending", "share", "post", "comment", "like", "follow", "community", "platform"]
    },
    {
        name: "Academic Analysis",
        color: "#D32F2F",
        items: ["theory", "methodology", "discourse", "critique", "interpretation", "framework", "analysis", "context", "meaning", "significance"]
    }
];

const ContextWeaver = () => {
    const { dataset, activeItem } = useSuiteStore();
    const selectedItem = dataset.find(i => i.id === activeItem);

    const [queryText, setQueryText] = useState("");
    const [contexts, setContexts] = useState(DEMO_CONTEXTS);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [selectedMatch, setSelectedMatch] = useState<any>(null);

    // Use selected text item as query if available
    const effectiveQuery = selectedItem?.type === 'text'
        ? (selectedItem.content as string).slice(0, 200) // Limit length
        : queryText;

    const handleAnalyze = async () => {
        const query = effectiveQuery.trim();
        if (!query) return;

        setLoading(true);
        setStatus("Loading model...");
        setSelectedMatch(null);

        try {
            await loadModel();
            setStatus("Analyzing contexts...");
            const analysisResults = await processContexts(query, contexts);
            setResults(analysisResults);
            setStatus("");
        } catch (error) {
            console.error(error);
            setStatus("Error analyzing contexts");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMatch = (match: any, queryVector: any, color: string) => {
        setSelectedMatch({
            text: match.text,
            vector: match.vector,
            queryVector: queryVector,
            color: color
        });
    };

    const mainContent = (
        <div className="flex flex-col gap-6 p-1">
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center flex-col gap-4 rounded-xl backdrop-blur-sm">
                    <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-mono text-xl text-main animate-pulse">{status}</p>
                </div>
            )}

            {/* Results */}
            {results.length > 0 ? (
                <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                    {/* Radial Visualization */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-main">Semantic Relationality</h2>
                            <p className="text-sm text-text-muted">
                                The same query maps to different nearest neighbors in each context.
                            </p>
                        </div>
                        <div className="p-6 flex justify-center">
                            <RadialViz queryText={effectiveQuery} results={results} />
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-main">Cross-Context Comparison</h2>
                        </div>
                        <div className="p-6">
                            <ComparisonTable
                                results={results}
                                onSelectMatch={handleSelectMatch}
                                selectedMatch={selectedMatch}
                            />
                        </div>
                    </div>

                    {/* Vector Inspector */}
                    {selectedMatch && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden scroll-mt-6" id="vector-inspector">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-main">Vector Inspector</h2>
                            </div>
                            <div className="p-6">
                                <VectorInspector
                                    queryVector={selectedMatch.queryVector}
                                    matchVector={selectedMatch.vector}
                                    matchText={selectedMatch.text}
                                    color={selectedMatch.color}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Empty State */
                !loading && (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                        <Info className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="text-lg text-text-muted max-w-md">
                            {effectiveQuery.trim()
                                ? 'Ready to analyze. Click "Analyze Across Contexts" to begin.'
                                : 'Enter text on the right or select a text item from your dashboard to begin analysis.'}
                        </p>
                    </div>
                )
            )}
        </div>
    );

    const sideContent = (
        <div className="flex flex-col h-full gap-6 p-1">
            {/* Query Section */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-wide text-text-muted">
                    <Search className="w-4 h-4" />
                    Query
                </h2>

                {selectedItem?.type === 'text' ? (
                    <div className="mb-4 p-3 bg-main/5 border border-main/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-main">
                            <FileText className="w-4 h-4" />
                            <span className="font-bold text-xs truncate">{selectedItem.name}</span>
                        </div>
                        <p className="text-xs text-text-muted line-clamp-3 italic">"{effectiveQuery}"</p>
                    </div>
                ) : (
                    <div className="flex gap-4 mb-4">
                        <textarea
                            value={queryText}
                            onChange={(e) => setQueryText(e.target.value)}
                            placeholder="Enter text..."
                            className="dc-input resize-none h-24 text-sm"
                        />
                    </div>
                )}

                <button
                    onClick={handleAnalyze}
                    disabled={loading || !effectiveQuery.trim()}
                    className="btn-primary w-full justify-center"
                >
                    <Search className="w-4 h-4" />
                    Analyze
                </button>
            </div>

            {/* Contexts Overview */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-wide text-text-muted">
                    Active Contexts
                </h2>
                <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
                    {contexts.map((context, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded border-l-4" style={{ borderLeftColor: context.color }}>
                            <h3 className="font-bold text-xs mb-1" style={{ color: context.color }}>
                                {context.name}
                            </h3>
                            <p className="text-[10px] text-text-muted leading-relaxed">
                                {context.items.join(", ")}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <ToolLayout
            title="Context Weaver"
            subtitle="Analyze how meaning shifts across different semantic contexts"
            mainContent={mainContent}
            sideContent={sideContent}
        />
    );
};

export default ContextWeaver;
