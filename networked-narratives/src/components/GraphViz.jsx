import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export const GraphViz = ({ data, onNodeClick }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }
    }, [containerRef.current]);

    return (
        <div ref={containerRef} className="w-full h-full border border-deep-surface shadow-lg bg-[#1a1a1a] overflow-hidden rounded-lg">
            <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={data}
                nodeLabel="name"
                nodeColor={node => {
                    switch (node.type) {
                        case 'person': return '#8b5cf6'; // Violet
                        case 'place': return '#10b981'; // Emerald
                        case 'org': return '#f43f5e'; // Rose
                        default: return '#a3a3a3';
                    }
                }}
                nodeRelSize={6}
                linkColor={() => '#3a3a3a'}
                onNodeClick={onNodeClick}
                backgroundColor="#1a1a1a"
            />
        </div>
    );
};
