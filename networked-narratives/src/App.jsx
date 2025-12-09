import React, { useState, useMemo } from 'react';
import { Network, Share2, FileText, Search, Info } from 'lucide-react';
import { NLPProcessor } from './components/NLPProcessor';
import { GraphViz } from './components/GraphViz';

const App = () => {
  const [text, setText] = useState("During World War II, the French Resistance played a critical role against the Nazi occupation. Jean Moulin was sent by Charles de Gaulle from London to unite the various movements. In Lyon, Moulin organized the secret army to fight the Gestapo. The Allies coordinated with the Resistance before the invasion of Normandy. General Eisenhower later praised the efforts of the French forces in liberating Paris.");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);

  const processor = useMemo(() => new NLPProcessor(), []);

  const handleAnalyze = () => {
    const data = processor.process(text);
    setGraphData(data);
    setSelectedNode(null);
  };

  // Initial analysis on mount
  React.useEffect(() => {
    handleAnalyze();
  }, []);

  const renderHighlightedText = () => {
    if (!graphData.nodes.length) return text;

    // Create a map for fast lookup of entity types
    const entityMap = new Map();
    graphData.nodes.forEach(node => {
      entityMap.set(node.name.toLowerCase(), node.type);
    });

    // Escape regex special characters and sort by length (longest first) to handle substrings
    const escapedNames = graphData.nodes
      .map(n => n.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .sort((a, b) => b.length - a.length);

    if (escapedNames.length === 0) return text;

    const regex = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase();
      if (entityMap.has(lowerPart)) {
        const type = entityMap.get(lowerPart);
        const colorClass = type === 'person' ? 'bg-[var(--color-main-secondary)] text-[var(--color-main)]' :
          type === 'place' ? 'bg-[var(--color-alt)] text-[var(--color-main)]' :
            'bg-[#ff4d4d] text-white';

        return (
          <span key={i} className={`${colorClass} px-1 rounded font-bold border border-[var(--color-main)] mx-0.5`}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-8 font-sans selection:bg-[var(--color-main)] selection:text-white">
      <header className="mb-8 border-b-4 border-[var(--color-main)] pb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter mb-2 flex items-center justify-center gap-3 text-[var(--color-main)] uppercase">
          <Share2 className="w-10 h-10" />
          Networked Narratives
        </h1>
        <p className="text-[var(--color-text)] text-lg max-w-2xl mx-auto opacity-80">
          Simulating relationality. Transforming linear narratives into <span className="text-[var(--color-main)] font-bold">dynamic networks</span> of entities and connections.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
        {/* Left Panel: Input & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="deep-panel p-6 flex-1 flex flex-col relative">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b-2 border-[var(--color-main)] pb-2">
              <FileText className="w-5 h-5" />
              Narrative Input
            </h2>

            <div className="flex-1 relative mb-4 overflow-hidden">
              {/* Toggle between Textarea and Highlighted View */}
              {graphData.nodes.length > 0 ? (
                <div
                  className="absolute inset-0 w-full h-full bg-white border-2 border-[var(--color-main)] p-4 text-[var(--color-text)] overflow-y-auto font-mono text-sm leading-relaxed shadow-inner whitespace-pre-wrap"
                  onClick={() => setGraphData({ nodes: [], links: [] })} // Click to edit
                >
                  {renderHighlightedText()}
                  <div className="absolute top-2 right-2 text-[10px] uppercase font-bold text-[var(--color-main)] opacity-50 bg-white px-1 border border-[var(--color-main)]">Click to Edit</div>
                </div>
              ) : (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-white border-2 border-[var(--color-main)] p-4 text-[var(--color-text)] focus:border-[var(--color-alt)] focus:outline-none resize-none font-mono text-sm leading-relaxed shadow-inner"
                  placeholder="Paste your text here..."
                />
              )}
            </div>

            <button
              onClick={handleAnalyze}
              className="deep-button w-full flex items-center justify-center gap-2"
            >
              <Network className="w-4 h-4" />
              {graphData.nodes.length > 0 ? "Re-Analyze Network" : "Analyze Network"}
            </button>
          </div>

          <div className="deep-panel p-6 bg-white shrink-0">
            <h3 className="text-sm font-bold mb-2 text-[var(--color-main)] uppercase tracking-wider flex items-center gap-2 border-b-2 border-[var(--color-alt)] pb-1">
              <Info className="w-4 h-4" />
              Epistemic Translation
            </h3>
            <p className="text-sm italic opacity-80">
              "We translate <strong>Linearity</strong> into <strong>Relationality</strong>. By extracting entities and their co-occurrences, we reveal the latent social graph hidden within the text."
            </p>
          </div>
        </div>

        {/* Right Panel: Visualization & Inspector */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          <div className="deep-panel flex-1 overflow-hidden relative border-4 border-[var(--color-main)] shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
            <div className="absolute top-4 left-4 z-10 bg-white/90 border-2 border-[var(--color-main)] p-2 text-xs font-bold uppercase text-[var(--color-main)]">
              {graphData.nodes.length} Entities • {graphData.links.length} Relations
            </div>
            <GraphViz
              data={graphData}
              onNodeClick={setSelectedNode}
            />
          </div>

          {/* Entity Inspector */}
          {selectedNode && (
            <div className="deep-panel p-4 shrink-0 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Search className="w-4 h-4 text-[var(--color-main)]" />
                    {selectedNode.name}
                  </h3>
                  <span className={`text-xs uppercase tracking-wider px-2 py-0.5 mt-1 inline-block border border-[var(--color-main)]
                    ${selectedNode.type === 'person' ? 'bg-[var(--color-main-secondary)] text-[var(--color-main)]' :
                      selectedNode.type === 'place' ? 'bg-[var(--color-alt)] text-[var(--color-main)]' :
                        'bg-[#ff4d4d] text-white'}`}>
                    {selectedNode.type}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--color-main)]">{selectedNode.val}</div>
                  <div className="text-xs uppercase font-bold opacity-70">Mentions</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
