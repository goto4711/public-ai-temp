import { useState } from 'react';
import { Search } from 'lucide-react';
import RadialViz from './components/RadialViz';
import ComparisonTable from './components/ComparisonTable';
import VectorInspector from './components/VectorInspector';
import { loadModel, processContexts } from './utils/ContextProcessor';

const DEMO_QUERY = "The use of insect metaphors to describe the group";

const DEMO_CONTEXTS = [
    {
        name: "Historical Archive (Holocaust)",
        color: "#5D4037", // Brown/Sepia
        items: ["dehumanization", "propaganda", "vermin", "exclusion", "state power", "genocide", "victim", "perpetrator", "ideology", "cleansing"]
    },
    {
        name: "Social Media Stream",
        color: "#1976D2", // Blue
        items: ["troll", "viral", "engagement", "moderation", "ban", "harassment", "toxicity", "meme", "community guidelines", "echo chamber"]
    },
    {
        name: "Legal / Tribunal",
        color: "#D32F2F", // Red
        items: ["evidence", "intent", "incitement", "protected speech", "prosecution", "defense", "judgment", "hate crime", "liability", "context"]
    }
];

function App() {
    const [queryText, setQueryText] = useState(DEMO_QUERY);
    const [contexts, setContexts] = useState(DEMO_CONTEXTS);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [selectedMatch, setSelectedMatch] = useState(null);

    const handleAnalyze = async () => {
        if (!queryText.trim()) return;

        setLoading(true);
        setStatus("Loading model...");
        setSelectedMatch(null); // Reset selection

        try {
            await loadModel();
            setStatus("Analyzing contexts...");
            const analysisResults = await processContexts(queryText, contexts);
            setResults(analysisResults);
            setStatus("");
        } catch (error) {
            console.error(error);
            setStatus("Error analyzing contexts");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMatch = (match, queryVector, color) => {
        setSelectedMatch({
            text: match.text,
            vector: match.vector,
            queryVector: queryVector,
            color: color
        });
    };

    return (
        <div className="min-h-screen p-8 flex flex-col gap-8">
            {/* ... (Header and Loading sections remain same) ... */}
            <header className="border-b-4 border-main pb-6">
                <h1 className="text-4xl font-bold text-main uppercase tracking-tighter">The Context Weaver</h1>
            </header>

            {loading && (
                <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center flex-col gap-4">
                    <div className="w-16 h-16 border-4 border-main border-t-alt rounded-full animate-spin"></div>
                    <p className="font-mono text-xl text-main animate-pulse">{status}</p>
                </div>
            )}

            {/* Query Section */}
            <section className="bg-white border-2 border-main p-6">
                <h2 className="text-xl font-bold text-main uppercase mb-4">Query Item</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        placeholder="Enter text to analyze across contexts..."
                        className="flex-1 px-4 py-2 border-2 border-main font-mono"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="flex items-center gap-2 bg-main text-white px-4 py-2 font-bold uppercase hover:opacity-90 transition-opacity"
                    >
                        <Search size={20} />
                        Analyze
                    </button>
                </div>
                <p className="text-sm opacity-70 mt-2">
                    This text will be compared across all contexts to show how meaning shifts
                </p>
            </section>

            {/* Contexts Overview */}
            <section className="grid grid-cols-3 gap-4">
                {contexts.map((context, i) => (
                    <div key={i} className="bg-white border-2 p-4" style={{ borderColor: context.color }}>
                        <h3 className="font-bold uppercase mb-2" style={{ color: context.color }}>
                            {context.name}
                        </h3>
                        <p className="text-sm opacity-70">{context.items.length} items</p>
                    </div>
                ))}
            </section>

            {/* Visualization */}
            {results.length > 0 && (
                <>
                    <section className="bg-white border-2 border-main p-6">
                        <h2 className="text-xl font-bold text-main uppercase mb-4">Semantic Relationality</h2>
                        <p className="text-sm opacity-70 mb-6">
                            The same query maps to different nearest neighbors in each context, revealing how meaning is relational
                        </p>
                        <RadialViz queryText={queryText} results={results} />
                    </section>

                    {/* Comparison Table */}
                    <section className="bg-white border-2 border-main p-6">
                        <h2 className="text-xl font-bold text-main uppercase mb-4">Cross-Context Comparison</h2>
                        <ComparisonTable
                            results={results}
                            onSelectMatch={handleSelectMatch}
                            selectedMatch={selectedMatch}
                        />
                    </section>

                    {/* Vector Inspector */}
                    {selectedMatch && (
                        <VectorInspector
                            queryVector={selectedMatch.queryVector}
                            matchVector={selectedMatch.vector}
                            matchText={selectedMatch.text}
                            color={selectedMatch.color}
                        />
                    )}

                    {/* Debug Info Removed */}
                </>
            )}

            {/* If no results yet */}
            {results.length === 0 && !loading && (
                <section className="bg-white border-2 border-main p-12 text-center">
                    <p className="text-lg text-main opacity-70">
                        Click "Analyze" to see how the query text relates to different contexts
                    </p>
                </section>
            )}
        </div>
    );
}

export default App;
