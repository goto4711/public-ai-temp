import { useState, useMemo, useEffect } from 'react';
import { Share2, FileText, Search, Network } from 'lucide-react';
import { NLPProcessor } from './components/NLPProcessor';
import { GraphViz } from './components/GraphViz';
import { useSuiteStore } from '../../../stores/suiteStore';
import ToolLayout from '../../shared/ToolLayout';

const DEFAULT_TEXT = "During World War II, the French Resistance played a critical role against the Nazi occupation. Jean Moulin was sent by Charles de Gaulle from London to unite the various movements. In Lyon, Moulin organized the secret army to fight the Gestapo. The Allies coordinated with the Resistance before the invasion of Normandy. General Eisenhower later praised the efforts of the French forces in liberating Paris.";

const NetworkedNarratives = () => {
    const { dataset, activeItem } = useSuiteStore();
    const selectedItem = dataset.find(i => i.id === activeItem);

    const [text, setText] = useState(DEFAULT_TEXT);
    const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
    const [selectedNode, setSelectedNode] = useState<any>(null);

    const processor = useMemo(() => new NLPProcessor(), []);

    // Use selected text if available
    useEffect(() => {
        if (selectedItem?.type === 'text') {
            setText(selectedItem.content as string);
        }
    }, [selectedItem]);

    const handleAnalyze = () => {
        const data = processor.process(text);
        setGraphData(data);
        setSelectedNode(null);
    };

    // Initial analysis
    useEffect(() => {
        handleAnalyze();
    }, [text]);

    const renderHighlightedText = () => {
        if (!graphData.nodes.length) return text;

        const entityMap = new Map();
        graphData.nodes.forEach((node: any) => {
            entityMap.set(node.name.toLowerCase(), node.type);
        });

        const escapedNames = graphData.nodes
            .map((n: any) => n.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .sort((a: string, b: string) => b.length - a.length);

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

    const mainContent = (
        <div className="flex flex-col gap-6 h-full p-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-main flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            Relational Network
                        </h2>
                        <p className="text-xs text-text-muted">Interactive visualization of extracted entities</p>
                    </div>
                </div>
                <div className="flex-1 min-h-0 relative bg-[#D3D3D3]">
                    <GraphViz
                        data={graphData}
                        onNodeClick={setSelectedNode}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-48 flex flex-col overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-main">Annotated Narrative</h3>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1 text-text-muted">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-main-secondary)] border border-main"></span> Person
                        </span>
                        <span className="flex items-center gap-1 text-text-muted">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-alt)] border border-main"></span> Place
                        </span>
                        <span className="flex items-center gap-1 text-text-muted">
                            <span className="w-2 h-2 rounded-full bg-[#ff4d4d]"></span> Event
                        </span>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto text-sm leading-relaxed font-serif">
                    {renderHighlightedText()}
                </div>
            </div>
        </div>
    );

    const sideContent = (
        <div className="flex flex-col h-full gap-6 p-1">
            {/* Input Panel */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0">
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-wide text-text-muted">
                    <FileText className="w-4 h-4" />
                    Narrative Input
                </h2>

                {selectedItem?.type === 'text' && (
                    <div className="mb-3 px-3 py-2 bg-main/5 border border-main/20 rounded-lg flex items-center gap-2 text-main">
                        <FileText className="w-3 h-3" />
                        <span className="text-xs font-bold truncate">{selectedItem.name}</span>
                    </div>
                )}

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="dc-input flex-1 resize-none font-mono text-xs leading-relaxed p-3 mb-4"
                    placeholder="Enter narrative text..."
                />

                <button
                    onClick={handleAnalyze}
                    className="btn-primary w-full justify-center"
                >
                    <Network className="w-4 h-4" />
                    Extract Network
                </button>
            </div>

            {/* Stats Panel */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wide text-text-muted mb-3">Network Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-2xl font-black text-main">{graphData.nodes.length}</div>
                        <div className="text-[10px] uppercase font-bold text-text-muted">Entities</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-2xl font-black text-secondary">{graphData.links.length}</div>
                        <div className="text-[10px] uppercase font-bold text-text-muted">Relations</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ToolLayout
            title="Networked Narratives"
            subtitle="Extract and visualize entity relationships from text"
            mainContent={mainContent}
            sideContent={sideContent}
        />
    );
};

export default NetworkedNarratives;
